export const USER = 'USER';
export function user(user){
	return {
		type: USER,
		user
	};
}