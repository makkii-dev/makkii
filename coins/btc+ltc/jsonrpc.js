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
                    amount:new BigNumber(tx.value).shiftedBy(8).toNumber(),
                    hash:tx.txid,
                    index:tx.output_no,
                })
            });
            console.log(`[${network} http resp] get_tx_unspent[${address}]=>`, utxos);
            resolve(utxos)
        }
    }).catch(e=>{
        reject(e)
    })
});

const broadcastTransaction = (tx_hex, network)=> new Promise((resolve, reject) => {
    const url = `${baseurl}/send_tx/${network}`;
    console.log(`[${network} http req] send_tx`, tx_hex);
    let promise = ApiCaller.post(url,{tx_hex: tx_hex}, false);
    promise.then(res=>{
        const {data} = res;
        console.log(`[${network} http resp] send_tx`, data);
        if(data.status&&data.status === 'fail'){
            reject("send tx reject")
        }else {
            const {txid} = data.data;
            resolve(txid)
        }
    }).catch(e=>{
        reject(e)
    })
});

const getBlockByHash = (blockhash, network='BTC') => new Promise((resolve, reject) => {
    const url = `${baseurl}/get_block/${network}/${blockhash}`;
    console.log(`[${network} http req]  get_block `, blockhash);
    ApiCaller.get(url).then(res=>{
        const {data} = res;
        console.log(`[${network} http resp]  get_block `, data);
        if(data.status&&data.status === 'success'){
            resolve(data.data)
        }else {
            reject('get block error');
        }
    }).catch(e=>reject(e))
});

const getTransactionStatus= (txId, network='BTC') => new Promise((resolve, reject) => {
   const url =  `${baseurl}/get_tx/${network}/${txId}`;
   console.log(`[${network} http req]  get_tx `, txId);
   ApiCaller.get(url).then(res=>{
       const {data} = res;
       console.log(`[${network} http resp]  get_tx `, data);
       if(data.status&&data.status === 'success'){
            const {blockhash, time:timestamp} = data.data;
            getBlockByHash(blockhash, network).then(block=>{
                const {block_no} = block;
                resolve({
                    status: true,
                    blockNumber: block_no,
                    timestamp: timestamp*1000,
                })
            }).catch(e=>resolve())
       }else if (data.status&&data.status === 'fail'){
           resolve({
               status:false,
           })
       }else {
           reject('get tx error')
       }
   }).catch(e=>{
       reject(e)
   });
});


const getTransactionsByAddress= (address, page, size, network='BTC')=> new Promise((resolve, reject) => {
    const url =  `${baseurl}/address/${network}/${address}`;
    ApiCaller.get(url).then(res=>{
        const {data} = res;
        if (data.status&&data.status === 'success'){
            const {txs: getTxs} = data.data;
            let txs = {};
            getTxs.forEach(t=>{
                let tx = {};
                tx.hash = t.txid;
                tx.timestamp = t.time * 1000;
                tx.blockNumber = t.block_no;
                tx.status = "CONFIRMED";
                const {incoming, outgoing} = t;
                if(outgoing === undefined){
                    tx.to = address;
                    tx.value = incoming.value + 0;
                    let from = {};
                    const {inputs} = incoming;
                    inputs.forEach(i=>{
                        from[i.address] = from[i.address] ===undefined?0:from[i.address]+1;
                    });
                    tx.from = Object.keys(from)[0];
                }else{
                    tx.from = address;
                    tx.value = 0;
                    let to ={};
                    const {outputs} = outgoing;
                    outputs.forEach(o=>{
                        if(o.address!==address) {
                            tx.value += o.value;
                            to[o.address] = to[o.address] ===undefined?0:to[o.address]+1;
                        }
                    });
                    tx.to = Object.keys(to)[0];
                }
                txs[tx.hash] = tx;
            });
            resolve(txs);
        }else {
            reject('get txs error')
        }
    }).catch(e=>{
        reject('get txs error')
    })
});




module .exports = {
    getBalance,
    getTransactionsByAddress,
    getUnspentTx,
    broadcastTransaction,
    getTransactionStatus
};
