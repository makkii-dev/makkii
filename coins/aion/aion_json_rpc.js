import ApiCaller from '../../utils/http_caller';

const MASTERY_ENDPOINT = 'https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=c8b8ebb4f10f40358b635afae72c2780';
let current_endpoint = MASTERY_ENDPOINT;

const checkBlockTag = (blockTag) => {
    if (blockTag == null) { return 'latest' }

    if (blockTag === 'earliest') { return '0x0' }

    if (blockTag === 'latest' || blockTag === 'pending') {
        return blockTag
    }

    if (typeof (blockTag) === 'number') {
        return `0x${new BigNumber(blockTag).toString(16)}`
    }

    throw new Error('invalid blockTag')
}

const processRequest = (methodName, params) => {
    const requestData = {
        method: methodName,
        params,
        id: 42,
        jsonrpc: '2.0'
    }

    return JSON.stringify(requestData)
}

export const aion_getBalance = (address, blockTag) => new Promise((resolve, reject) => {
    let params = [address.toLowerCase(), checkBlockTag(blockTag)];
    let requestData = processRequest('eth_getBalance', params);
    let promise = ApiCaller.post(current_endpoint, requestData, true, {'Content-Type': 'application/json'});
    console.log("[aion http req] eth_getBalance[" + address + ", " + blockTag + "]");
    return promise.then((res)=>{
        console.log("[aion http resp] ", res.data);
        if (res.data.error) return reject(res.data.error);
        return resolve(res.data.result);
    });
});

export const aion_getTransactionCount = (address, blockTag) => new Promise((resolve, reject) => {
    let params = [address.toLowerCase(), checkBlockTag(blockTag)];
    let requestData = processRequest('eth_getTransactionCount', params);
    let promise = ApiCaller.post(current_endpoint, requestData, true, {'Content-Type': 'application/json'});
    console.log("[aion http req] eth_getTransactionCount[" + address + ", " + blockTag + "]");
    return promise.then((res)=>{
        console.log("[aion http resp] ", res.data);
        if (res.data.error) return reject(res.data.error);
        return resolve(res.data.result);
    });
});

export const aion_sendSignedTransaction = (signedTx) => new Promise((resolve, reject) => {
    let params = [signedTx];
    let requestData = processRequest('eth_sendRawTransaction', params);
    let promise = ApiCaller.post(current_endpoint, requestData, true, {'Content-Type': 'application/json'});
    console.log("[aion http req] eth_sendRawTransaction[" + signedTx + "]");
    return promise.then((res)=>{
        console.log("[aion http resp] ", res.data);
        if (res.data.error) return reject(res.data.error);
        return resolve(res.data.result);
    });
});