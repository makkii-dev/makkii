export default class Account {
	constructor(
		address,
		private_key,
        label,
	) {
        this.address = address;
        this.private_key = private_key;
        this.label = label;
        this.balance = 0;
        this.type = 'local';
    }
    sign() {
    	let signed = '';
    	return signed;
    }
} 