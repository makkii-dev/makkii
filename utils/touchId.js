/* eslint-disable import/no-mutable-exports */
import TouchID from 'react-native-touch-id';
import { strings } from '../locales/i18n';
import { AppToast } from '../app/components/AppToast';

export const showTouchID = (onSucess = () => {}, onFail = () => {}) => {
    const optionalConfigObject = {
        title: strings('pinCode.touchID_dialog_title'), // Android
        imageColor: '#e00606', // Android
        imageErrorColor: '#ff0000', // Android
        sensorDescription: strings('pinCode.touchID_dialog_desc'), // Android
        sensorErrorDescription: strings('pinCode.touchID_dialog_failed'), // Android
        cancelText: strings('cancel_button'), // Android
        unifiedErrors: true, // use unified error messages (default false)
        passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
    };
    ignoreNextAppStateChange(true);
    TouchID.authenticate('', optionalConfigObject)
        .then(() => {
            ignoreNextAppStateChange(false);
            onSucess();
        })
        .catch(error => {
            ignoreNextAppStateChange(false);
            if (error.code !== 'USER_CANCELED' && error.code !== 'SYSTEM_CANCELED') {
                AppToast.show(strings(`pinCode.touchID_${error.code}`, { duration: 3000 }));
            }
            onFail();
        });
};

export let IGNOREAPPSTATECHANGEFLAG = false;

export const ignoreNextAppStateChange = flag => {
    IGNOREAPPSTATECHANGEFLAG = flag;
};
