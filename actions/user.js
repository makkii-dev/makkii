const USER_REGISTER = 'USER_REGISTER';
function user_register(hashed_password, mnemonic){ return { type: USER_REGISTER, hashed_password, mnemonic }; }

const USER_SIGNOUT = 'USER_SIGNOUT';
function user_signout(){ return { type: USER_SIGNOUT }; } 

module.exports = {
	USER_REGISTER,
	user_register,
	USER_SIGNOUT,
	user_signout,
};