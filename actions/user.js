// atomic update for sigin and register routines
const USER = 'USER';
function user(hashed_password, mnemonic, hashed_pinCode='', address_book={}){
	return {
		type: USER,
		hashed_password,
		hashed_pinCode,
		mnemonic,
		address_book
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

const ADD_ADDRESS = 'ADD_ADDRESS';
function add_address(address) {
	return {
		type: ADD_ADDRESS,
		address,
	}
}

const UPDATE_ADDRESS = 'UPDATE_ADDRESS';
function update_address(address) {
	return {
		type: UPDATE_ADDRESS,
		address
	}
}

const DELETE_ADDRESS = 'DELETE_ADDRESS';
function delete_address(address) {
	return {
		type: DELETE_ADDRESS,
		address
	}
}

module.exports = {
	USER,
	user,
	USER_UPDATE_PASSWORD,
	user_update_password,
	USER_UPDATE_PINCODE,
	user_update_pincode,
	ADD_ADDRESS: ADD_ADDRESS,
	add_address: add_address,
	UPDATE_ADDRESS: UPDATE_ADDRESS,
	update_address: update_address,
	DELETE_ADDRESS: DELETE_ADDRESS,
	delete_address: delete_address,
};
