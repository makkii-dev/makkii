export const ACCOUNTS = 'ACCOUNTS';
export function accounts(accounts){
	return {
		type: ACCOUNTS,
		accounts
	};
}