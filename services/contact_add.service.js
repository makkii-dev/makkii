/* eslint-disable camelcase */
import { isJsonString } from '../utils';
import { validateAddress as validateAddress_ } from '../client/keystore';

const parseScannedData = async (data, symbol) => {
    let ret;
    let retData = {};
    if (isJsonString(data)) {
        const { receiver, coin } = JSON.parse(data);
        try {
            ret = await validateAddress_(receiver, coin || symbol);
            retData.address = receiver;
            retData.symbol = coin || symbol;
        } catch (e) {
            ret = false;
        }
    } else {
        try {
            ret = await validateAddress_(data, symbol);
            retData.address = data;
            retData.symbol = symbol;
        } catch (e) {
            ret = false;
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
