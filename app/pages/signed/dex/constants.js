import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

const DEX_MENU = [
    {
        title: 'token_exchange.title_exchange_history',
        image: require('../../../../assets/icon_history.png'),
    },
    {
        title: 'token_exchange.title_exchange_rules',
        image: require('../../../../assets/icon_rules.png'),
    },
];

const getExchangeRulesURL = _lang => {
    let lang = _lang;
    if (lang === 'auto') {
        if (DeviceInfo.getDeviceLocale().startsWith('zh')) {
            lang = 'zh';
        } else {
            lang = 'en';
        }
    }

    let initialUrl;
    const filePrefix = 'static/exchange_rule_';
    if (Platform.OS === 'ios') {
        if (lang === 'en') {
            initialUrl = require(`../../../../${filePrefix}en.html`);
        } else {
            initialUrl = require(`../../../../${filePrefix}zh.html`);
        }
    } else {
        initialUrl = { uri: `file:///android_asset/${filePrefix}${lang}.html` };
    }
    return initialUrl;
};

export { DEX_MENU, getExchangeRulesURL };
