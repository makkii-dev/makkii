import { HttpClient } from 'lib-common-util-js';
import Config from 'react-native-config';
import { getOrRequestToken } from './setting.service';

export const getApps = async () => {
    const url = `${Config.app_server_api}/config/modules`;
    const token = await getOrRequestToken();
    const header = {
        Authorization: `Bearer ${token}`,
    };
    try {
        const { data } = await HttpClient.get(url, undefined, false, header);
        console.log('[makkii config modules]:', data);
        let enabledApps = {};
        for (const module of data) {
            if (module.moduleName.match(/^News$|^BlockchainExplorer$|^AionStaking$|^Pokket$/) && module.enabled) {
                enabledApps[module.moduleName] = {
                    ...module.moduleParams,
                };
            }
        }
        return enabledApps;
    } catch (e) {
        console.log('getApps error=>', e);
        return {};
    }
};
