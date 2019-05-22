import {AionTransaction} from "./AionTransaction";
import {CONTRACT_ABI} from './token';
import BigNumber from "bignumber.js";
import {getTransactionCount, sendSignedTransaction} from './jsonrpc';
import ApiCaller from "../../utils/http_caller";

function sendNativeTx(account, to, value, gasPrice, gasLimit, data, network) {
    let tx = {
        sender: account.address,
        gasPrice: gasPrice,
        gas: gasLimit,
        to: to,
        value: value.shiftedBy(18),
        type: 1,
    };
    if (data !== undefined) {
        tx = { ...tx, data: data };
    }
    const {type, derivationIndex, private_key} = account;
    return new Promise((resolve, reject) => {
        getTransactionCount(account.address, 'pending', network).then(count => {
            let aionTx = new AionTransaction({
                ...tx,
                nonce: count
            });
            let promise;
            try {
                if (type === '[ledger]') {
                    promise = aionTx.signByLedger(derivationIndex);
                } else {
                    promise = aionTx.signByECKey(private_key);
                }
            } catch (err) {
                console.log("aion sign tx failed: ", e);
                throw (err);
            }
            promise.then(encoded =>{
                if(!encoded){
                    console.log('try get pending tx encoded');
                    encoded = aionTx.getEncoded();
                }
                console.log('encoded aion tx=> ',encoded);
                sendSignedTransaction(encoded, network).then(hash => {
                    let pendingTx = {
                        hash: hash,
                        timestamp: aionTx.timestamp.toNumber() / 1000,
                        from: account.address,
                        to: to,
                        value: value,
                        status: 'PENDING'
                    };
                    resolve({pendingTx, pendingTokenTx: undefined});
                }).catch(err=>{
                    console.log("aion send signed tx error:", err);
                    reject(err);
                });
            }).catch(err=>{
                console.log("aion sign tx error:", err);
                reject(err);
            })
        }).catch(err=> {
            console.log("aion get transaction count error: ", err);
            reject(err);
        });
    });
}

function sendTransaction(account, symbol, to, value, gasPrice, gasLimit, data, network='mainnet') {
    if (account.symbol === symbol) {
        return sendNativeTx(account, to, value, gasPrice, gasLimit, data, network);
    } else {
        return sendTokenTx(account, symbol, to, value, gasPrice, gasLimit, network);
    }
}

function sendTokenTx(account, symbol, to, value, gasPrice, gasLimit, network='mainnet'){
    const tokens = account.tokens[network];
    const {contractAddr, tokenDecimal} = tokens[symbol];

    // TODO: how to remove web3 here?
    const token_contract = new web3.eth.Contract(CONTRACT_ABI, contractAddr);
    const methodsData = token_contract.methods.send(to,value.shiftedBy(tokenDecimal + 0).toFixed(0).toString(),"").encodeABI();

    return new Promise((resolve, reject)=> {
        sendNativeTx(account, contractAddr, new BigNumber(0), gasPrice, gasLimit, methodsData).then(res=> {
            let pendingTx = res.pendingTx;
            let pendingTokenTx = {
                hash: pendingTx.hash,
                timestamp: pendingTx.timestamp,
                from: pendingTx.from,
                to: to,
                value: value,
                status: 'PENDING'
            };

            resolve({pendingTx, pendingTokenTx});
        }).catch(err => {
            reject(err);
        });
    });
}


function getTransactionsByAddress(address, page=0, size=25, network='mainnet'){
    const url = `https://${network}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&page=${page}&size=${size}`;
    console.log("[aion req] get aion transactions by address: " + url);
    return new Promise((resolve, reject) => {
        ApiCaller.get(url, false).then(res=>{
            console.log("[aion resp] res:", res.data);
            const {content} = res.data;
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

function getTransactionUrlInExplorer(txHash, network='mainnet') {
    return `https://${network}.aion.network/#/transaction/${txHash}`;
}

module.exports={
    sendTransaction,
    getTransactionsByAddress,
    getTransactionUrlInExplorer,
};
