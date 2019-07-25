import HttpClient from '../utils/http_caller';
import Config from 'react-native-config';

const getLatestVersion = async (platform, versionCode, lang) => {
    const url = Config.app_server_api + "/appVersion/latest" +
        "?versionCode=" + versionCode +
        "&platform=" + platform +
        "&lang=" + lang;
    console.log("GET " + url);
    const {data} = await HttpClient.get(url);
    return data;
};

export {
    getLatestVersion
}