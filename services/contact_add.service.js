/* eslint-disable camelcase */
import { decode } from 'bip21';
import { validateAddress as validateAddress_ } from '../client/keystore';
import { COINS } from '../client/support_coin_list';

const MAPNAME2SYMBOL = Object.keys(COINS).reduce((map, el) => {
    map[COINS[el].name.toLowerCase()] = el;
    return map;
}, {});

const parseScannedData = async (data, symbol) => {
    let ret;
    let retData = {};
    const coinScheme = data.substr(0, data.indexOf(':'));
    const coin = MAPNAME2SYMBOL[coinScheme];

    if (coin) {
        const { address } = decode(data, COINS[coin].name.toLowerCase());
        ret = await validateAddress(address, coin);
        if (ret) {
            retData.address = address;
            retData.symbol = coin;
        }
    } else {
        ret = await validateAddress(data, symbol);
        if (ret) {
            retData.address = data;
            retData.symbol = symbol;
        }
    }
    return { result: ret, data: retData };
};
const validateAddress = async (address, symbol) => {
    try {
        return await validateAddress_(address, symbol);
    } catch (e) {
        return false;
    }
};

export { parseScannedData, validateAddress };
