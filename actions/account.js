export const ACCOUNT = 'ACCOUNT';
export function account(account){
	return {
		type: ACCOUNT,
		account
	};
}