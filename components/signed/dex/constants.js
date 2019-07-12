import DeviceInfo from "react-native-device-info";
import {Platform} from "react-native";

const DEX_MENU = [
    {
        title: 'token_exchange.title_exchange_history',
        image: require('../../../assets/icon_history.png'),
    },
    {
        title: 'token_exchange.title_exchange_rules',
        image: require('../../../assets/icon_rules.png'),
    }
];

const getExchangeRulesURL = (_lang) =>{
    let lang = _lang;
    if (lang === 'auto') {
        if (DeviceInfo.getDeviceLocale().startsWith("zh")) {
            lang = "zh";
        } else {
            lang = "en";
        }
    }

    let initialUrl;
    const file_prefix = 'static/exchange_rule_';
    if (Platform.OS === 'ios') {
        if (lang === 'en') {
            initialUrl = require('../../../' +　file_prefix + 'en.html');
        } else {
            initialUrl = require('../../../' + file_prefix + 'zh.html');
        }
    } else {
        initialUrl = {uri: 'file:///android_asset/' + file_prefix + lang + ".html"};
    }
    return initialUrl;
};

export {
    DEX_MENU,
    getExchangeRulesURL
}