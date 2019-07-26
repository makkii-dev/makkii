import BigNumber from 'bignumber.js';
import { validateAmount, validatePositiveInteger } from '../../utils/index';

function validateAddress(address) {
    return new Promise(resolve => {
        // do not verify prefix a0
        const reg = /^[0-9a-fA-F]{64}$/;
        let lcAddress = address.toLowerCase();
        lcAddress = lcAddress.startsWith('0x') ? lcAddress.substring(2) : lcAddress;
        if (!lcAddress.startsWith('a0')) {
            resolve(false);
        } else {
            resolve(reg.test(address));
        }
    });
}

function formatAddress1Line(address) {
    const pre = address.startsWith('0x') ? 2 : 0;
    return `${address.substring(0, 10 + pre)}...${address.substring(address.length - 10)}`;
}

function validateBalanceSufficiency(account, symbol, amount, extraParams) {
    return new Promise(resolve => {
        if (!validateAmount(amount)) resolve({ result: false, err: 'error_format_amount' });
        if (!validateAmount(extraParams.gasPrice))
            resolve({ result: false, err: 'error_invalid_gas_price' });
        if (!validatePositiveInteger(extraParams.gasLimit))
            resolve({ result: false, err: 'error_invalid_gas_limit' });

        const gasLimit = new BigNumber(extraParams.gasLimit);
        const gasPrice = new BigNumber(extraParams.gasPrice);
        const balance = new BigNumber(account.balance);
        const transferAmount = new BigNumber(amount);
        if (account.symbol === symbol) {
            if (
                transferAmount
                    .plus(gasPrice.multipliedBy(gasLimit).dividedBy(BigNumber(10).pow(9)))
                    .isGreaterThan(balance)
            ) {
                resolve({ result: false, err: 'error_insufficient_amount' });
            }
        } else {
            if (
                gasPrice
                    .multipliedBy(gasLimit)
                    .dividedBy(BigNumber(10).pow(9))
                    .isGreaterThan(balance)
            ) {
                resolve({ result: false, err: 'error_insufficient_amount' });
            }
            const totalCoins = account.tokens[symbol].balance;
            if (transferAmount.isGreaterThan(totalCoins)) {
                resolve({ result: false, err: 'error_insufficient_amount' });
            }
        }
        resolve({ result: true });
    });
}

module.exports = {
    validateAddress,
    formatAddress1Line,
    validateBalanceSufficiency,
};
