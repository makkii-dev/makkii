import HttpClient from '../utils/http_caller';
import ApiCoder from 'web3-eth-abi';
import {getBlockNumber} from "../coins/api";
import {fromHexString} from "../utils";
const NETWORK_URL = {
    'mainnet': 'https://api.kyber.network',
    'ropsten': 'https://ropsten-api.kyber.network',
};
const padTo32 = (hexString)=>{
    if(hexString.startsWith('0x')){
        hexString = hexString.slice(2);
    }
    while(hexString.length<64){
        hexString = '0'+hexString;
    }
    return '0x'+hexString;
};
const getTokenList = async (network)=>{
    try {
        const url = `${NETWORK_URL[network]}/currencies`;
        console.log('[kyber req getTokenList]=>',url);
        const {data} = await HttpClient.get(url);
        const {data: tokens} = data;
        return tokens.reduce((map, el) => {
            map[el.symbol] = {
                name: el.name,
                address: el.address,
                decimals: el.decimals,
                reserves_src: el.reserves_src,
                reserves_dest: el.reserves_dest,
            };
            return map;
        }, {});
    }catch (e) {
        throw 'http request error:'+e;
    }
};

const getTokenTradeRate = async (sellToken, buyToken,network) =>{
    try{
        const url = `${NETWORK_URL[network]}/market`;
        console.log('[kyber req getTokenTradeRate]=>',url);
        const {data:rateResp} = await HttpClient.get(url);
        const {data} = rateResp;
        const rates = data.reduce((map,el)=>{
            map[el.pair] = {
                current_bid: el.current_bid,
                current_ask: el.current_ask,
            };
            return map;
        },{
            'ETH_ETH':{
                current_bid:1,
                current_ask:1
            }
        });
        //Assuming a 3% slippage rate,
        const rate = rates[`ETH_${sellToken}`].current_bid / rates[`ETH_${buyToken}`].current_ask *0.97;
        return rate.toFixed(6);
    }catch (e) {
        throw 'http request error:'+e;
    }
};

const genTradeData = async  (user_address, src_id, dst_id, src_qty, min_dst_qty, network)=>{
    try{
        const url = `${NETWORK_URL[network]}/trade_data?user_address=${user_address}&src_id=${src_id}&dst_id=${dst_id}&src_qty=${src_qty}&min_dst_qty=${min_dst_qty}&gas_price=medium`;
        console.log('[kyber req genTradeData]=>',url);
        const {data:tradeResp} = await HttpClient.get(url);
        return  tradeResp;
    }catch (e) {
        throw 'http request error:'+e;
    }
};

const getEnabledStatus = async (user_address, src_id, network)=>{
    try{
        const url = `${NETWORK_URL[network]}/users/${user_address}/currencies`;
        console.log('[kyber req genEnabledStatus]=>',url);
        const {data:enabledStatusResp} = await HttpClient.get(url);
        const {data} = enabledStatusResp;
        let txs_required = 0;
        for (let i = 0; i<data.length; i++){
            if(data[i].id === src_id){
                txs_required = data[i].txs_required;
            }
        }
        return txs_required;
    }catch (e) {
        throw 'http request error:'+e;
    }
};

const getApproveAuthorizationTx = async (user_id, token_id, network)=>{
    try{
        const url = `${NETWORK_URL[network]}/users/${user_id}/currencies/${token_id}/enable_data?gas_price=medium`;
        console.log('[kyber req getApproveAuthorizationTx]=>', url);
        const {data:ApproveAuthorizationTxResp} = await HttpClient.get(url);
        const {data} = ApproveAuthorizationTxResp;
        return  data;
    }catch (e) {
        throw 'http request error:'+e;
    }
};

const getExchangeHistory = async(user_id,network, txhash=undefined)=>{
    try{
        const base_url =  network === 'mainnet'? 'https://api.etherscan.io':'https://api-ropsten.etherscan.io';
        const latestBlock = await getBlockNumber('ETH');
        const fromBlock =  latestBlock - 100000;
        const url = `${base_url}/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&address=0x818e6fecd516ecc3849daf6845e3ec868087b755&topic0=0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39&topic0_1_opr=and&topic1=${padTo32(user_id)}`;
        console.log('[kyber req getExchangeHistory]=>', url);
        const {data:exchangeHistoryResp} = await HttpClient.get(url);
        const {result} = exchangeHistoryResp;
        const history = result.reduce((map,el)=>{
            const res = ApiCoder.decodeParameters(['address','address','uint256','uint256'],el.data);
            map[el.transactionHash]={
                srcToken: res[0],
                destToken: res[1],
                srcQty: res[2],
                destQty: res[3],
                timestamp:fromHexString(el.timeStamp,16)*1000,
                blockNumber: fromHexString(el.blockNumber,16),
                status: 'CONFIRMED',
                hash: el.transactionHash,
            };
            return map;
        },{});
        if(txhash===undefined){
            return history;
        }else {
            return history[txhash];
        }

    }catch (e) {
        throw 'http request error:'+e;
    }
};

const findSymbolByAddress = (tokenList, address)=>{
  for (let key of Object.keys(tokenList)){
      if(tokenList[key].address.toLowerCase()===address.toLowerCase()){
          return key;
      }
  }
  return null;
};


export {
    getTokenList,
    getTokenTradeRate,
    genTradeData,
    getEnabledStatus,
    getApproveAuthorizationTx,
    getExchangeHistory,
    findSymbolByAddress
}