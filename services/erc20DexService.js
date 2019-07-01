import HttpClient from '../utils/http_caller';

const NETWORK_URL = {
    'mainnet': 'https://api.kyber.network',
    'ropsten': 'https://ropsten-api.kyber.network',
    'rinkeby': 'https://rinkeby-api.kyber.network'
};

const getTokenList = async (network)=>{
    try {
        const url = `${NETWORK_URL[network]}/currencies`;
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

const getTokenTradeRate = async (sellTokenAddress, buyTokenAddress,network) =>{
    try{
        const QTY = 1;
        const sellUrl = `${NETWORK_URL[network]}/sell_rate?id=${sellTokenAddress}&qty=${QTY}`;
        const buyUrl = `${NETWORK_URL[network]}/buy_rate?id=${buyTokenAddress}&qty=${QTY}`;
        const {data:sellResp} = await HttpClient.get(sellUrl);
        const {data:buyResp} = await HttpClient.get(buyUrl);
        //Assuming a 3% slippage rate,
        return sellResp.data[0].dst_qty[0]/buyResp.data[0].src_qty[0]*0.97;
    }catch (e) {
        throw 'http request error:'+e;
    }
};

export {
    getTokenList,
    getTokenTradeRate
}