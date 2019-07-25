import BigNumber from 'bignumber.js';
import {getTransactionsByAddress,fetchAccountTokenTransferHistory, getBalance, fetchAccountTokenBalance} from "../coins/api";

const getTransactionsHistory = async (symbol, address, page, size)=> {
    try{
        return await getTransactionsByAddress(symbol, address, page, size);
    }catch (e) {
        console.log('getTransactionsHistory error=>',e);
        throw e;
    }
};

const getTransfersHistory = async (symbol, address, contractAddr, page, size) =>{
    try {
        return await fetchAccountTokenTransferHistory(symbol, address, contractAddr, null, page, size);
    }catch (e) {
        console.log('getTransfersHistory error=>',e);
        throw e;
    }
};

const getAccountOrTokenBalance = async (payload) =>{
    try {
        const {symbol, address, contractAddr, tokenDecimals} = payload;
        let balance;
        if(contractAddr){
            balance = await fetchAccountTokenBalance(symbol, contractAddr, address);
            balance  = BigNumber(balance).shiftedBy(-tokenDecimals||-18)
        }else{
            balance = await getBalance(symbol, address);
        }
        return {...payload, balance:balance};
    }catch (e) {
        console.log(e);
        return {...payload, balance:BigNumber(0)};
    }
};

const getAccountBalances = (payloads) =>{
    return Promise.all(payloads.map(p=>getAccountOrTokenBalance(p)))
};

/**
 * Check if the address has pending txs
 * @param pendingTxs
 * @param address
 * @returns {boolean}
 */
const pendingTxsInvolved = (pendingTxs, address)=>{
  for(let tx of Object.values(pendingTxs)){
      const {txObj} = tx;
      if(txObj.from === address || txObj.to === address){
          return true;
      }
  }
  return false;
};



export {
    getTransactionsHistory,
    getTransfersHistory,
    getAccountBalances,
    pendingTxsInvolved
}
