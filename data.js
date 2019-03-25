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

let dapps = {};
dapps.mastery=[];
dapps.mainnet=[];
dapps.mastery.push({
	name: 'Pet Roulette',
	logo: require('./assets/apps/app1/app1_logo.png'),
	description: '		When 7 bets have been placed - an animal will be randomly selected and a payout will occur.Winners who guessed correctly will split the amount in the AION pool! If no winner, total AION pool will rollover',
	// uri: 'http://192.168.50.83:8082'
	uri: 'https://aion-roulette.netlify.com/',
	author: 'KimCodeashian',
	type:'dapp.type_game',
	screenShot: require('./assets/apps/app1/app1_screenshot.png')
});
dapps.mainnet.push({
	name: 'Pet Roulette',
	logo: require('./assets/apps/app1/app1_logo.png'),
	description: '		When 7 bets have been placed - an animal will be randomly selected and a payout will occur.Winners who guessed correctly will split the amount in the AION pool! If no winner, total AION pool will rollover',
	// uri: 'http://192.168.50.83:8082'
	uri: 'http://45.118.132.89/dist/index.html',
	author: 'KimCodeashian',
	type:'dapp.type_game',
	screenShot: require('./assets/apps/app1/app1_screenshot.png')
});

export default data = {
	accounts,
	accounts_ledger,
	dapps,
}
