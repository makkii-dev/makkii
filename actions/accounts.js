const ACCOUNTS = 'ACCOUNTS';
const ACCOUNTS_ADD = 'ADD_ACCOUNTS';
const ACCOUNTS_SAVE = 'ACCOUNTS_SAVE';
const UPDATE_ACCOUNT_NAME = 'UPDATE_ACCOUNT_NAME';
const UPDATE_ACCOUNT_BALANCE = 'UPDATE_ACCOUNT_BALANCE';
const UPDATE_ACCOUNT_TRANSACTIONS = 'UPDATE_ACCOUNT_TRANSACTIONS';
const UPDATE_ACCOUNT_TOKEN_TRANSACTIONS = 'UPDATE_ACCOUNT_TOKEN_TRANSACTIONS';
const UPDATE_ACCOUNT_TOKENS = 'UPDATE_ACCOUNT_TOKENS';
const DEL_ACCOUNT = 'DEL_ACCOUNT';
const DEL_ACCOUNTS = 'DEL_ACCOUNTS';
const DEL_ACCOUNT_TOKEN = 'DEL_ACCOUNT_TOKEN';

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

function update_account_name(key, newName, hashed_password){
	return {
		type: UPDATE_ACCOUNT_NAME,
		key,
		newName,
		hashed_password
	}
}

function update_account_balance(key, newBalance, hashed_password) {
	return {
		type: UPDATE_ACCOUNT_BALANCE,
		key,
		newBalance,
		hashed_password
	}
}

function update_account_txs(key, transactions, hashed_password){
	return {
		type: UPDATE_ACCOUNT_TRANSACTIONS,
		key,
		transactions,
		hashed_password
	}
}

function update_account_token_txs(key, transactions, symbol, hashed_password) {
	return {
		type: UPDATE_ACCOUNT_TOKEN_TRANSACTIONS,
		key,
		transactions,
		symbol,
		hashed_password
	}
}

function update_account_tokens(key, tokens, hashed_password) {
	return {
		type: UPDATE_ACCOUNT_TOKENS,
		key,
		tokens,
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

function delete_account_token(key, symbol, hashed_password){
	return {
		type: DEL_ACCOUNT_TOKEN,
		key,
		symbol,
		hashed_password
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
	UPDATE_ACCOUNT_NAME,
	UPDATE_ACCOUNT_BALANCE,
	UPDATE_ACCOUNT_TRANSACTIONS,
    UPDATE_ACCOUNT_TOKEN_TRANSACTIONS,
	UPDATE_ACCOUNT_TOKENS,
	DEL_ACCOUNT,
	DEL_ACCOUNTS,
	DEL_ACCOUNT_TOKEN,
	accounts,
	accounts_add,
	accounts_save,
	update_account_name,
	update_account_balance,
	update_account_txs,
	update_account_tokens,
	update_account_token_txs,
	delete_account,
	delete_accounts,
	delete_account_token,
};
