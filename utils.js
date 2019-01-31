const bip39 = require('bip39');
import {blake2bHex} from'blakejs';
import wallet from 'react-native-aion-hw-wallet';

function test(){
	// // defaults to BIP39 English word list
	// // uses HEX strings for entropy
	// var mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000')
	// // => abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about

	// console.log('[mnemonic]');
	// console.log(mnemonic);

	// // reversible
	// console.log(bip39.mnemonicToEntropy(mnemonic));
	console.log('utils');
}

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
    console.log("hash:" + passwordHash);
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
    test: test,
    validatePassword: validatePassword,
    validateUrl: validateUrl,
    hashPassword: hashPassword,
    getLedgerMessage: getLedgerMessage,
}

