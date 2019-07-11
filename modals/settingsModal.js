import {Storage} from "../utils/storage";
import {createAction} from "../utils/dva";

export default {
    namespace:'settingsModal',
    state:{
        lang:'zh',
        login_session_timeout: '30',
        exchange_refresh_interval: '30',
        fiat_currency: 'CNY',
        coinPrices: { // no save
            AION: 0, // exchange rate against fiat_currency
            BTC: 0,
            ETH: 0,
            LTC: 0,
            TRX: 0,
        },
        pinCodeEnabled: true,
        touchIDEnabled: true,
        explorer_server: 'mainnet', // only used in unused dapp_send. will remove later.
        state_version: 1, // local state/db version, used to upgrade
        version: '0.1.1' // app version
    },
    reducers:{
        updateState(state, {payload}){
            console.log('payload=>',payload);
            return {...state, ...payload};
        }
    },
    effects:{
        *loadStorage({payload}, {call,put}){
            const {state_version, options} = payload;
            if(state_version<2){
                let old_settings = yield call(Storage.get, 'settings');
                old_settings = upgradeSettingsV0_V1(old_settings);
                const payload = upgradeSettingsV1_V2(old_settings);
                yield put(createAction('updateState')(payload));
                yield put(createAction('saveSettings')());
            }else{
                const payload = yield call(Storage.get, 'settings');
                yield put(createAction('updateState')(payload));
            }
            return true;
        },
        *saveSettings(action, {call, select}){
            const toBeSaved = yield select(({settingsModal})=>({
                lang:settingsModal.lang,
                login_session_timeout: settingsModal.login_session_timeout,
                exchange_refresh_interval: settingsModal.exchange_refresh_interval,
                fiat_currency: settingsModal.fiat_currency,
                pinCodeEnabled: settingsModal.pinCodeEnabled,
                touchIDEnabled: settingsModal.touchIDEnabled,
                explorer_server: settingsModal.explorer_server, // only used in unused dapp_send. will remove later.
                state_version: settingsModal.state_version, // local state/db version, used to upgrade
                version: settingsModal.version // app version
            }));
            yield call(Storage.set,'settings',toBeSaved);
        }
    }
}

const upgradeSettingsV0_V1=(old_settings)=>{
    let new_settings = {...old_settings};
    new_settings.state_version = 1;
    new_settings.coinPrices ={};
    new_settings.explorer_server = 'mainnet';
    delete new_settings['theme'];
    delete new_settings['tx_fee'];
    delete new_settings['endpoint_wallet'];
    delete new_settings['endpoint_dapps'];
    delete new_settings['endpoint_odex'];
    delete new_settings['endpoint_odex'];
    return new_settings;
};

const upgradeSettingsV1_V2=(old_settings)=>{
    let new_settings = {...old_settings};
    new_settings.state_version = 1;
    return new_settings;
};