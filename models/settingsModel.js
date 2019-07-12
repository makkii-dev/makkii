import {DeviceEventEmitter} from 'react-native';
import {Storage} from "../utils/storage";
import {createAction} from "../utils/dva";
import {getCoinPrices} from "../coins/api";
import {AppToast} from "../utils/AppToast";
import {setLocale, strings} from "../locales/i18n";
import TouchID from "react-native-touch-id";
import DeviceInfo from "react-native-device-info";

export default {
    namespace:'settingsModel',
    state:{
        lang:'auto',
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
    subscriptions:{
        setupListenerCoinPrice({dispatch}){
            let listener;
            DeviceEventEmitter.addListener('update_exchange_refresh_interval',(params)=>{
                const {exchange_refresh_interval} = params;
                console.log('update_exchange_refresh_interval=>',exchange_refresh_interval);
                if(listener){
                    clearInterval(listener);
                }else{
                    listener=setInterval(()=>{
                        dispatch(createAction('settingsModel/getCoinPrices')());
                    },exchange_refresh_interval*60*1000);
                }
            })
        },
        setupListenerAppState({dispatch}){

        }
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
                DeviceEventEmitter.emit('update_exchange_refresh_interval', {exchange_refresh_interval:payload.exchange_refresh_interval||30});
                updateLocale(payload.lang);
                yield put(createAction('updateState')(payload));
                yield put(createAction('saveSettings')());
            }else{
                const payload = yield call(Storage.get, 'settings');
                updateLocale(payload.lang);
                DeviceEventEmitter.emit('update_exchange_refresh_interval', {exchange_refresh_interval:payload.exchange_refresh_interval||30});
                yield put(createAction('updateState')(payload));
            }
            yield put(createAction('getCoinPrices')());
            return true;
        },
        *reset(action, {put}){
            yield put(createAction('updateState')({pinCodeEnabled:false, touchIDEnabled:false}));
            yield put(createAction('saveSettings')());
        },
        *saveSettings(action, {call, select}){
            const toBeSaved = yield select(({settingsModel})=>({
                lang:settingsModel.lang,
                login_session_timeout: settingsModel.login_session_timeout,
                exchange_refresh_interval: settingsModel.exchange_refresh_interval,
                fiat_currency: settingsModel.fiat_currency,
                pinCodeEnabled: settingsModel.pinCodeEnabled,
                touchIDEnabled: settingsModel.touchIDEnabled,
                explorer_server: settingsModel.explorer_server, // only used in unused dapp_send. will remove later.
                state_version: settingsModel.state_version, // local state/db version, used to upgrade
                version: settingsModel.version // app version
            }));
            yield call(Storage.set,'settings',toBeSaved);
        },
        *getCoinPrices(action, {call,put,select}){
            const {fiat_currency} = yield select(mapToSettings);
            try {
                const prices = yield call(getCoinPrices, fiat_currency);
                const coinPrices = prices.reduce((map,item)=>{
                    map[item['crypto']] = item['price'];
                    return map;
                },{});
                yield put(createAction('updateState')({coinPrices}));
                return true;
            }catch (e) {
                console.log("get coin price errors:", e);
                return false;
            }
        },
        *updateFiatCurrency({payload:{currency}},{call,put}){
            try {
                const prices = yield call(getCoinPrices, currency);
                const coinPrices = prices.reduce((map,item)=>{
                    map[item['crypto']] = item['price'];
                    return map;
                },{});
                yield put(createAction('updateState')({coinPrices,fiat_currency:currency}));
                yield put(createAction('saveSettings')());
                return true;
            }catch (e) {
                console.log("get coin price errors:", e);
                AppToast.show(strings('error_connect_remote_server'), {
                    position: AppToast.positions.CENTER,
                });
                return false;
            }
        },
        *updateExchangeRefreshInterval({payload:{interval}}, {put}){
            yield put(createAction('updateState')({exchange_refresh_interval:interval}));
            DeviceEventEmitter.emit('update_exchange_refresh_interval', {exchange_refresh_interval:interval});
            yield put(createAction('saveSettings')());
        },
        *updateLocale({payload:{lang}},{put}){
            yield put(createAction('updateState')({lang:lang}));
            updateLocale(lang);
            yield put(createAction('saveSettings')());
        },
        *updateLoginSessionTimeOut({payload:{time}},{put}){
            yield put(createAction('updateState')({login_session_timeout:time}));
            yield put(createAction('saveSettings')());
        },
        *switchPinCode(action, {select,put}){
            const {pinCodeEnabled}  = yield select(mapToSettings);
            if(pinCodeEnabled){
                yield put(createAction('updateState')({pinCodeEnabled:false, touchIDEnabled:false}));
            }else{
                yield put(createAction('updateState')({pinCodeEnabled:true}));
            }
            yield put(createAction('saveSettings')());
        },
        *switchTouchId(action, {call,select,put}){
            const {touchIDEnabled}  = yield select(mapToSettings);
            if(touchIDEnabled){
                yield put(createAction('updateState')({touchIDEnabled:false}));
            }else{
                const optionalConfigObject = {
                    unifiedErrors: true,// use unified error messages (default false)
                    passcodeFallback: false, // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
                };
                try {
                    const biometryType = yield call(TouchID.isSupported, optionalConfigObject);
                    if(!biometryType||biometryType==='TouchID'){
                        yield put(createAction('updateState')({touchIDEnabled:true}));
                    }else{
                        AppToast.show(strings(`pinCode.touchID_NOT_SUPPORTED`))
                    }
                }catch (e) {
                    AppToast.show(strings(`pinCode.touchID_NOT_SUPPORTED`))
                }
            }
            yield put(createAction('saveSettings')());
        }
    }
}


const mapToSettings = ({settingsModel})=>({...settingsModel});
const mapToUsers = ({userModel})=>({...userModel});

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
    new_settings.state_version = 2;
    return new_settings;
};


const updateLocale = (lang)=>{
    if(lang==='auto'){
        setLocale(DeviceInfo.getDeviceLocale());
    }else{
        setLocale(lang);
    }

}