/* eslint-disable camelcase */
import Config from 'react-native-config';
import { HttpClient } from 'makkii-coins';

const getLatestVersion = async (platform, versionCode, lang) => {
    const url = `${Config.app_server_api}/appVersion/latest?versionCode=${versionCode}&platform=${platform}&lang=${lang}`;
    console.log(`GET ${url}`);
    const { data } = await HttpClient.get(url);
    return data;
};

export { getLatestVersion };
