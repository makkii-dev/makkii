import {validateAmount} from '../../utils/index';
import BigNumber from 'bignumber.js';

function formatAddress1Line(address) {
    return address;
}

function validateBalanceSufficiency(account, symbol, amount, extra_params) {
    if (!validateAmount(amount)) return {result: false, err: 'error_format_amount'};
    let balance = new BigNumber(account.balance);
    let transferAmount = new BigNumber(amount);
    if (transferAmount.isGreaterThan(balance)) {
        return {result: false, err: 'error_insufficient_amount'};
    }
    return {result: true};
}

module.exports = {
    formatAddress1Line,
    validateBalanceSufficiency
}
