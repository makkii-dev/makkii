import ApiCaller from '../../utils/http_caller';
import {base58check2HexString} from '../../utils/crypto/crypto';

const getEndpoint = (network) => {
    if (network === 'mainnet') {
        return 'https://api.trongrid.io';
    } else if (network === 'shasta') {
        return 'https://api.shasta.trongrid.io';
    }
}

const getBalance = (address, network = 'mainnet') => new Promise((resolve, reject)=>{
    const url = getEndpoint(network) + '/wallet/getaccount';
    let hexAddress = base58check2HexString(address);
    let body = {
        "address": hexAddress,
    };
    let promise = ApiCaller.post(url, body, true, {'Content-Type': 'application/json'});
    console.log("[tron http req] " + url);
    console.log("[tron http req] body:",body);
    promise.then((res)=> {
        console.log("[tron http resp] ", res.data);
        console.log("typeof: " + typeof res.data);
        if (network === 'shasta') {
            if (res.data.Error !== undefined) {
                reject(res.data.Error);
            } else if (res.data.balance !== undefined) {
                resolve(new BigNumber(res.data.balance).shiftedBy(-6));
            } else {
                resolve(new BigNumber(0));
            }
        } else {

        }
    });
});

const validateAddress=(address, network='mainnet') => new Promise((resolve, reject) => {
    const url = getEndpoint(network) + '/wallet/validateaddress';
    let body = {
        "address": address,
    };
    let promise = ApiCaller.post(url, body, true, {'Content-Type': 'application/json'});
    console.log("[tron http req] " + url);
    console.log("[tron http req] body:", body);
    promise.then((res)=> {
        console.log("[tron http resp] ", res.data);
        if (network === 'shasta') {
            resolve(res.data.result);
        } else {

        }
    });
});

const getLatestBlock=(network='mainnet') => new Promise((resolve, reject)=> {
    const url = getEndpoint(network) + '/wallet/getnowblock';
    let promise = ApiCaller.post(url, {}, true, {'Content-Type': 'application/json'});
    console.log("[tron http req] " + url);
    promise.then((res)=> {
        console.log("[tron http resp] ", res.data);
        if (network === 'shasta') {
            resolve(res.data);
        } else {

        }
    });
});

const broadcastTransaction=(tx, network='mainnet') => new Promise((resolve, reject)=> {
    const url = getEndpoint(network) + '/wallet/broadcasttransaction';
    let promise = ApiCaller.post(url, tx, true, {'Content-Type': 'application/json'});
    console.log("[tron http req] " + url);
    promise.then((res)=> {
        console.log("[tron http resp] ", res.data);
        if (network === 'shasta') {
            resolve(res.data);
        } else {

        }
    });
});

const getTransactionsByAddress= (address, page, size, network='mainnet') => new Promise((resolve, reject)=> {
    resolve({});
});


module.exports = {
    getBalance,
    getTransactionsByAddress,
    validateAddress,
    getLatestBlock,
}