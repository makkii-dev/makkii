import HttpClient from '../utils/http_caller';
import ApiCoder from 'web3-eth-abi';
import {getBlockNumber} from "../coins/api";
import {fromHexString} from "../utils";
import BigNumber from 'bignumber.js';

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
const ETHID = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const getTokenList = async (network)=>{
    try {
        // get all tokens market
        const marketUrl = `${NETWORK_URL[network]}/market`;
        console.log('[kyber req getTokenTradeRate]=>',marketUrl);
        const {data:rateResp} = await HttpClient.get(marketUrl);
        let rateData = rateResp.data;
        const rates = rateData.reduce((array,el)=>{
            if (el.current_bid !== 0 && el.current_ask !== 0) {
                array.push(el.base_symbol);
            } else {
                console.info("ignore token " + el.base_symbol + ":bid=" + el.current_bid + ", ask=" + el.current_ask);
            }
            return array;
        }, ['ETH']
        );

        const tokenListUrl = `${NETWORK_URL[network]}/currencies`;
        console.log('[kyber req getTokenList]=>',tokenListUrl);
        const {data} = await HttpClient.get(tokenListUrl);
        let tokens = data.data;

        return tokens.reduce((map, el) => {
            // ignore tokens that one of ask and bid is zero
            if (rates.indexOf(el.symbol) >= 0) {
                map[el.symbol] = {
                    name: el.name,
                    address: el.address,
                    decimals: el.decimals,
                    reserves_src: el.reserves_src,
                    reserves_dest: el.reserves_dest,
                };
            }
            return map;
        }, {});
    }catch (e) {
        throw 'http request error:'+e;
    }
};

const getTokenTradeRate = async (sellTokenAddress, buyTokenAddress, qty, network) => {
    if (!qty) qty = 1;
    try {
        let sell = qty;
        if (sellTokenAddress !== ETHID) {
            sell = await getSellQty(sellTokenAddress, qty, network);
        }
        let buy = await getApproximateBuyQty(buyTokenAddress, network);
        console.log("sell:" + sell);
        console.log("buy:" + buy);
        const rate = BigNumber(sell).dividedBy(BigNumber(buy)).dividedBy(BigNumber(qty)).multipliedBy(0.97).toNumber();
        return {status: true, rate: rate.toFixed(6)};
    } catch (e) {
        if (e.additional_data && e.additional_data.match(/reduce/)) {
            return {status: false, message: 'token_exchange.toast_reduce_src_qty'};
        }
        return {status: false, message: 'token_exchange.toast_unknown_error'}
    }
    // try{
    //     const url = `${NETWORK_URL[network]}/market`;
    //     console.log('[kyber req getTokenTradeRate]=>',url);
    //     const {data:rateResp} = await HttpClient.get(url);
    //     const {data} = rateResp;
    //     const rates = data.reduce((map,el)=>{
    //         map[el.pair] = {
    //             current_bid: el.current_bid,
    //             current_ask: el.current_ask,
    //         };
    //         return map;
    //     },{
    //         'ETH_ETH':{
    //             current_bid:1,
    //             current_ask:1
    //         }
    //     });
    //     //Assuming a 3% slippage rate,
    //     const rate = rates[`ETH_${sellToken}`].current_bid / rates[`ETH_${buyToken}`].current_ask *0.97;
    //     return rate.toFixed(6);
    // }catch (e) {
    //     throw 'http request error:'+e;
    // }
};

const getSellQty = async (tokenAddress, qty, network) => {
    const url = `${NETWORK_URL[network]}/sell_rate?id=${tokenAddress}&qty=${qty}`;
    console.log('[kyber req sell_rate]=>', url);

    const {data: resp} = await HttpClient.get(url);
    if (resp.error === true) {
        console.log("resp.reason: " + resp.reason);
        console.log("resp.additional_data: " + resp.additional_data);
        throw resp;
    }
    console.log("sell resp:", resp);
    return resp.data[0].dst_qty[0];
};

const getApproximateBuyQty = async (tokenAddress, network) => {
    const QTY = 1;
    const url = `${NETWORK_URL[network]}/buy_rate?id=${tokenAddress}&qty=${QTY}`;
    console.log('[kyber req buy_rate]=>', url);

    const {data: resp} = await HttpClient.get(url);
    if (resp.error === true) {
        console.log("resp.reason: " + resp.reason);
        console.log("resp.additional_data: " + resp.additional_data);
        throw resp;
    }
    console.log("buy resp: ", resp);
    return resp.data[0].src_qty[0];
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
    findSymbolByAddress,
    ETHID,
}