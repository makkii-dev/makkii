import keyStore from 'react-native-makkii-core';
import {getUnspentTx,broadcastTransaction} from './jsonrpc';
const sendTransaction = (account, symbol, to, value, extra_params, data, network='BTC')=>new Promise((resolve, reject) => {
    getUnspentTx(account.address, network).then(utxos=>{
       let tx = {
           amount: value.shiftedBy(8),
           change_address: account.address,
           to_address: to,
           byte_fee: 1,
           private_key: account.private_key,
           utxos: utxos
       };
       keyStore.signTransaction(tx, keyStore.CoinType[this.account.symbol]).then(res=>{
           console.log("[btc+ltc sign resp]=>", res);
           broadcastTransaction(res,network).then(txid=>{
               let pendingTx = {
                   hash: txid,
                   from: account.address,
                   to: to,
                   value:value,
                   status: 'PENDING',
               };
               resolve({pendingTx});
           })
       })
    });
});

module.exports={
    sendTransaction
};
