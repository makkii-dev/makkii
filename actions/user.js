// atomic update for sigin and register routines
const USER = 'USER';
function user(hashed_password, mnemonic, hashed_pinCode){
	return {
		type: USER,
		hashed_password,
		hashed_pinCode,
		mnemonic
	};
}

const USER_UPDATE_PASSWORD = 'USER_UPDATE_PASSWORD';
function user_update_password(hashed_password) {
	return {
		type: USER_UPDATE_PASSWORD,
		hashed_password,
	};
}

const USER_UPDATE_PINCODE = 'USER_UPDATE_PINCODE';
function user_update_pincode(hashed_pinCode) {
	return {
		type: USER_UPDATE_PINCODE,
		hashed_pinCode
	}
}

module.exports = {
	USER,
	user,
	USER_UPDATE_PASSWORD,
	user_update_password,
	USER_UPDATE_PINCODE,
	user_update_pincode,
};
