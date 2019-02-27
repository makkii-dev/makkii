let accounts = {};
let accounts_ledger = {};
let length = 62;
for(let i = 0; i < 20; i++){
	let acc = {};
	acc.address = '0xa0' + Math.round((Math.pow(16, length + 1) - Math.random() * Math.pow(16, length))).toString(16).slice(1);
	acc.private_key = '0000000000000000000000000000000000000000000000000000000000000000';
	acc.balance = Math.random().toFixed(6);
	acc.name = 'account ' + i;
	acc.type = '[local]';
	acc.transactions = {};
	let tx = {};
	tx.hash = Math.round((Math.pow(16, 32) - Math.random() * Math.pow(16, 31))).toString(16).slice(1);
	tx.from = '0xa0' + Math.round((Math.pow(16, length + 1) - Math.random() * Math.pow(16, length))).toString(16).slice(1);
	tx.to = '0xa0' + Math.round((Math.pow(16, length + 1) - Math.random() * Math.pow(16, length))).toString(16).slice(1);
	tx.value = Math.random();
	tx.block = Math.random();
	acc.transactions[tx.hash] = tx;
	tx = {};
	tx.hash = Math.round((Math.pow(16, 32) - Math.random() * Math.pow(16, 31))).toString(16).slice(1);
	tx.from = '0xa0' + Math.round((Math.pow(16, length + 1) - Math.random() * Math.pow(16, length))).toString(16).slice(1);
	tx.to = '0xa0' + Math.round((Math.pow(16, length + 1) - Math.random() * Math.pow(16, length))).toString(16).slice(1);
	tx.value = Math.random();
	tx.block = Math.random();
	acc.transactions[tx.hash] = tx;
	accounts[acc.address] = acc;

	acc = {};
	acc.address = '0xa0' + Math.round((Math.pow(16, length + 1) - Math.random() * Math.pow(16, length))).toString(16).slice(1);
	acc.private_key = '';
	acc.balance = 0;
	acc.name = 'ledger ' + i;
	acc.type = '[ledger]';
	acc.transactions = {};
	accounts_ledger[acc.address] = acc;
}

let dapps = [];
dapps.push({
	name: 'dapp1',
	logo: 'https://i0.wp.com/www.blockchaindk.com/wp-content/uploads/2017/11/Aion-Logo.png?fit=400%2C400&ssl=1',
	description: 'desc1',
	uri: 'http://192.168.50.83:8080'
});
dapps.push({
	name: 'dapp2',
	logo: 'https://www.macupdate.com/images/icons256/59967.png',
	description: 'desc2',
	uri: 'http://192.168.50.83:8080'
});;

export default data = {
	accounts,
	accounts_ledger,
	dapps,
}
