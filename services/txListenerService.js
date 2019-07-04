import {getBlockByNumber, getBlockNumber, getTransactionStatus} from "../coins/api";
import {fromHexString} from "../utils";

const WAIT_BLOCKS = 2;
/***
 * @param txs //array of {oldTx, symbol, listenerStatus}
 * @returns {Promise<any[]>} array of {newtx, symbol, listenerStatus}
 */
const getTxsStatus = (txs)=>{
    return Promise.all(txs.map(tx=>getOneTxStatus(tx)));
};

/***
 * @param tx eg:{oldTx, symbol, listenerStatus}
 * @returns {Promise<any> | Promise<*>} {newTx, symbol, listenerStatus}
 */

const getOneTxStatus = async (tx)=>{
    const {oldTx, symbol, listenerStatus} = tx;
    try {
        let newTx = Object.assign({},oldTx);
        let newListenerStatus = listenerStatus;
        console.log(`tx[${oldTx.hash}] listenerStatus=>listenerStatus`);
        if('waitReceipt'===listenerStatus){
            const {status, blockNumber} = await getTransactionStatus(symbol, oldTx.hash);
            newTx.blockNumber = blockNumber;
            if(status){ // success
                newListenerStatus = blockNumber;
                if('TRX'===symbol){
                    newTx.status = 'CONFIRMED';
                    newListenerStatus = 'CONFIRMED'
                }
                return {newTx: newTx, symbol, listenerStatus:newListenerStatus};
            }else{ //failed
                newTx.status = 'FAILED';
                newListenerStatus = 'FAILED';
                if('ETH'===symbol){
                    try{
                        const {timestamp} = await getBlockByNumber(symbol,blockNumber);
                        newTx.timestamp = fromHexString(timestamp, 16) * 1000;
                    }catch{}
                }
                return {newTx: newTx, symbol, listenerStatus:newListenerStatus};
            }
        }else{
            const number = await getBlockNumber(symbol);
            if(number > newListenerStatus + WAIT_BLOCKS){ // confirm
                newTx.status = 'CONFIRMED';
                newListenerStatus = 'CONFIRMED';
                if('ETH'===symbol){
                    try{
                        const {timestamp} = await getBlockByNumber(symbol,newListenerStatus);
                        newTx.timestamp = fromHexString(timestamp, 16) * 1000;
                    }catch{}
                }
                return {newTx: newTx, symbol, listenerStatus:newListenerStatus};
            }else{// stay wait
                return {newTx:newTx, symbol, listenerStatus:newListenerStatus};
            }
        }
    }catch (e) {
        console.log('getOneTxStatus error',e);
        return {newTx:oldTx, symbol, listenerStatus};
    }
};

export {
    getTxsStatus,
}