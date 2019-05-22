import {getTransactionCount, sendSignedTransaction} from "./jsonrpc";
import {appendHexStart, toHex} from '../../utils';
import keyStore from "react-native-makkii-core";
import ApiCaller from "../../utils/http_caller";

const etherscan_apikey = 'W97WSD5JD814S3EJCJXHW7H8Y3TM3D2UK2';
const getEtherscanBaseUrl=(network)=> {
    if (network === 'mainnet') {
        return `https://api.etherscan.io/api`;
    } else {
        return `https://api-${network}.etherscan.io/api`
    }
}
function sendTransaction(account, symbol, to, value, gasPrice, gasLimit, data, network='mainnet') {
    return new Promise((resolve, reject) => {
        getTransactionCount(account.address, 'latest', network).then(count=> {
            console.log("private key:" + account.private_key);
            let tx = {
                chainID: toHex(3),
                amount: toHex(value.shiftedBy(18)),
                nonce: toHex(count),
                gasLimit: toHex(gasLimit),
                gasPrice: toHex(gasPrice),
                to: toHex(to),
                private_key: account.private_key,
            };
            keyStore.signTransaction(tx, 60).then(res=> {
                const {v, r, s, encoded} = res;
                console.log("sign result:");
                console.log("v:" +v + ",r=" + r + ",s=" + s);
                let encodedTx = appendHexStart(encoded);
                console.log("encoded eth tx => ", encodedTx);
                sendSignedTransaction(encodedTx, network).then(hash => {
                    let pendingTx = {
                        hash: hash,
                        from: account.address,
                        to: to,
                        value: value,
                        status: 'PENDING',
                    };
                    resolve({pendingTx});
                });
            }).catch(e=> {
                console.log("sign error:", e);
                reject(e);
            });
        }).catch(err=> {
            reject(err);
        });
    });
}

function getTransactionsByAddress(address, page, size, network='mainnet') {
    const url = getEtherscanBaseUrl(network) +
        `?module=account&action=txlist&address=${address}&page=${page}&offset=${size}&sort=asc&apikey=${etherscan_apikey}`;
    console.log("[eth http req] get transactions by address: " + url);
    return new Promise((resolve, reject)=>{
        ApiCaller.get(url, false).then(res => {
            console.log("[http resp]", res.data);
            const {result} = res.data;
            let txs = {};
            result.forEach(t => {
                let tx = {};
                tx.hash = t.hash;
                tx.timestamp = parseInt(t.timeStamp) * 1000;
                tx.from = t.from;
                tx.to = t.to;
                tx.value = new BigNumber(t.value, 10).shiftedBy(-18).toNumber();
                tx.status = t.isError === '0'? "CONFIRMED":"FAILED";
                tx.blockNumber = parseInt(t.blockNumber);
                txs[tx.hash] = tx;
            });
            resolve(txs);
        }, err=> {
            console.log("[http resp] err: ", err);
            reject(err);
        });
    });
}

function getTransactionUrlInExplorer(txHash, network='mainnet') {
    if (network === 'mainnet') {
        return `https://etherscan.io/tx/${txHash}`;
    } else {
        return `https://${network}.etherscan.io/tx/${txHash}`;
    }
}

module.exports = {
    sendTransaction,
    getTransactionsByAddress,
    getTransactionUrlInExplorer,
}