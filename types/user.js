export default class User {
	constructor() {

		this.password = '';
		this.password_confirm = '';

		// latest login timestamp
        this.login = Date.now();
		// hashed password
        this.hashed_password = '123'; // local
        // raw mnemonic
        this.hashed_mnemonic = '';    // local
    }
}