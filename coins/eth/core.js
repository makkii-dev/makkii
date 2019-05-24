import {keccak256} from '../../utils/crypto/crypto';

function validateAddress(address, network='mainnet') {
    return new Promise((resolve, reject) => {
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            // Check if it has the basic requirements of an address
            resolve(false);
        }

        if (/^0x[0-9a-f]{40}$/.test(address) || /^0x?[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            resolve(true);
        }

        // Otherwise check each case
        let result = verifyChecksum(address);
        console.log("eth " + address + " checksum validation failed.");
        resolve(result);
    });
}

function verifyChecksum(address) {
    // Check each case
    address = address.replace('0x','');

    var addressHash = keccak256(address.toLowerCase());

    for (var i = 0; i < 40; i++ ) {
        // The nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
            (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }

    return true;
}

function formatAddress1Line(address) {
    let pre = address.startsWith('0x')? 2: 0;
    return address.substring(0, 10 + pre) + '...' + address.substring(address.length - 10);
}

function validateBalanceSufficiency(account, symbol, amount, extra_params) {
    return true;
}

module.exports = {
    validateAddress,
    formatAddress1Line,
    validateBalanceSufficiency,
}
