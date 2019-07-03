import HttpClient from '../utils/http_caller';

const NETWORK_URL = {
    'mainnet': 'https://api.kyber.network',
    'ropsten': 'https://ropsten-api.kyber.network',
    'rinkeby': 'https://rinkeby-api.kyber.network'
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

export {
    getTokenList,
    getTokenTradeRate,
    genTradeData
}