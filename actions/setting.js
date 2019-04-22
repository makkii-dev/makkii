const SETTING = 'SETTING';
function setting(setting){
	return {
		type: SETTING,
		setting
	};
}

const SETTING_UPDATE_PINCODE_ENABLED = 'SETTING_UPDATE_PINCODE_ENABLED';
function setting_update_pincode_enabled(pinCodeEnabled, touchIDEnabled=false){
	return  {
		type: SETTING_UPDATE_PINCODE_ENABLED,
		pinCodeEnabled,
		touchIDEnabled
	}
}

module.exports = {
	SETTING,
	setting,
	SETTING_UPDATE_PINCODE_ENABLED,
	setting_update_pincode_enabled,
};
