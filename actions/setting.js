export const SETTING = 'SETTING';
export function setting(setting){
	return {
		type: SETTING,
		setting
	};
}