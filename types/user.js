export default class User {
	constructor() {

		// latest login timestamp
        this.login = Date.now();
		// hashed password
        this.hashed_password = 'f5d67bae73b0e10d0dfd3043b3f4f100ada014c5c37bd5ce97813b13f5ab2bcf'; // local
        // raw mnemonic
        this.mnemonic = 'word1 word1 word1 word1 word1 word1 word1 word1 word1 word1 word1 word1';
        this.hashed_mnemonic = 'belt dismiss dirt wash solution swallow exercise acquire motion shine round boost';    // local
    }
}
