export const USER = 'USER';
const SIGN_OUT = 'SIGN_OUT';

function user(user){
	return {
		type: USER,
		user
	};
}

function signout() {
	return {
		type: 'SIGN_OUT'
	};
}

module.exports = {
	signout: signout,
	user: user,
}