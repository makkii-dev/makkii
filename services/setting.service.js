/* eslint-disable camelcase */
import Config from 'react-native-config';
import { HttpClient } from 'lib-common-util-js';
import DevicesInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { Storage } from '../utils/storage';

const getLatestVersion = async (platform, versionCode, lang) => {
    const url = `${Config.app_server_api}/appVersion/latest?versionCode=${versionCode}&platform=${platform}&lang=${lang}`;
    console.log(`getLatestVersion ${url}`);
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    try {
        const { data } = await HttpClient.get(url, undefined, false, header);
        console.log('data=>', data);
        return data;
    } catch (e) {
        return {};
    }
};

const getSupportedModule = async () => {
    const url = `${Config.app_server_api}/config`;
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    console.log(`getRemoteConfig ${url}`, header);
    try {
        const { data } = await HttpClient.get(url, undefined, false, header);
        console.log(`getRemoteConfig resp=>`, data);
        return { result: true, data: data.supportedModule };
    } catch (e) {
        return { result: false };
    }
};

const getActivityConstant = async () => {
    const url = `${Config.app_server_api}/market_activity/red_envelope/image`;
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    try {
        const {
            data: { data },
        } = await HttpClient.get(url, undefined, false, header);
        return { result: true, data };
    } catch (e) {
        return { result: false };
    }
};

const uploadImage = async lists => {
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    return new Promise(resolve => {
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
                    ...header,
                    'Content-Type': 'multipart/form-data;charset=utf-8',
                },
                body: formData,
            })
                .then(resp => resp.json())
                .then(resp => {
                    const urls = resp.map(url => `${Config.app_server_api}${url}`);
                    resolve({ result: true, urls });
                })
                .catch(e => {
                    console.log('upload fail', e);
                    resolve({ result: false });
                });
        }
    });
};

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
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    const url = `${Config.app_server_api}/feedback`;
    console.log('send feedback=>', payload);
    try {
        const resp = await HttpClient.put(url, payload, true, header);
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
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    try {
        const { data } = await HttpClient.get(url, undefined, false, header);
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

const getOrRequestToken = async () => {
    const local_token_obj = await Storage.get('server_token', {});
    const currentTime = Date.now();
    const { expired, local_token } = local_token_obj;
    if (expired === undefined || currentTime > expired) {
        console.log('client_id:', Config.client_id);
        const url = `${Config.app_server_api}/oauth/token?grant_type=client_credentials&client_id=${Config.client_id}&client_secret=${Config.client_secret}`;
        console.log('url: ', url);
        try {
            const { data } = await HttpClient.post(url);
            console.log('data:', data);
            const { access_token, expires_in } = data;
            const payload = {
                local_token: access_token,
                expired: expires_in * 1000 + currentTime,
            };
            await Storage.set('server_token', payload);
            return access_token;
        } catch (e) {
            return '';
        }
    }
    return local_token;
};

export { getLatestVersion, getSupportedModule, getActivityConstant, uploadImage, sendFeedBack, getAppChangeLog, getOrRequestToken };
