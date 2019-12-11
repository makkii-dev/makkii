/* eslint-disable camelcase */
import { Platform, DeviceEventEmitter, AppState, Linking, NativeModules } from 'react-native';
import TouchID from 'react-native-touch-id';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import RNFS from 'react-native-fs';
import BackgroundTimer from 'react-native-background-timer';
import { Storage } from '../utils/storage';
import { createAction, popCustom } from '../utils/dva';
import { getCoinPrices } from '../client/api';
import { AppToast } from '../app/components/AppToast';
import { setLocale, strings } from '../locales/i18n';
import { getActivityConstant, getLatestVersion, getSupportedModule } from '../services/setting.service';

export default {
    namespace: 'settingsModel',
    state: {
        lang: 'auto',
        login_session_timeout: '30',
        exchange_refresh_interval: '30',
        fiat_currency: 'CNY',
        coinPrices: {
            // no save
            AION: 0, // exchange rate against fiat_currency
            BTC: 0,
            ETH: 0,
            LTC: 0,
            TRX: 0,
        },
        pinCodeEnabled: false,
        biometryType: 'undefined',
        touchIDEnabled: false,
        explorer_server: 'mainnet', // only used in unused dapp_send. will remove later.
        state_version: 2, // local state/db version, used to upgrade
        currentAppState: 'active',
        leaveTime: 0,
        ignoreAppState: false,
        showTouchIdDialog: true,
        // bottomBarTab: ['signed_vault', 'signed_pokket', 'signed_dex', 'signed_news', 'signed_setting'],
        bottomBarTab: ['signed_vault', 'signed_pokket', 'signed_dex', 'signed_discover', 'signed_setting'],
        activity: {
            enabled: false,
            imgUrl: '',
            linkUrl: '',
        },
    },
    subscriptions: {
        setupListenerCoinPrice({ dispatch }) {
            let listener;
            DeviceEventEmitter.addListener('update_exchange_refresh_interval', params => {
                const { exchange_refresh_interval } = params;
                console.log('update_exchange_refresh_interval=>', exchange_refresh_interval);
                if (listener) {
                    BackgroundTimer.clearInterval(listener);
                } else {
                    listener = BackgroundTimer.setInterval(() => {
                        dispatch(createAction('getCoinPrices')());
                    }, exchange_refresh_interval * 60 * 1000);
                }
            });
        },
        setupListenerAppState({ dispatch }) {
            AppState.addEventListener('change', nextAppState => {
                dispatch(createAction('tryLockScreen')({ nextAppState }));
            });
        },
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('settingsModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *loadStorage({ payload: payload_ }, { call, put }) {
            const { state_version } = payload_;
            const optionalConfigObject = {
                unifiedErrors: true, // use unified error messages (default false)
                passcodeFallback: false, // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
            };
            let biometryType;
            try {
                biometryType = yield call(TouchID.isSupported, optionalConfigObject);
                biometryType = biometryType === true ? 'TouchID' : biometryType;
            } catch (e) {
                biometryType = 'undefined';
            }
            if (state_version < 2) {
                let old_settings = yield call(Storage.get, 'settings', {});
                old_settings = upgradeSettingsV0_V1(old_settings);
                const payload = upgradeSettingsV1_V2(old_settings);
                const { lang = 'auto', exchange_refresh_interval = 30 } = payload;
                DeviceEventEmitter.emit('update_exchange_refresh_interval', {
                    exchange_refresh_interval,
                });
                updateLocale(lang);
                payload.biometryType = biometryType;
                yield put(createAction('updateState')(payload));
                yield put(createAction('saveSettings')());
            } else {
                const payload = yield call(Storage.get, 'settings', {});
                const { lang = 'auto', exchange_refresh_interval = 30 } = payload;
                updateLocale(lang);
                DeviceEventEmitter.emit('update_exchange_refresh_interval', {
                    exchange_refresh_interval,
                });
                payload.biometryType = biometryType;
                yield put(createAction('updateState')(payload));
            }
            yield put(createAction('getCoinPrices')());
            yield put(createAction('getSupportedModule')());
            return true;
        },
        *getSupportedModule(action, { select, call, put }) {
            const { result, data: supportedModule } = yield call(getSupportedModule);
            let { bottomBarTab, lang } = yield select(({ settingsModel }) => ({ ...settingsModel }));
            console.log('supportedModule', supportedModule);
            let activity = {};
            if (result) {
                lang = lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang;
                if (!supportedModule.includes('Pokket')) {
                    bottomBarTab.remove('signed_pokket');
                }
                if (!supportedModule.includes('News') || lang.indexOf('en') >= 0) {
                    bottomBarTab.remove('signed_news');
                }
                if (!supportedModule.includes('Kyber')) {
                    bottomBarTab.remove('signed_dex');
                }
                if (supportedModule.includes('RedEnvelope')) {
                    const { result, data: activityData } = yield call(getActivityConstant);
                    activity.enabled = true;
                    if (result) {
                        activity.imgUrl = activityData.imageUrl;
                        activity.linkUrl = activityData.imageLink;
                    }
                }
                yield put(createAction('updateState')({ bottomBarTab, activity }));
            } else {
                lang = lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang;
                if (lang.indexOf('en') >= 0) {
                    bottomBarTab.remove('signed_news');
                }
                bottomBarTab.remove('signed_pokket');
                yield put(createAction('updateState')({ bottomBarTab, activity }));
            }
        },
        *reset(action, { put }) {
            yield put(createAction('updateState')({ pinCodeEnabled: false, touchIDEnabled: false }));
            yield put(createAction('saveSettings')());
        },
        *saveSettings(action, { call, select }) {
            const toBeSaved = yield select(({ settingsModel }) => ({
                lang: settingsModel.lang,
                login_session_timeout: settingsModel.login_session_timeout,
                exchange_refresh_interval: settingsModel.exchange_refresh_interval,
                fiat_currency: settingsModel.fiat_currency,
                pinCodeEnabled: settingsModel.pinCodeEnabled,
                touchIDEnabled: settingsModel.touchIDEnabled,
                explorer_server: settingsModel.explorer_server, // only used in unused dapp_send. will remove later.
                state_version: settingsModel.state_version, // local state/db version, used to upgrade
            }));
            yield call(Storage.set, 'settings', toBeSaved);
        },
        *getCoinPrices(action, { call, put, select }) {
            const { fiat_currency } = yield select(mapToSettings);
            console.log('getCoinPrices=>', fiat_currency);
            try {
                const prices = yield call(getCoinPrices, fiat_currency);
                console.log('getCoinPrices=>', prices);
                const coinPrices = prices.reduce((map, item) => {
                    map[item.crypto] = item.price;
                    return map;
                }, {});
                yield put(createAction('updateState')({ coinPrices }));
                return true;
            } catch (e) {
                console.log('get coin price errors:', e);
                return false;
            }
        },
        *updateFiatCurrency(
            {
                payload: { currency },
            },
            { call, put },
        ) {
            try {
                const prices = yield call(getCoinPrices, currency);
                const coinPrices = prices.reduce((map, item) => {
                    map[item.crypto] = item.price;
                    return map;
                }, {});
                yield put(createAction('updateState')({ coinPrices, fiat_currency: currency }));
                yield put(createAction('saveSettings')());
                return true;
            } catch (e) {
                console.log('get coin price errors:', e);
                AppToast.show(strings('error_connect_remote_server'), {
                    position: AppToast.positions.CENTER,
                });
                return false;
            }
        },
        *updateExchangeRefreshInterval(
            {
                payload: { interval },
            },
            { put },
        ) {
            yield put(createAction('updateState')({ exchange_refresh_interval: interval }));
            DeviceEventEmitter.emit('update_exchange_refresh_interval', {
                exchange_refresh_interval: interval,
            });
            yield put(createAction('saveSettings')());
        },
        *updateLocale(
            {
                payload: { lang },
            },
            { call, select, put },
        ) {
            updateLocale(lang);
            let { bottomBarTab } = yield select(({ settingsModel }) => ({ ...settingsModel }));
            const lang_ = lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang;

            if (lang_.indexOf('en') >= 0) {
                bottomBarTab.remove('signed_news');
            } else {
                // try add signed_news
                const { result, data: supportedModule } = yield call(getSupportedModule);
                if (result) {
                    if (supportedModule.includes('News')) {
                        bottomBarTab = [...bottomBarTab.slice(0, -1), 'signed_news', ...bottomBarTab.slice(-1)];
                    }
                }
            }

            yield put(createAction('updateState')({ lang, bottomBarTab }));
            yield put(createAction('saveSettings')());
        },
        *updateLoginSessionTimeOut(
            {
                payload: { time },
            },
            { put },
        ) {
            yield put(createAction('updateState')({ login_session_timeout: time }));
            yield put(createAction('saveSettings')());
        },
        *switchPinCode(action, { select, put }) {
            const { pinCodeEnabled } = yield select(mapToSettings);
            if (pinCodeEnabled) {
                yield put(createAction('updateState')({ pinCodeEnabled: false, touchIDEnabled: false }));
                yield put(createAction('userModel/updatePinCode')({ hashed_pinCode: '' }));
            } else {
                yield put(createAction('updateState')({ pinCodeEnabled: true }));
            }
            yield put(createAction('saveSettings')());
        },
        *switchTouchId(action, { call, select, put }) {
            const { touchIDEnabled } = yield select(mapToSettings);
            if (touchIDEnabled) {
                yield put(createAction('updateState')({ touchIDEnabled: false }));
            } else {
                const optionalConfigObject = {
                    unifiedErrors: true, // use unified error messages (default false)
                    passcodeFallback: false, // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
                };
                try {
                    const biometryType = yield call(TouchID.isSupported, optionalConfigObject);
                    if (biometryType === true || biometryType === 'TouchID' || biometryType === 'FaceID') {
                        yield put(createAction('updateState')({ touchIDEnabled: true }));
                    } else {
                        AppToast.show(strings(`pinCode.touchID_NOT_SUPPORTED`));
                    }
                } catch (e) {
                    AppToast.show(strings(`pinCode.touchID_NOT_SUPPORTED`));
                }
            }
            yield put(createAction('saveSettings')());
        },
        *tryLockScreen(
            {
                payload: { nextAppState },
            },
            { put, select },
        ) {
            const { currentAppState, pinCodeEnabled, leaveTime, login_session_timeout, ignoreAppState } = yield select(mapToSettings);
            const { isLogin } = yield select(mapToUsers);
            if (ignoreAppState || !isLogin) {
                return;
            }
            if (currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
                console.log('App has come to the foreground!');
                popCustom.hide();
                if (pinCodeEnabled) {
                    yield put(
                        NavigationActions.navigate({
                            routeName: 'unlock',
                            params: { cancel: false },
                        }),
                    );
                }
                yield put(createAction('updateState')({ currentAppState: nextAppState, leaveTime: Date.now() }));
            }
            if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App has come to the background!');
                const diff = Date.now() - leaveTime;
                if (leaveTime && diff > login_session_timeout * 60 * 1000) {
                    yield put(createAction('userModel/logOut')());
                    yield put(
                        createAction('updateState')({
                            currentAppState: nextAppState,
                            showTouchIdDialog: false,
                        }),
                    );
                } else {
                    yield put(
                        createAction('updateState')({
                            currentAppState: nextAppState,
                            showTouchIdDialog: true,
                        }),
                    );
                }
            }
        },
        *checkVersion(action, { select, call }) {
            let currentVersionCode = DeviceInfo.getBuildNumber();
            const { lang } = yield select(({ settingsModel }) => ({ ...settingsModel }));
            let versionUpdateLanguage = lang;
            if (lang === 'auto') {
                versionUpdateLanguage = DeviceInfo.getDeviceLocale().substring(0, 2);
            }
            try {
                const version = yield call(getLatestVersion, Platform.OS, currentVersionCode, versionUpdateLanguage);
                console.log('latest version is: ', version);
                if (version.versionCode <= currentVersionCode) {
                    AppToast.show(strings('about.version_latest'));
                } else {
                    let options = [
                        {
                            text: strings('cancel_button'),
                            onPress: () => {},
                        },
                        {
                            text: strings('alert_button_upgrade'),
                            onPress: () => {
                                if (Platform.OS === 'android') {
                                    setTimeout(() => upgradeForAndroid(version), 500);
                                } else {
                                    upgradeForIOS();
                                }
                            },
                        },
                    ];
                    if (version.mandatory) {
                        options.shift();
                    }
                    popCustom.show(strings('version_upgrade.alert_title_new_version'), generateUpdateMessage(version), options, {
                        canHide: false,
                        cancelable: false,
                    });
                }
            } catch (e) {
                console.log('get latest version failed: ', e);
                AppToast.show(strings('version_upgrade.toast_get_latest_version_fail'));
            }
        },
        *checkForceVersion(action, { call, select }) {
            let versionCode = DeviceInfo.getBuildNumber();
            console.log(`current version code: ${versionCode}`);
            const { lang } = yield select(({ settingsModel }) => ({ ...settingsModel }));
            console.log(`select lang:${lang}`);
            let versionUpdateLanguage = lang;
            if (lang === 'auto') {
                versionUpdateLanguage = DeviceInfo.getDeviceLocale().substring(0, 2);
            }
            console.log(`send lang:${versionUpdateLanguage}`);

            try {
                const version = yield call(getLatestVersion, Platform.OS, versionCode, lang);
                console.log('latest version: ', version);
                if (versionCode !== version.versionCode && version.mandatory) {
                    popupUpdateDialog(version);
                }
            } catch (e) {
                console.log('get latest version failed: ', e);
                // ignore this error
            }
        },
    },
};

const mapToSettings = ({ settingsModel }) => ({ ...settingsModel });
const mapToUsers = ({ userModel }) => ({ ...userModel });

const upgradeSettingsV0_V1 = old_settings => {
    let new_settings = { ...old_settings };
    new_settings.state_version = 1;
    new_settings.coinPrices = {};
    new_settings.explorer_server = 'mainnet';
    delete new_settings.theme;
    delete new_settings.tx_fee;
    delete new_settings.endpoint_wallet;
    delete new_settings.endpoint_dapps;
    delete new_settings.endpoint_odex;
    delete new_settings.endpoint_odex;
    return new_settings;
};

const upgradeSettingsV1_V2 = old_settings => {
    let new_settings = { ...old_settings };
    new_settings.state_version = 2;
    return new_settings;
};

const updateLocale = lang => {
    if (lang === 'auto') {
        setLocale(DeviceInfo.getDeviceLocale());
    } else {
        setLocale(lang);
    }
};

const upgradeForIOS = () => {
    // TODO: consider dynamic load this uri
    Linking.openURL('https://itunes.apple.com/us/app/makkii/id1457952857?ls=1&mt=8').catch(error => {
        console.log('open app store url failed: ', error);
        AppToast.show(strings('version_upgrade.toast_to_appstore_fail'));
    });
};

const upgradeForAndroid = version => {
    let index = version.url.lastIndexOf('/');
    let filename = version.url.substring(index + 1, version.url.length);

    let filePath = `${RNFS.CachesDirectoryPath}/${filename}`;
    console.log(`download to ${filePath}`);
    let download = RNFS.downloadFile({
        fromUrl: version.url,
        toFile: filePath,
        progress: res => {
            let progress = res.bytesWritten / res.contentLength;
            console.log(`progress: ${progress}`);
            popCustom.setProgress(progress);
        },
        progressDivider: 1,
    });
    download.promise.then(
        result => {
            popCustom.hide();
            console.log('download result: ', result);
            if (result.statusCode === 200) {
                console.log(`install apk: api level: ${DeviceInfo.getAPILevel()},packageId: ${DeviceInfo.getBundleId()}, filePath: ${filePath}`);
                NativeModules.InstallApk.install(DeviceInfo.getAPILevel(), DeviceInfo.getBundleId(), filePath);
            } else {
                AppToast.show(strings('version_upgrade.toast_download_fail'));
            }
        },
        error => {
            console.log('download file error:', error);
            AppToast.show(strings('version_upgrade.toast_download_fail'));
            popCustom.hide();
        },
    );

    popCustom.show(
        strings('version_upgrade.label_downloading'),
        '',
        [
            {
                text: strings('cancel_button'),
                onPress: () => {
                    console.log('cancel downloading.');
                    RNFS.stopDownload(download.jobId);
                },
            },
        ],
        {
            type: 'progress',
            cancelable: false,
            canHide: true,
            callback: () => {},
            progress: 0.01,
        },
    );
};

const generateUpdateMessage = version => {
    let message = `${strings('version_upgrade.label_version')}: ${version.version}`;
    if (version.updatesMap) {
        let keys = Object.keys(version.updatesMap);
        if (keys.length > 0) {
            message = `${message}\n${strings('version_upgrade.label_updates')}: \n${version.updatesMap[keys[0]]}`;
        }
    }
    return message;
};

const popupUpdateDialog = version => {
    popCustom.show(
        strings('version_upgrade.alert_title_new_version'),
        generateUpdateMessage(version),
        [
            {
                text: strings('alert_button_upgrade'),
                onPress: () => {
                    if (Platform.OS === 'android') {
                        setTimeout(() => forceUpgradeForAndroid(version), 500);
                    } else {
                        upgradeForIOS();
                    }
                },
            },
        ],
        {
            forceExist: Platform.OS === 'ios',
            canHide: false,
            cancelable: false,
        },
    );
};

const forceUpgradeForAndroid = version => {
    let index = version.url.lastIndexOf('/');
    let filename = version.url.substring(index + 1, version.url.length);

    let filePath = `${RNFS.CachesDirectoryPath}/${filename}`;
    console.log(`download to ${filePath}`);

    tryDownload(version, filePath);
};

const tryDownload = (version, filePath) => {
    popCustom.show(strings('version_upgrade.label_downloading'), '', [], {
        type: 'progress',
        cancelable: false,
        canHide: false,
        callback: () => {},
        progress: 0.01,
    });
    let download = RNFS.downloadFile({
        fromUrl: version.url,
        toFile: filePath,
        progress: res => {
            let progress = res.bytesWritten / res.contentLength;
            console.log(`progress: ${progress}`);
            popCustom.setProgress(progress);
        },
        progressDivider: 1,
    });
    download.promise.then(
        result => {
            popupUpdateDialog(version);
            console.log('download result: ', result);
            if (result.statusCode === 200) {
                console.log(`install apk: ${DeviceInfo.getAPILevel()} ${DeviceInfo.getBundleId()}`);
                NativeModules.InstallApk.install(DeviceInfo.getAPILevel(), DeviceInfo.getBundleId(), filePath);
            } else {
                AppToast.show(strings('version_upgrade.toast_download_fail'));
            }
        },
        error => {
            console.log('download error: ', error);
            AppToast.show(strings('version_upgrade.toast_download_fail'));
            popupUpdateDialog(version);
        },
    );
};
