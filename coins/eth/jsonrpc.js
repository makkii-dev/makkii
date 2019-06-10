import ApiCaller from '../../utils/http_caller';

const getEndpoint = (network) => {
    return `https://${network}.infura.io/v3/64279947c29a4a8b9daf61f4c6c426b5`;
}

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

const getBlockByNumber = (blockNumber/*hex string*/, fullTxs = false, network='mainnet') => new Promise((resolve, reject) => {
    let requestData = processRequest('eth_getBlockByNumber', [blockNumber, fullTxs]);
    let promise = ApiCaller.post(getEndpoint(network), requestData, true, {'Content-Type': 'application/json'});
    console.log("[eth http req] eth_getBlockByNumber[" + blockNumber  + "," + fullTxs + "]");
    promise.then((res)=>{
        console.log("[eth http resp] ", res.data);
        if (res.data.error) reject(res.data.error);
        else resolve(res.data.result);
    });
});

const blockNumber = (network='mainnet') => new Promise((resolve, reject) => {
    let requestData = processRequest('eth_blockNumber', []);
    let promise = ApiCaller.post(getEndpoint(network), requestData, true, {'Content-Type': 'application/json'});
    console.log("[eth http req] eth_blockNumber[]");
    promise.then((res)=>{
        console.log("[eth http resp] ", res.data);
        if (res.data.error) reject(res.data.error);
        else resolve(res.data.result);
    });
});

const getBalance = (address, network='mainnet') => new Promise((resolve, reject) => {
    let params = [address.toLowerCase(), 'latest'];
    let requestData = processRequest('eth_getBalance', params);
    let promise = ApiCaller.post(getEndpoint(network), requestData, true, {'Content-Type': 'application/json'});
    console.log("[eth http req] eth_getBalance[" + address + ",  'latest']");
    promise.then((res)=>{
        console.log("[eth http resp] ",res.data);
        if (res.data.error) reject(res.data.error);
        else resolve(new BigNumber(res.data.result).shiftedBy(-18));
    });
});
const getTransactionCount = (address, blockTag, network) => new Promise((resolve, reject) => {
    let params = [address.toLowerCase(), checkBlockTag(blockTag)];
    let requestData = processRequest('eth_getTransactionCount', params);
    let promise = ApiCaller.post(getEndpoint(network), requestData, true, {'Content-Type': 'application/json'});
    console.log("[eth http req] eth_getTransactionCount[" + address + ", " + blockTag + "]");
    promise.then((res)=>{
        console.log("[eth http resp] ", res.data);
        if (res.data.error) reject(res.data.error);
        else resolve(res.data.result);
    }, err=> {
        console.log("[eth http error]", err);
        reject(err);
    });
});

const sendSignedTransaction = (signedTx, network='mainnet') => new Promise((resolve, reject) => {
    let params = [signedTx];
    let requestData = processRequest('eth_sendRawTransaction', params);
    console.log("send signed tx: " + getEndpoint(network));
    let promise = ApiCaller.post(getEndpoint(network), requestData, true, {'Content-Type': 'application/json'});
    console.log("[eth http req] eth_sendRawTransaction[" + signedTx + "]");
    promise.then((res)=>{
        console.log("[eth http resp] ", res.data);
        if (res.data.error) reject(res.data.error);
        else resolve(res.data.result);
    });
});

const getTransactionReceipt = (hash, network='mainnet') => new Promise((resolve, reject) => {
    let params = [hash];
    let requestData = processRequest('eth_getTransactionReceipt', params);
    let promise = ApiCaller.post(getEndpoint(network), requestData, true, {'Content-Type': 'application/json'});
    console.log(`[${network} eth http req] eth_getTransactionReceipt[${hash}]` );
    promise.then((res)=>{
        console.log("[eth http resp] ", res.data);
        if (res.data.error) reject(res.data.error);
        else resolve(res.data.result);
    });
});

const ETHERSCAN_URL_MAP = {
    ropsten: 'https://api-ropsten.etherscan.io',
    kovan: 'https://api-kovan.etherscan.io',
    rinkeby: 'https://api-rinkeby.etherscan.io',
    mainnet: 'https://api.etherscan.io'
};

module.exports = {
    ETHERSCAN_URL_MAP,
    getBlockByNumber,
    getTransactionReceipt,
    sendSignedTransaction,
    getTransactionCount,
    getBalance,
    blockNumber,
    processRequest,
    getEndpoint,
};
