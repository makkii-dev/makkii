import {getTxsStatus} from "../services/txListenerService";
import {update_account_token_txs, update_account_txs} from "../actions/accounts";
import {accountKey} from "../utils";
import {createAction} from "../utils/dva";
import {Storage} from "../utils/storage";

export default {
    namespace: 'txsListener',
    state: {
        /*
           tx :{
             tx1.hash:{
               'txObj': tx1,
               'type': 'token'/'exchange'/'approve'/'normal'.
               'token': null/{symbol:'MAK',tokenTx}, //optional, when type is token
               'exchange': {srcToken:'ETH',destToken:'BAT', srcQty:1.0, destQty:2}, //optional
               'listenerStatus': 'waitReceipt'/blockNumber
             ` 'symbol': 'ETH'/'AION'/'TRX'
             },
             ....
           }

         */
        txs: {},
    },
    reducers: {
        addPendingTxs(state, {payload}) {
            console.log('add pending tx=>', payload);
            const {txObj, type, token, exchange, symbol} = payload;
            let tx = {
                txObj: txObj,
                type: type,
                listenerStatus: 'waitReceipt',
                symbol: symbol,
            };
            'token' === type ?
                tx = {...tx, token: token}
                : 'exchange' === type ?
                tx = {...tx, exchange: exchange}
                : null;
            state.txs[txObj.hash] = tx;
            return Object.assign({}, state);
        },
        updatePendingTxs(state, {payload}) {
            const {newStatuses} = payload;
            /*
                array of {newTx, symbol, listenerStatus}
             */
            let newState = Object.assign({}, state);
            newStatuses.forEach(newStatus => {
                const {newTx, symbol, listenerStatus} = newStatus;
                if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED') {
                    delete newState.txs[newTx.hash]
                } else {
                    let temp = newState.txs[newTx.hash];
                    temp.txObj = newTx;
                    temp.listenerStatus = listenerStatus;
                    newState.txs[newTx.hash] = temp;
                }
            });
            return newState;
        },
        txsListenerUpdateState(state,{payload}){
            return {...state,...payload};
        }
    },
    effects: {
        *loadStorage(action,{call,put}){
            const PendingTxs = yield call(Storage.get, 'pendingTx', false);
            console.log('load pending Tx from storage => ', PendingTxs);
            yield put(createAction('txsListenerUpdateState')({ txs:PendingTxs }));
        },
        *checkAllTxs(action, {call,put,select}) {
            console.log('check all pending Tx;');
            const txs = yield select(({txsListener}) => txsListener.txs);
            //save current pending tx;
            yield call(Storage.set, 'pendingTx', txs);
            const hashed_password = yield select(({user})=> user.hashed_password);
            const oldStatuses = Object.values(txs).map(tx => ({
                oldTx: tx.txObj,
                symbol: tx.symbol,
                listenerStatus: tx.listenerStatus
            }));
            if(oldStatuses.length>0) {
                const newStatuses = yield call(getTxsStatus, oldStatuses);
                for (let newStatus of newStatuses) {
                    const {newTx, symbol, listenerStatus} = newStatus;
                    if (listenerStatus === 'CONFIRMED' || listenerStatus === 'FAILED') {
                        console.log(`tx:[${newTx.hash}] => ${listenerStatus}`);
                        //dispatch other actions;
                        const type = txs[newTx.hash].type;
                        yield put((update_account_txs(accountKey(symbol, newTx.from), {[newTx.hash]: newTx}, hashed_password)));
                        yield put((update_account_txs(accountKey(symbol, newTx.to), {[newTx.hash]: newTx}, hashed_password)));
                        if ('token' === type) {
                            const {symbol: tokenSymbol, tokenTx} = txs[newTx.hash].token;
                            let newTokenTx = Object.assign({}, tokenTx);
                            newTokenTx.timestamp = newTx.timestamp;
                            newTokenTx.status = newTx.status;
                            yield put((update_account_token_txs(accountKey(symbol, newTx.from), {[tokenTx.hash]: newTokenTx}, tokenSymbol, hashed_password)));
                            yield put((update_account_token_txs(accountKey(symbol, newTx.from), {[tokenTx.hash]: newTokenTx}, tokenSymbol, hashed_password)));
                        }
                    }
                }
                yield put(createAction('updatePendingTxs')({newStatuses: newStatuses}))
            }

        }
    }
}