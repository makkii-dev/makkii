import { HttpClient } from 'lib-common-util-js';
import Config from 'react-native-config';

export const getApps = async () => {
    const url = `${Config.app_server_api}/config/modules`;
    try {
        const { data } = await HttpClient.get(url);
        let enabledApps = {};
        for (const module of data) {
            if (module.moduleName.match(/|^News$|^BlockchainExplorer$|^AionStaking$|/) && module.enabled) {
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
