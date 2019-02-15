// atomic update for sigin and register routines
const USER = 'USER';
function user(hashed_password, mnemonic){ 
	return { 
		type: USER, 
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
	USER,
	user,
	USER_SIGNOUT,
	user_signout,
	USER_UPDATE_PASSWORD,
	user_update_password,
};