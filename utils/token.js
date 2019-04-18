// Declare ABI for token contract
import {fetchRequest} from './others';
import BigNumber from "bignumber.js";
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
        const url = `https://${network}-api.aion.network/aion/dashboard/getAccountDetails?accountAddress=${address}`;
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
                    }
                })
            }
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    });
}

function fetchAccountTokenBalance(contract_address,address=""){
    const token_contract = new web3.eth.Contract(CONTRACT_ABI, contract_address);

    // fetch account balance
    return new Promise((resolve, reject) => {
        token_contract.methods.balanceOf(address).call({}).then(balance => {
            const ret = {token: obj, balance: balance};
            resolve(ret)
        }).catch(err => {
            reject(new Error('get account ' + address + 'balance failed'))
        });
    })
}

function fetchTokenDetail(contract_address){
    const token_contract = new web3.eth.Contract(CONTRACT_ABI, contract_address);
    return new Promise((resolve, reject) => {
        // fetch token symbol
        token_contract.methods.symbol().call({}).then(symbol=>{
            resolve({contractAddr:contract_address,symbol:symbol})
        }).catch(()=>{
            reject(new Error('get token symbol failed'))
        })
    }).then(obj=>{
        return new Promise((resolve, reject) => {
            // fetch token name
            token_contract.methods.name().call({}).then(name=>{
                obj = Object.assign(obj,{name:name});
                resolve(obj)
            }).catch(err=>{
                reject(new Error('get token name failed'))
            });
        })
    }).then(obj=>{
        return new Promise((resolve, reject) => {
            // fetch token decimals
            token_contract.methods.decimals().call({}).then(decimals=>{
                obj = Object.assign(obj,{tokenDecimal:decimals});
                resolve(obj)
            }).catch(err=>{
                reject(new Error('get token decimals failed'))
            });
        })
    });
}

function fetchAccountTokenTransferHistory(address, symbolAddress, network, page=0, size=25){
    return new Promise((resolve, reject) => {
        const url = `https://${network}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&tokenAddress=${symbolAddress}&page=${page}&size=${size}`;
        fetchRequest(url,"GET").then(res=>{
            const {content} = res;
            let txs = {};
            content.forEach(t=>{
                let tx={};
                tx.hash = '0x'+t.transactionHash;
                tx.timestamp = t.transferTimestamp;
                tx.from = '0x'+t.fromAddr;
                tx.to = '0x'+t.toAddr;
                tx.value = new BigNumber(t.value,10).toNumber();
                tx.status = 'CONFIRMED';
                tx.blockNumber = t.blockNumber;
                txs[tx.hash]=tx;
            });
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
}


module.exports = {
    CONTRACT_ABI,
    fetchAccountTokens,
    fetchAccountTokenBalance,
    fetchAccountTokenTransferHistory,
    fetchTokenDetail
};
