// Declare ABI for token contract
import {fetchRequest} from './index';
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
    const url = `https://${network}-api.aion.network/aion/dashboard/getAccountDetails?accountAddress=${address}`;
    fetchRequest(url,'GET').then(json=>{
        let res = {};
        if(json.content.length>0){
            const {tokens} =json.content[0];
            tokens.forEach(token=>{
                res[token.symbol] ={
                    symbol : token.symbol,
                    contractAddr: token.contractAddr,
                    name: token.name,
                    tokenDecimal: token.tokenDecimal,
                }
            })
        }
        resolve(res)
    }).catch(err=>{
        reject(err)
    })
}
function fetchAccountTokenBalance(address, contract_address){
    return new Promise((resolve, reject) => {
        const token_contract = web3.eth.Contract(CONTRACT_ABI, contract_address);
        token_contract.methods.balanceOf(address).call({}).then(res=>{
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    });
}

module.exports = {
    CONTRACT_ABI,
    fetchAccountTokens,
    fetchAccountTokenBalance
};
