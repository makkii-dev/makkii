const USER_REGISTER = 'USER_REGISTER';
function user_register(hashed_password, mnemonic){ 
	return { 
		type: USER_REGISTER, 
		hashed_password, 
		mnemonic 
	}; 
}

const USER_SIGNIN = 'USER_SIGNIN';
function user_signin(hashed_password, mnemonic){ 
	return { 
		type: USER_REGISTER, 
		hashed_password, 
		mnemonic 
	}; 
}

const USER_SIGNOUT = 'USER_SIGNOUT';
function user_signout(){ 
	return { 
		type: USER_SIGNOUT 
	}; 
} 

const USER_UPDATE_PASSWORD = 'USER_UPDATE_PASSWORD';
function user_update_password(hashed_password) { 
	return {
		type: USER_UPDATE_PASSWORD,
		hashed_password,
	};
}

module.exports = {
	USER_REGISTER,
	user_register,
	USER_SIGNIN,
	user_signin,
	USER_SIGNOUT,
	user_signout,
	USER_UPDATE_PASSWORD,
	user_update_password,
};