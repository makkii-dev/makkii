import Contract from "web3-eth-contract";
import AbiCoder from 'web3-eth-abi';
import {processRequest,getEndpoint} from './jsonrpc';
import ApiCaller from '../../utils/http_caller';
import axios from 'axios';

const ERC20ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
];
const fetchAccountTokenBalance = (contract_address, address, network) => new Promise((resolve, reject) => {
    const contract = new Contract(ERC20ABI);
    const requestData = processRequest('eth_call', [
        {to:contract_address, data:contract.methods.balanceOf(address).encodeABI()},
        'latest'
        ]);
    ApiCaller.post(getEndpoint(network),requestData, true).then(res=>{
        if(res.result){
            resolve(AbiCoder.decodeParameter('uint256',res.data.result))
        }else {
            reject('get account Balance failed:',res.error);
        }
    }).catch(e=>{
        reject('get account Balance failed:',e);
    })
});

const fetchTokenDetail = (contract_address, network) => new Promise((resolve, reject) => {
    console.log('try new contract ');
    const contract = new Contract(ERC20ABI);
    console.log('new contract ', contract.methods);
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
    axios.all([promiseSymbol,promiseName,promiseDecimals]).then(axios.spread(function (symbolRet, nameRet, decimalsRet) {
        if(symbolRet.data.result&&nameRet.data.result&&decimalsRet.data.result){
            console.log('[get token symobl resp]=>',symbolRet.data);
            console.log('[get token name resp]=>',nameRet.data);
            console.log('[get token decimals resp]=>',decimalsRet.data);
            const symbol = AbiCoder.decodeParameter('string', symbolRet.data.result);
            const name = AbiCoder.decodeParameter('string', nameRet.data.result);
            const decimals = AbiCoder.decodeParameter('uint8',decimalsRet.data.result);
            resolve({contractAddr:contract_address,symbol,name,decimals})
        }else {
            reject("get token detail failed");
        }
    })).catch(e=>{
        reject("get token detail failed",e);
    })
});

module.exports = {
    ERC20ABI,
    fetchAccountTokenBalance,
    fetchTokenDetail,
};