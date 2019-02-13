export const ACCOUNTS = 'ACCOUNTS';
export const ADD_ACCOUNTS = 'ADD_ACCOUNTS';
export const UPDATE_ACCOUNT_NAME = 'UPDATE_ACCOUNT_NAME';
export const UPDATE_ACCOUNT_TRANSACTIONS = 'UPDATE_ACCOUNT_TRANSACTIONS';
export const DEL_ACCOUNT = 'DEL_ACCOUNT';
export function accounts(accounts){
	return {
		type: ACCOUNTS,
		accounts
	};
}

export function add_accounts(accounts){
	return {
		type: ADD_ACCOUNTS,
		accounts
	}
}

export function update_account_name(key, newName){
	return {
		type: UPDATE_ACCOUNT_NAME,
		key,
		newName
	}
}

export  function update_account_txs(key, transactions){
	return {
		type: UPDATE_ACCOUNT_TRANSACTIONS,
		key,
		transactions,
	}
}

export function delete_account(key) {
	return {
		type: DEL_ACCOUNT,
		key,
	}
}