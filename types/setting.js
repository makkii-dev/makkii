export default class Setting {
	constructor() {
		this.basic = {
			version: '0.1.0-rc0',
			theme: 'white'			
		};
		this.advance = {
	        tx_fee: 10000,
	        remote_kernel: 'http://127.0.0.1:8545',
	        remote_dapps: 'http://dapps.chaion.net',
	        remote_odex: 'http://odex.chaion.net'			
		};
    }
} 