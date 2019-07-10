// Declare ABI for token contract
import {fetchRequest} from '../../utils/others';
import BigNumber from "bignumber.js";
import Contract from "aion-web3-eth-contract";
import AbiCoder from 'aion-web3-eth-abi';
import {getEndpoint, processRequest} from "./jsonrpc";
import ApiCaller from "../../utils/http_caller";
import axios from "axios";
import Config from 'react-native-config';
import {hexToAscii} from '../../utils';

const CONTRACT_ABI = [
    {
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
        constant: true,
        payable: false,
        inputs: [],
        name: 'name',
        type: 'function',
    },
    {
        outputs: [
            {
                name: '',
                type: 'uint8',
            },
        ],
        constant: true,
        payable: false,
        inputs: [],
        name: 'decimals',
        type: 'function',
    },
    {
        outputs: [
            {
                name: '',
                type: 'uint128',
            },
        ],
        constant: true,
        payable: false,
        inputs: [],
        name: 'totalSupply',
        type: 'function',
    },
    {
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
        constant: true,
        payable: false,
        inputs: [],
        name: 'symbol',
        type: 'function',
    },
    {
        outputs: [{ name: '', type: 'uint128' }],
        constant: true,
        payable: false,
        inputs: [],
        name: 'granularity',
        type: 'function',
    },
    {
        outputs: [
            {
                name: '',
                type: 'uint128',
            },
        ],
        constant: true,
        payable: false,
        inputs: [
            {
                name: '_tokenHolder',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        type: 'function',
    },
    {
        outputs: [],
        constant: false,
        payable: false,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_amount', type: 'uint128' },
            { name: '_userData', type: 'bytes' },
        ],
        name: 'send',
        type: 'function',
    },

    {
        outputs: [],
        constant: false,
        payable: false,
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_amount', type: 'uint128' },
            { name: '_userData', type: 'bytes' },
            { name: '_operatorData', type: 'bytes' },
        ],
        name: 'operatorSend',
        type: 'function',
    },
    {
        outputs: [{ name: 'success', type: 'bool' }],
        constant: false,
        payable: false,
        inputs: [{ name: '_to', type: 'address' }, { name: '_amount', type: 'uint128' }],
        name: 'transfer',
        type: 'function',
    },
];

function fetchAccountTokens(address, network){
    return new Promise((resolve, reject) => {
        const url = `https://${network}-api.aion.network/aion/dashboard/getAccountDetails?accountAddress=${address.toLowerCase()}`;
        fetchRequest(url, 'GET').then(json => {
            let res = {};
            if (json.content.length > 0) {
                const {tokens} = json.content[0];
                tokens.forEach(token => {
                    res[token.symbol] = {
                        symbol: token.symbol,
                        contractAddr: token.contractAddr,
                        name: token.name,
                        tokenDecimal: token.tokenDecimal,
                        balance: new BigNumber(0),
                        tokenTxs: {}
                    }
                })
            }
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    });
}


const fetchAccountTokenBalance = (contract_address, address, network) => new Promise((resolve, reject) => {
    const contract = new Contract(CONTRACT_ABI);
    const requestData = processRequest('eth_call', [
        {to:contract_address, data:contract.methods.balanceOf(address).encodeABI()},
        'latest'
    ]);
    console.log('[AION get token balance req]:',getEndpoint(network));

    ApiCaller.post(getEndpoint(network),requestData, true).then(res=>{
        if(res.data.result){
            resolve(new BigNumber(AbiCoder.decodeParameter('uint128',res.data.result)))
        }else {
            reject('get account Balance failed:',res.data.error);
        }
    }).catch(e=>{
        reject('get account Balance failed:',e);
    })
});

const fetchTokenDetail = (contract_address, network) => new Promise((resolve, reject) => {
    const contract = new Contract(CONTRACT_ABI);
    const requestGetSymbol = processRequest('eth_call', [
        {to:contract_address, data:contract.methods.symbol().encodeABI()},
        'latest'
    ]);
    const requestGetName = processRequest('eth_call', [
        {to:contract_address, data:contract.methods.name().encodeABI()},
        'latest'
    ]);
    const requestGetDecimals = processRequest('eth_call', [
        {to:contract_address, data:contract.methods.decimals().encodeABI()},
        'latest'
    ]);
    const url = getEndpoint(network);
    let promiseSymbol = ApiCaller.post(url, requestGetSymbol, true);
    let promiseName = ApiCaller.post(url, requestGetName, true);
    let promiseDecimals = ApiCaller.post(url, requestGetDecimals, true);
    console.log('[AION get token detail req]:', getEndpoint(network));
    axios.all([promiseSymbol,promiseName,promiseDecimals]).then(axios.spread(function (symbolRet, nameRet, decimalsRet) {
        if(symbolRet.data.result&&nameRet.data.result&&decimalsRet.data.result){
            console.log('[get token symobl resp]=>',symbolRet.data);
            console.log('[get token name resp]=>',nameRet.data);
            console.log('[get token decimals resp]=>',decimalsRet.data);
            let symbol, name;
            try {
                symbol = AbiCoder.decodeParameter('string', symbolRet.data.result);
            } catch (e) {
                symbol = hexToAscii(symbolRet.data.result);
                symbol = symbol.slice(0, symbol.indexOf('\u0000'));
            }
            try {
                name = AbiCoder.decodeParameter('string', nameRet.data.result);
            } catch (e) {
                name = hexToAscii(nameRet.data.result);
                name = name.slice(0, name.indexOf('\u0000'));
            }
            const decimals = AbiCoder.decodeParameter('uint8',decimalsRet.data.result);
            resolve({contractAddr:contract_address,symbol,name,decimals})
        }else {
            reject("get token detail failed");
        }
    })).catch(e=>{
        reject("get token detail failed"+e);
    });
});

function fetchAccountTokenTransferHistory(address, symbolAddress, network, page=0, size=25){
    return new Promise((resolve, reject) => {
        const url = `https://${network}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address.toLowerCase()}&tokenAddress=${symbolAddress.toLowerCase()}&page=${page}&size=${size}`;
        console.log("get account token transactions: " + url);
        fetchRequest(url,"GET").then(res=>{
            const {content} = res;
            let txs = {};
            content.forEach(t=>{
                let tx={};
                tx.hash = '0x'+t.transactionHash;
                tx.timestamp = t.transferTimestamp * 1000;
                tx.from = '0x'+t.fromAddr;
                tx.to = '0x'+t.toAddr;
                tx.value = new BigNumber(t.tknValue,10).toNumber();
                tx.status = 'CONFIRMED';
                tx.blockNumber = t.blockNumber;
                txs[tx.hash]=tx;
            });
            resolve(txs)
        }).catch(err=>{
            reject(err)
        })
    })
}

const getTopTokens=(topN=20, network='mainnet') => {
    return new Promise((resolve, reject) => {
        let url = `${Config.app_server_api}/token/aion?offset=0&limit=${topN}`;
        console.log("get top aion tokens: " + url);
        ApiCaller.get(url, false).then(res=>{
            resolve(res.data);
        }).catch(err => {
            console.log("get aion top tokens error:", err);
            reject(err);
        });
        // let url = `https://${network}-api.aion.network/aion/dashboard/getTokenList?page=0&size=${topN}`;
        // console.log("get top aion tokens:" + url);
        // ApiCaller.get(url, false).then(res=> {
        //     resolve(res.data.content);
        // }).catch(err=> {
        //     console.log("get top aion tokens error:", err);
        //     reject(err);
        // });
    });
}

const searchTokens=(keyword, network='mainnet') => {
    return new Promise((resolve, reject) => {
        let url = `${Config.app_server_api}/token/aion/search?keyword=${keyword}`;
        console.log("search aion token: " + url);
        ApiCaller.get(url, false).then(res=>{
            resolve(res.data);
        }).catch(err => {
            console.log("search aion token error:", err);
            reject(err);
        });
        // validateAddress(keyword, network).then(validateResult => {
        //     if (validateResult) {
        //         let url = `https://${network}-api.aion.network/aion/dashboard/getTokenDetailsTransfersAndHoldersByContractAddress?searchParam=${keyword}`;
        //         console.log("search aion tokens: " + url);
        //         ApiCaller.get(url, false).then(res=> {
        //             resolve(res.data.content);
        //         }).catch(err=> {
        //             console.log("search aion token by contract address error:", err);
        //             reject(err);
        //         });
        //     } else {
        //         let url = `https://${network}-api.aion.network/aion/dashboard/getTokenListByTokenNameOrTokenSymbol?searchParam=${keyword}`;
        //         console.log("search aion tokens: " + url);
        //         ApiCaller.get(url, false).then(res=> {
        //             console.log("search token by name/symbol resp:", res);
        //             resolve(res.data.content);
        //         }).catch(err=> {
        //             console.log("search aion token by name or symbol error:", err);
        //             reject(err);
        //         });
        //     }
        // });
    });
};

module.exports = {
    CONTRACT_ABI,
    fetchAccountTokens,
    fetchAccountTokenBalance,
    fetchAccountTokenTransferHistory,
    fetchTokenDetail,
    getTopTokens,
    searchTokens
};
