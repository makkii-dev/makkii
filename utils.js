const bip39 = require('bip39');
import {blake2bHex} from'blakejs';

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

module.exports = {
    test: test,
    validatePassword: validatePassword,
    validateUrl: validateUrl,
    hashPassword: hashPassword,
}

