import ApiCaller from '../../utils/http_caller';

const baseurl = 'https://chain.so/api/v2';

const getBalance = (address, network= 'BTC') => new Promise((resolve, reject) => {
    const url = `${baseurl}/get_address_balance/${network}/${address}`;
    let promise = ApiCaller.get(url);
    console.log(`[${network} http req] get_balance[${address}]`);
    promise.then(res=>{
        const {data} = res;
        console.log(`[${network} http resp]: `, data);
        if(data.status === 'fail'){
           reject("address invalid")
        }else {
            const {confirmed_balance,unconfirmed_balance} = data.data;
            const balance = new BigNumber(confirmed_balance);
            resolve(balance)
        }
    }).catch(e=>{
        reject(e)
    })

});

const getUnspentTx = (address, network = 'BTC')=> new Promise((resolve,reject)=>{
    const url = `${baseurl}/get_tx_unspent/${network}/${address}`;
    let promise = ApiCaller.get(url);
    console.log(`[${network} http req] get_tx_unspent[${address}]`);
    promise.then(res=>{
        const {data} = res;
        if(data.status === 'fail'){
            reject("get_tx_unspent reject")
        }else {
            const {txs} = data.data;
            let utxos = [];
            txs.forEach(tx=>{
                utxos.push({
                    script:tx.script_hex,
                    amount:new BigNumber(tx.value).shiftBy(8).toNumber(),
                    hash:tx.txid,
                    index:tx.output_no,
                })
            });
            resolve(txs)
        }
    }).catch(e=>{
        reject(e)
    })
});

const broadcastTransaction = (tx_hex, network)=> new Promise((resolve, reject) => {
    const url = `${baseurl}/send_tx/${network}`;
    let promise = ApiCaller.post(url,{tx_hex:tx_hex}, true);
    console.log(`[${network} http req] send_tx`);
    promise.then(res=>{
        const {data} = res;
        if(data.status&&data.status === 'fail'){
            reject("send tx reject")
        }else {
            const {txid} = data;
            resolve(txid)
        }
    }).catch(e=>{
        reject(e)
    })
});

const getTransactionsByAddress= (address, page, size, network='mainnet') => new Promise((resolve, reject)=> {
    resolve({});
});




module .exports = {
    getBalance,
    getTransactionsByAddress,
    getUnspentTx,
    broadcastTransaction
};
