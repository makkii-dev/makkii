import BigNumber from 'bignumber.js';
import { validateAmount } from '../../utils/index';

const formatAddress1Line = address => `${address.slice(0, 12)}...${address.slice(-10)}`;

function validateBalanceSufficiency(account, symbol, amount) {
    return new Promise(resolve => {
        if (!validateAmount(amount)) resolve({ result: false, err: 'error_format_amount' });
        const balance = new BigNumber(account.balance);
        const transferAmount = new BigNumber(amount);
        if (transferAmount.isGreaterThan(balance)) {
            resolve({ result: false, err: 'error_insufficient_amount' });
        }
        resolve({ result: true });
    });
}

module.exports = {
    formatAddress1Line,
    validateBalanceSufficiency,
};
