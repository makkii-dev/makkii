const USER = 'USER';
function user(user){ return { type: USER, user }; }

const USER_SIGNOUT = 'USER_SIGNOUT';
function user_signout(){ return { type: USER_SIGNOUT }; }

module.exports = {
	USER,
	user,
	USER_SIGNOUT,
	user_signout,
};