/* eslint-disable camelcase */
import BigNumber from 'bignumber.js';
import { sendAll } from 'makkii-coins/coins/btc+ltc/api/tools';
import { validator } from 'lib-common-util-js';
import { decode } from 'bip21';
import { COINS } from '../client/support_coin_list';
import { validateBalanceSufficiency, sendTransaction } from '../client/api';
import { validateAddress as validateAddress_ } from '../client/keystore';

const validateTxObj = async (txObj, account) => {
    const { to, amount, gasPrice, gasLimit } = txObj;
    const { symbol } = account;
    // validate 'to'
    try {
        let ret = await validateAddress(to, symbol);
        if (!ret) {
            return { result: false, err: 'error_format_recipient' };
        }
    } catch (e) {
        return { result: false, err: 'error_format_recipient' };
    }
    // validate amount
    const extra_params = {
        gasLimit,
        gasPrice,
        network: COINS[symbol].network,
    };
    return await validateBalanceSufficiency(account, symbol, amount, extra_params);
    // Todo validate other flds
};

const getAllBalance = async (currentAccount, options) => {
    const { symbol, balance, coinSymbol } = currentAccount;
    const { currentGasLimit, currentGasPrice } = options;
    let amount = 0;
    if (coinSymbol !== symbol) {
        amount = BigNumber(currentAccount.tokens[coinSymbol].balance).toNumber();
    } else if (COINS[symbol].txFeeSupport) {
        amount = BigNumber.max(
            BigNumber(0),
            BigNumber(balance)
                .shiftedBy(18)
                .minus(BigNumber(currentGasLimit).times(BigNumber(currentGasPrice).shiftedBy(9)))
                .shiftedBy(-18),
        ).toNumber();
    } else if (symbol === 'BTC' || symbol === 'LTC') {
        amount = await sendAll(currentAccount.address, symbol, COINS[symbol].network);
    } else {
        amount = balance;
    }
    return amount;
};

const parseScannedData = async (data, currentAccount) => {
    let ret;
    let retData = {};
    const coinName = COINS[currentAccount.symbol].name.toLowerCase();
    try {
        const { address, options } = decode(data, coinName);
        const { amount } = options;
        const ret1 = await validateAddress(address, currentAccount.symbol);
        const ret2 = amount ? validator.validateAmount(amount) : true;
        ret = ret1 && ret2;
        if (ret) {
            retData.to = address;
            retData.amount = amount || '';
        }
    } catch (e) {
        ret = await validateAddress(data, currentAccount.symbol);
        if (ret) {
            retData.to = data;
        }
    }
    return { result: ret, data: retData };
};

const sendTx = async (txObj, currentAccount) => {
    const { symbol, coinSymbol } = currentAccount;
    const { gasPrice, gasLimit, amount, to, data } = txObj;
    const extra_params = COINS[symbol].txFeeSupport ? { gasPrice: gasPrice * 1e9, gasLimit: gasLimit - 0 } : {};
    try {
        const res = await sendTransaction(currentAccount, coinSymbol, to, BigNumber(amount), extra_params, data);
        return { result: true, data: res };
    } catch (e) {
        console.log('sendTransaction error=>', e);
        return { result: false, error: e };
    }
};

const validateAddress = async (address, symbol) => {
    try {
        return await validateAddress_(address, symbol);
    } catch (e) {
        return false;
    }
};

export { validateTxObj, getAllBalance, parseScannedData, sendTx };
