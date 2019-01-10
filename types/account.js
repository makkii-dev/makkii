export default class Account {
	constructor(
		address, 
		private_key
	) {
        this.address = address;
        this.private_key = private_key;
    }
    sign() {
    	let signed = '';
    	return signed;
    }
} 