const bip39 = require('bip39');

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

module.exports = {
    test: test
}
