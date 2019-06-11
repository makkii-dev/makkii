import {validateAmount} from '../../utils/index';
import BigNumber from 'bignumber.js';

const formatAddress1Line =(address) => address.slice(0,12)+'...'+address.slice(-10);

function validateBalanceSufficiency(account, symbol, amount, extra_params) {
    return new Promise((resolve, reject) => {
        if (!validateAmount(amount)) resolve({result: false, err: 'error_format_amount'});
        let balance = new BigNumber(account.balance);
        let transferAmount = new BigNumber(amount);
        if (transferAmount.isGreaterThan(balance)) {
            resolve({result: false, err: 'error_insufficient_amount'});
        }
        resolve({result: true});
    })

}

module.exports = {
    formatAddress1Line,
    validateBalanceSufficiency
}
