import {createAction, popCustom} from "../utils/dva";
import {sendAll} from "../coins/btc+ltc/core";
import {getAllBalance, parseScannedData, sendTx, validateTxObj} from "../services/txSenderService";
import {alert_ok} from "../components/common";
import {strings} from "../locales/i18n";
import {accountKey, getLedgerMessage} from "../utils";
import {sendTransferEventLog} from "../services/eventLogService";

const init= {
    to: '',
    amount: '',
    data: '',
    gasPrice: '',
    gasLimit: '',
    editable: true,
    txType:{},
};

export default {
    namespace: 'txSenderModel',
    state:init,
    reducers:{
        updateState(state, {payload}){
            console.log('payload=>',payload);
            return {...state, ...payload};
        }
    },
    effects:{
        *reset(action, {put}){
            yield put(createAction('updateState')(init))
        },
        *sendAll({payload},{call,select,put}){
            const {currentAccount} = yield select(mapToaccountsModel);
            const amount = yield call(getAllBalance, currentAccount, payload);
            yield put(createAction('updateState')({amount:amount}))
        },
        *parseScannedData({payload:{data}},{call, select, put}){
            console.log('data=>',data);
            const {currentAccount} = yield select(mapToaccountsModel);
            let ret = yield call(parseScannedData, data, currentAccount);
            if(ret.result){
                yield put(createAction('updateState')({...ret.data}));
            }
            return ret.result;
        },
        *validateTxObj({payload:{txObj}},{call,select, put}){
            const {currentAccount} = yield select(mapToaccountsModel);
            const ret = yield call(validateTxObj, txObj, currentAccount);
            if(!ret.result) {
                alert_ok(strings('alert_title_error'), strings('send.' + ret.err));
                return false;
            }else{
                return true;
            }
        },
        *sendTx({payload:{txObj}}, {call, select, put, take}){
            const {currentAccount} = yield select(mapToaccountsModel);
            const txType = yield select(({txSenderModel})=>txSenderModel.txType);
            const {address, symbol ,coinSymbol, type:accountType} = currentAccount;
            const {type,data} = txType;
            const ret = yield call(sendTx, txObj, currentAccount);
            if(ret.result){
                sendTransferEventLog(symbol, symbol===coinSymbol?null:coinSymbol, new BigNumber(txObj.amount));
                //dispatch tx to accountsModel;
                const {data:{pendingTx, pendingTokenTx}} = ret;
                const payloadTx= {
                    key: accountKey(symbol,address),
                    txs:{[pendingTx.hash]:pendingTx}
                };
                let payloadTxListener = {
                    txObj: pendingTx,
                    type: 'normal',
                    symbol: symbol,
                };
                yield put(createAction('accountsModel/updateTransactions')(payloadTx));
                if(pendingTokenTx){
                    const payload = {
                        key: accountKey(symbol, address, coinSymbol),
                        txs:{[pendingTokenTx.hash]:pendingTokenTx}
                    };
                    payloadTxListener = {
                        ...payloadTxListener,
                        type: 'token',
                        token: {symbol:coinSymbol,tokenTx:pendingTokenTx }
                    };
                    yield take('accountsModel/updateTransactions/@@end');
                    yield put(createAction('accountsModel/updateTransactions')(payload));
                }
                if(type&&type==='exchange'){
                    const payload = {
                        key: accountKey(symbol, address, 'ERC20DEX'),
                        txs:{[pendingTx.hash]:data}
                    };
                    payloadTxListener = {
                        ...payloadTxListener,
                        type: 'exchange',
                        exchange: data,
                    };
                    yield take('accountsModel/updateTransactions/@@end');
                    yield put(createAction('accountsModel/updateTransactions')(payload));
                }

                //dispatch tx to erc20dexModal
                if(type&&type==='approve'){
                    payloadTxListener = {
                        ...payloadTxListener,
                        type: 'approve',
                        approve: data,
                    };
                    yield put(createAction('ERC20Dex/updateTokenApproval')(data));
                }

                //dispatch tx to tx listener
                yield put(createAction('txsListener/addPendingTxs')(payloadTxListener));

                // reset txSenderModel
                yield put(createAction('reset')());
                return true;
            }else{
                const {error} = ret;
                if(error.message && accountType === '[ledger]'){
                    alert_ok(strings('alert_title_error'), getLedgerMessage(error.message));
                }else{
                    alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
                }
                return false;
            }
        }
    }
}



const mapToaccountsModel = ({accountsModel})=>{
    const {currentAccount:key, currentToken, accountsMap, tokenLists} = accountsModel;
    const {tokens,symbol} = accountsMap[key];
    const newtokens = Object.keys(tokens).reduce((map,el)=>{
        map[el]={
            balance: tokens[el],
            contractAddr: tokenLists[symbol][el].contractAddr,
            tokenDecimal: tokenLists[symbol][el].tokenDecimal,
        };
        return map;
    },{});
    const currentAccount = {
        ...accountsMap[key],
        coinSymbol: currentToken===''?accountsMap[key].symbol:currentToken,
        tokens: newtokens,
    };
    return ({
        currentAccount
    })
};

const mapToTxSenderModal = ({txSenderModel})=>({...txSenderModel});