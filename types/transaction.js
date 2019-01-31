export default class Transaction {
	constructor() {
		this.hash = '';
        this.from = '';
        this.to = '';
        this.value = 0;
        this.block = 0;
        this.timestamp = Date.now();
        this.status = 'PENDING';
    }
} 