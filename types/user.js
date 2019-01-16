export default class User {
	constructor() {
		// latest login timestamp
        this.login = Date.now();
		// hashed password
        this.hashed_password = '';
        // raw mnemonic
        this.mnemonic = '';
    }
} 