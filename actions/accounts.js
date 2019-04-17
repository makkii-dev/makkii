const ACCOUNTS = 'ACCOUNTS';
const ACCOUNTS_ADD = 'ADD_ACCOUNTS';
const ACCOUNTS_SAVE = 'ACCOUNTS_SAVE';
const UPDATE_ACCOUNT_NAME = 'UPDATE_ACCOUNT_NAME';
const UPDATE_ACCOUNT_TRANSACTIONS = 'UPDATE_ACCOUNT_TRANSACTIONS';
const UPDATE_ACCOUNT_TOKENS = 'UPDATE_ACCOUNT_TOKENS';
const ACCOUNT_DEFAULT = "ACCOUNT_DEFAULT";
const DEL_ACCOUNT = 'DEL_ACCOUNT';
const DEL_ACCOUNTS = 'DEL_ACCOUNTS';

function accounts(accounts){
	return {
		type: ACCOUNTS,
		accounts
	}
}

function accounts_add(accounts, hashed_password){
	return {
		type: ACCOUNTS_ADD,
		accounts,
		hashed_password,
	}
}

function accounts_save(hashed_password) {
	return {
		type: ACCOUNTS_SAVE,
		hashed_password
	}

}

function account_default(key, hashed_password){
	return {
		type: ACCOUNT_DEFAULT,
		key,
		hashed_password
	}
}

function update_account_name(key, newName, hashed_password){
	return {
		type: UPDATE_ACCOUNT_NAME,
		key,
		newName,
		hashed_password
	}
}

function update_account_txs(key, transactions, network, hashed_password){
	return {
		type: UPDATE_ACCOUNT_TRANSACTIONS,
		key,
		transactions,
		network,
		hashed_password
	}
}

function update_account_tokens(key, tokens, network, hashed_password) {
	return {
		type: UPDATE_ACCOUNT_TOKENS,
		key,
		tokens,
		network,
		hashed_password
	}

}

function delete_account(key, hashed_password) {
	return {
		type: DEL_ACCOUNT,
		key,
		hashed_password,
	}
}

function delete_accounts(hashed_password){
	return {
		type: DEL_ACCOUNTS,
		hashed_password,
	}
}

module.exports={
	ACCOUNTS,
	ACCOUNTS_ADD,
	ACCOUNTS_SAVE,
	ACCOUNT_DEFAULT,
	UPDATE_ACCOUNT_NAME,
	UPDATE_ACCOUNT_TRANSACTIONS,
	UPDATE_ACCOUNT_TOKENS,
	DEL_ACCOUNT,
	DEL_ACCOUNTS,
	accounts,
	accounts_add,
	accounts_save,
	account_default,
	update_account_name,
	update_account_txs,
	update_account_tokens,
	delete_account,
	delete_accounts,
};
