import BigNumber from 'bignumber.js';
import { keccak256 } from '../../utils/crypto/crypto';
import { validateAmount, validatePositiveInteger } from '../../utils/index';

function validateAddress(address) {
    return new Promise(resolve => {
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            // Check if it has the basic requirements of an address
            resolve(false);
        }

        if (/^0x[0-9a-f]{40}$/.test(address) || /^0x[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            resolve(true);
        }

        // Otherwise check each case
        const result = verifyChecksum(address);
        console.log(`eth ${address} checksum validation failed.`);
        resolve(result);
    });
}

function verifyChecksum(address) {
    // Check each case
    address = address.replace('0x', '');

    const addressHash = keccak256(address.toLowerCase());

    for (let i = 0; i < 40; i++) {
        // The nth letter should be uppercase if the nth digit of casemap is 1
        if (
            (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
            (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])
        ) {
            return false;
        }
    }

    return true;
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
