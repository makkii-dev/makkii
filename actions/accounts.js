export const ACCOUNTS = 'ACCOUNTS';
export const ACCOUNTS_ADD = 'ADD_ACCOUNTS';
export const UPDATE_ACCOUNT_NAME = 'UPDATE_ACCOUNT_NAME';
export const UPDATE_ACCOUNT_TRANSACTIONS = 'UPDATE_ACCOUNT_TRANSACTIONS';
export const DEL_ACCOUNT = 'DEL_ACCOUNT';

export function accounts(accounts){
	return {
		type: ACCOUNTS,
		accounts
	}
}

export function accounts_add(accounts, hashed_password){
	return {
		type: ACCOUNTS_ADD,
		accounts,
		hashed_password
	}
}

export function update_account_name(key, newName, hashed_password){
	return {
		type: UPDATE_ACCOUNT_NAME,
		key,
		newName,
		hashed_password
	}
}

export  function update_account_txs(key, transactions, hashed_password){
	return {
		type: UPDATE_ACCOUNT_TRANSACTIONS,
		key,
		transactions,
		hashed_password
	}
}

export function delete_account(key, hashed_password) {
	return {
		type: DEL_ACCOUNT,
		key,
		hashed_password,
	}
}