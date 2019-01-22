import Account from './types/account.js';
import Transaction from './types/transaction.js';
import Dapp from './types/dapp.js';

let accounts = {};
let length = 30;
for(let i = 0; i < 20; i++){
	let acc = new Account();
	acc.address = 'a0' + Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	acc.private_key = '0000000000000000000000000000000000000000000000000000000000000000';
	acc.balance = Math.random().toFixed(6);
	acc.name = 'account ' + i;
	acc.type = '[local]'; 
	let tx = new Transaction();
	tx.hash = Math.round((Math.pow(36, 32) - Math.random() * Math.pow(36, 31))).toString(36).slice(1);
	tx.from = 'a0' + Math.round((Math.pow(36, 31) - Math.random() * Math.pow(36, 30))).toString(36).slice(1);
	tx.to = 'a0' + Math.round((Math.pow(36, 31) - Math.random() * Math.pow(36, 30))).toString(36).slice(1);
	tx.value = Math.random();
	tx.block = Math.random();
	acc.transactions[tx.hash] = tx;
	tx = new Transaction();
	tx.hash = Math.round((Math.pow(36, 32) - Math.random() * Math.pow(36, 31))).toString(36).slice(1);
	tx.from = 'a0' + Math.round((Math.pow(36, 31) - Math.random() * Math.pow(36, 30))).toString(36).slice(1);
	tx.to = 'a0' + Math.round((Math.pow(36, 31) - Math.random() * Math.pow(36, 30))).toString(36).slice(1);
	tx.value = Math.random();
	tx.block = Math.random();
	acc.transactions[tx.hash] = tx;
	accounts[acc.address] = acc;
}


let dapps = [];
dapps.push(new Dapp('dapp1', 'https://i0.wp.com/www.blockchaindk.com/wp-content/uploads/2017/11/Aion-Logo.png?fit=400%2C400&ssl=1', 'desc1','http://192.168.50.83:8888'));
dapps.push(new Dapp('dapp2', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDHgU12UjzCm0m-96M-nsY3gpNuwCl9-dLlmmzlEvsEdHEtJt9', 'desc2','http://192.168.50.83:8888'));;

export default data = {
	accounts,
	dapps,
}