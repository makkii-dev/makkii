/* eslint-disable camelcase */
import Config from 'react-native-config';
import { HttpClient } from 'lib-common-util-js';
import DevicesInfo from 'react-native-device-info';
import { Platform } from 'react-native';

const getLatestVersion = async (platform, versionCode, lang) => {
    const url = `${Config.app_server_api}/appVersion/latest?versionCode=${versionCode}&platform=${platform}&lang=${lang}`;
    console.log(`getLatestVersion ${url}`);
    try {
        const { data } = await HttpClient.get(url);
        console.log('data=>', data);
        return data;
    } catch (e) {
        return {};
    }
};

const getSupportedModule = async () => {
    const url = `${Config.app_server_api}/config`;
    console.log(`getRemoteConfig ${url}`);
    try {
        const {
            data: { supportedModule },
        } = await HttpClient.get(url);
        return { result: true, data: supportedModule };
    } catch (e) {
        return { result: false };
    }
};

const getActivityConstant = async () => {
    const url = `${Config.app_server_api}/market_activity/red_envelope/image`;
    try {
        const {
            data: { data },
        } = await HttpClient.get(url);
        return { result: true, data };
    } catch (e) {
        return { result: false };
    }
};

const uploadImage = async lists =>
    new Promise(resolve => {
        console.log('uploadImage lists=>', lists.length);
        if (lists.length === 0) {
            resolve({ result: true, urls: [] });
        } else {
            let formData = new FormData();
            for (const image of lists) {
                let file = {
                    uri: image.url,
                    type: 'multipart/form-data',
                    name: image.name,
                };
                formData.append('files', file);
            }
            const server_api = `${Config.app_server_api}/image/uploads`;
            fetch(server_api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data;charset=utf-8',
                },
                body: formData,
            })
                .then(resp => resp.json())
                .then(resp => {
                    const urls = resp.map(url => `${Config.app_server_api}/${url}`);
                    resolve({ result: true, urls });
                })
                .catch(e => {
                    console.log('upload fail', e);
                    resolve({ result: false });
                });
        }
    });

const sendFeedBack = async (feedback, contact, imageUrls) => {
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const osVersion = DevicesInfo.getSystemVersion();
    const appVersion = DevicesInfo.getVersion();
    const phoneModel = DevicesInfo.getModel();
    const phoneBrand = DevicesInfo.getBrand();
    const payload = {
        contact,
        feedback,
        imageUrls,
        osVersion,
        phoneModel,
        platform,
        appVersion,
        phoneBrand,
    };
    const url = `${Config.app_server_api}/feedback`;
    console.log('send feedback=>', payload);
    try {
        const resp = await HttpClient.put(url, payload, true);
        console.log('send Feedback resp', resp.data);
        return !!(resp.data && resp.data.id);
    } catch (e) {
        console.log('send Feedback error=>', e);
        return false;
    }
};

const getAppChangeLog = async page => {
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const currentVersionCode = DevicesInfo.getBuildNumber();
    const url = `${Config.app_server_api}/appVersion?offset=${page}&platform=${platform}&size=10&versionCode=${currentVersionCode}`;
    try {
        const { data } = await HttpClient.get(url);
        console.log('getAppChangeLog resp', data);
        if (data.content) {
            const data_ = data.content.reduce((map, el) => {
                map[el.id] = {
                    version: el.version,
                    updatesMap: el.updatesMap,
                    releaseDate: el.releaseDate,
                };
                return map;
            }, {});
            return { data: data_, result: true, nextPage: data.number + 1 };
        }
        return { data: {}, result: false };
    } catch (e) {
        console.log('getAppChangeLog error=>', e);
        return { data: {}, result: false };
    }
};

export { getLatestVersion, getSupportedModule, getActivityConstant, uploadImage, sendFeedBack, getAppChangeLog };
