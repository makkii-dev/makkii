import {update_account_txs, update_account_token_txs} from "../actions/accounts";
import {DeviceEventEmitter} from "react-native";
import Toast from "react-native-root-toast";
import {strings} from "../locales/i18n";
import {AionTransaction} from "../libs/aion-hd-wallet";
import {CONTRACT_ABI} from '../coins/aion/token';
import {fetchRequest} from './others';
import BigNumber from "bignumber.js";
import {getTransactionCount, sendSignedTransaction} from '../coins/api';

/***
 *
 * @param tx object
 * @param wallet
 * @param symbol
 * @param network
 * @returns {*}
 */
function sendTransaction(tx, wallet, symbol,network){
    if (symbol===wallet.symbol){
        return sendAionTransaction(tx, wallet)
    }else {
        return sendTokenTransaction(tx, wallet, symbol,network)
    }
}

function sendAionTransaction(tx, wallet){
    const {type, derivationIndex, private_key} = wallet;
    return new Promise((resolve, reject) => {
        getTransactionCount(wallet.symbol, tx.sender).then(count => {
            console.log('get transaction count: ', count);
            let pendingTx = new AionTransaction({
                ...tx,
                nonce: count,
            });
            let promise;
            try {
                console.log('wallet type: ', type);
                promise = type === '[ledger]'? pendingTx.signByLedger(derivationIndex) : pendingTx.signByECKey(private_key,425);
            }catch(e){
                console.log('sign transaction failed');
                throw (e)
            }
            promise.then(encoded =>{
                if(!encoded){
                    console.log('try get pending tx encoded');
                    encoded = pendingTx.getEncoded();
                }
                console.log('encoded => ',encoded);
                sendSignedTransaction(wallet.symbol, encoded).then(hash => {
                    resolve({hash, signedTransaction:pendingTx});
                });
            }).catch(err=>{
                reject(err)
            })
        }).catch(err=>{
            reject(err)
        })
    })
}

function sendTokenTransaction(tx, wallet, symbol, network){
    const tokens = wallet.tokens[network];
    const {contractAddr} = tokens[symbol];
    const token_contract = new web3.eth.Contract(CONTRACT_ABI, contractAddr);
    console.log("tokenValue", tx.tokenValue.toNumber());
    const methodsData = token_contract.methods.send(tx.tokenTo,tx.tokenValue.toFixed(0).toString(),"").encodeABI();
    let newtx = {
        ...tx,
        data: methodsData,
    };
    return sendAionTransaction(newtx,wallet)
}


class listenTransaction{
    constructor(store, timeOut=60*1000){
        this.txMap={};
        this.pendingMap = {};
        this.timeOut = timeOut;
        this.store = store;
    }
    hasPending() {
        return Object.keys(this.pendingMap).length > 0;
    }
    addTransaction(tx, symbol='AION'){
        let thusMap = this.txMap;
        let thusPendingMap = this.pendingMap;
        const thusTimeOut = this.timeOut;
        const thusStore = this.store;
        const {user, setting}= this.store.getState();
        const hashKey = tx.hash + "|" + symbol;
        if(typeof thusMap[hashKey] !== 'undefined')
            return;
        console.log('getting transaction ' + tx.hash + ' status');
        this.pendingMap[hashKey] = tx;
        let removeTransaction = function(tx){
            if(typeof thusMap[hashKey] !== 'undefined'){
                console.log('clear listener');
                clearInterval(thusMap[hashKey]);
                delete thusMap[hashKey];
            }
        };
        let start = Date.now();
        thusMap[hashKey]=setInterval(function(){
            if (Date.now() - start > thusTimeOut) {
                delete thusPendingMap[hashKey];
                console.log('timeout');
                removeTransaction(tx);
            }
            web3.eth.getTransactionReceipt(tx.hash).then(
                res=>{
                    if(res){
                        tx.blockNumber = res.blockNumber;
                        if (res.status === true) {
                            if (thusMap[hashKey]) {
                                let blockNumberInterval = setInterval(() => {
                                    web3.eth.getBlockNumber().then(
                                        number => {
                                            console.log('blockbumber: ', number);
                                            if (number > tx.blockNumber + 6) {
                                                delete thusPendingMap[hashKey];

                                                tx.status = 'CONFIRMED';
                                                if (symbol === 'AION') {
                                                    thusStore.dispatch(update_account_txs(tx.from, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                                    thusStore.dispatch(update_account_txs(tx.to, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                                } else {
                                                    thusStore.dispatch(update_account_token_txs(tx.from, {[tx.hash]: tx}, symbol, setting.explorer_server, user.hashed_password));
                                                    thusStore.dispatch(update_account_token_txs(tx.to, {[tx.hash]: tx}, symbol, setting.explorer_server, user.hashed_password));
                                                }
                                                DeviceEventEmitter.emit('updateAccountBalance');
                                                clearInterval(blockNumberInterval);
                                            }
                                        }
                                    )
                                }, 1000 * 5);
                            }
                        } else {
                            if (thusMap[hashKey]) {
                                delete thusPendingMap[hashKey];

                                tx.status = 'FAILED';
                                if (symbol === 'AION') {
                                    thusStore.dispatch(update_account_txs(tx.from, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                    thusStore.dispatch(update_account_txs(tx.to, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                } else {
                                    thusStore.dispatch(update_account_token_txs(tx.from, {[tx.hash]: tx}, symbol, setting.explorer_server, user.hashed_password));
                                    thusStore.dispatch(update_account_token_txs(tx.to, {[tx.hash]: tx}, symbol, setting.explorer_server, user.hashed_password));
                                }
                                DeviceEventEmitter.emit('updateAccountBalance');
                            }
                        }
                        removeTransaction(tx);
                    }
                },
                err=>{
                    Toast.show(strings('error_connect_remote_server'));
                    removeTransaction(tx);
                }
            )
        }, 5 * 1000);

    }
}

function fetchAccountTransactionHistory(address, network, page=0, size=25){
    return new Promise((resolve, reject) => {
        const url = `https://${network}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&page=${page}&size=${size}`;
        fetchRequest(url,"GET").then(res=>{
            const {content} = res;
            let txs = {};
            content.forEach(t=>{
                let tx={};
                tx.hash = '0x'+t.transactionHash;
                tx.timestamp = t.transactionTimestamp/1000;
                tx.from = '0x'+t.fromAddr;
                tx.to = '0x'+t.toAddr;
                tx.value = network==='mastery'?new BigNumber(t.value,10).toNumber():new BigNumber(t.value,16).shiftedBy(-18).toNumber();
                tx.status = t.txError === ''? 'CONFIRMED':'FAILED';
                tx.blockNumber = t.blockNumber;
                txs[tx.hash]=tx;
            });
            resolve(txs);
        }).catch(err=>{
            reject(err)
        })
    })
}


module.exports={
    sendTransaction:sendTransaction,
    listenTransaction:listenTransaction,
    fetchAccountTransactionHistory:fetchAccountTransactionHistory
};
