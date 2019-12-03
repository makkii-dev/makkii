/* eslint-disable camelcase */
import { decode } from 'bip21';
import { validateAddress } from '../client/keystore';
import { COINS } from '../client/support_coin_list';

const MAPNAME2SYMBOL = Object.keys(COINS).reduce((map, el) => {
    map[COINS[el].name.toLowerCase()] = el;
    return map;
}, {});

const parseScannedData = (data, symbol) => {
    let ret;
    let retData = {};
    const coinScheme = data.substr(0, data.indexOf(':'));
    const coin = MAPNAME2SYMBOL[coinScheme];

    if (coin) {
        const { address } = decode(data, COINS[coin].name.toLowerCase());
        ret = validateAddress(coin, address);
        if (ret) {
            retData.address = address;
            retData.symbol = coin;
        }
    } else {
        ret = validateAddress(symbol, data);
        if (ret) {
            retData.address = data;
            retData.symbol = symbol;
        }
    }
    return { result: ret, data: retData };
};

export { parseScannedData, validateAddress };
