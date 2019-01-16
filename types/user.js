export default class User {
	constructor(
		signed,

		


	) {
        this.signed = signed;
        this.hashed_password = '';
        this.crypted_passphase = '';
        this.latest_login = Date.now();
    }
} 