import keyStore from 'react-native-makkii-core';
import {getUnspentTx,broadcastTransaction} from './jsonrpc';
const sendTransaction = (account, symbol, to, value, extra_params, data, network='BTC')=>new Promise((resolve, reject) => {
    getUnspentTx(account.address, network).then(utxos=>{
       let tx = {
           amount: value.shiftedBy(8).toNumber(),
           change_address: account.address,
           to_address: to,
           byte_fee: 2,
           private_key: account.private_key,
           utxos: utxos,
           network: network,
       };
       keyStore.signTransaction(tx, keyStore.CoinType.fromCoinSymbol(account.symbol)).then(res=>{
           console.log("[btc+ltc sign resp]=>", res);
           broadcastTransaction(res.encoded,network).then(txid=>{
               let pendingTx = {
                   hash: txid,
                   from: account.address,
                   to: to,
                   value:value,
                   status: 'PENDING',
               };
               resolve({pendingTx});
           }).catch(e=>reject(e))
       })
    });
});

const getTransactionUrlInExplorer = (txHash, network = 'BTC') => `https://chain.so/tx/${network}/${txHash}`;

module.exports={
    sendTransaction,
    getTransactionUrlInExplorer
};
