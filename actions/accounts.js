export const ACCOUNTS = 'ACCOUNTS';
export const ADD_ACCOUNTS = 'ADD_ACCOUNTS';
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