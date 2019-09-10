import AsyncStorage from '@react-native-community/async-storage';
import SInfo from 'react-native-sensitive-info';

function clear() {
    return AsyncStorage.clear();
}

function get(key, defaultValue = null, needParse = true) {
    return AsyncStorage.getItem(key).then(value => (value !== null ? (needParse ? JSON.parse(value) : value) : defaultValue));
}

function set(key, value) {
    return AsyncStorage.setItem(key, JSON.stringify(value));
}

function remove(key) {
    return AsyncStorage.removeItem(key);
}

function multiGet(...keys) {
    return AsyncStorage.multiGet([...keys]).then(stores => {
        const data = {};
        stores.forEach((result, i, store) => {
            data[store[i][0]] = JSON.parse(store[i][1]);
        });
        return data;
    });
}

function multiRemove(...keys) {
    return AsyncStorage.multiRemove([...keys]);
}

const SensitiveConfigs = {
    keychainService: 'MakkiiKeychain',
    sharedPreferencesName: 'MakkiiSharedPrefs',
};

function Sset(key, value) {
    return SInfo.setItem(key, value, SensitiveConfigs);
}

function Sget(key, defaultValue = null) {
    return SInfo.getItem(key, SensitiveConfigs).then(value => (value !== null ? value : defaultValue));
}

function Sremove(key) {
    return SInfo.deleteItem(key, SensitiveConfigs);
}

const Storage = {
    clear,
    get,
    set,
    remove,
    multiGet,
    multiRemove,
};

const SensitiveStorage = {
    get: Sget,
    set: Sset,
    remove: Sremove,
};
export { Storage, SensitiveStorage };
