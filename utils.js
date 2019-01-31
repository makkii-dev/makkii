import {blake2bHex} from'blakejs';
import wallet from 'react-native-aion-hw-wallet';

function validatePassword(password) {
    let reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,16}$/;
    return reg.test(password);
}

function validateUrl(url) {
    // TODO: validate format http(s)://<host>(:<port>)/
    // TODO: validate port range
    return true;
}

function hashPassword(password) {
    let passwordHash = blake2bHex(Buffer.from(password, 'utf8'), null, 32);
    return passwordHash;
}

function getLedgerMessage(errorCode) {
    if (errorCode == wallet.APP_INACTIVATED) {
        return 'Please activate Aion App on Ledger Device';
    } else if (errorCode == wallet.INVALID_DEVICE_NUMBER) {
        return 'No connected Ledger device';
    } else if (errorCode == wallet.USER_REJECTED) {
        return 'User cancelled this transaction';
    } else if (errorCode == wallet.NO_PERMISSION) {
        return 'Please grant usb device permission';
    } else if (errorCode == wallet.GENERAL_ERROR || errorCode == wallet.INVALID_ACCOUNT_TYPE || errorCode == wallet.INVALID_TX_PAYLOAD || errorCode == wallet.OPEN_DEVICE_FAIL) {
        return 'Internal error';
    } else {
        return 'Internal error';
    }
}

module.exports = {
    validatePassword: validatePassword,
    validateUrl: validateUrl,
    hashPassword: hashPassword,
    getLedgerMessage: getLedgerMessage,
}

