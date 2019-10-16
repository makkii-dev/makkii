/* eslint-disable camelcase */
import { DeviceEventEmitter } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import * as bip39 from 'bip39';
import { SensitiveStorage, Storage } from '../utils/storage';
import { createAction } from '../utils/dva';
import { accountKey, hashPassword, validatePassword } from '../utils';
import { strings } from '../locales/i18n';
import { sendLoginEventLog } from '../services/event_log.service';

/*
    features: manage user base information
 */
export default {
    namespace: 'userModel',
    state: {
        isLogin: false,
        hashed_password: '',
        hashed_pinCode: '',
        isBackUp: false,
        address_book: {},
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('userModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *loadStorage(
            {
                payload: { state_version },
            },
            { call, put },
        ) {
            // Don't need upgrade
            const _payload = yield call(Storage.get, 'user');
            let payload = { ..._payload };
            if (payload) {
                ``;
                if (state_version < 2) {
                    SensitiveStorage.set('mnemonic', payload.mnemonic);
                    delete payload.mnemonic;
                }
                yield put(createAction('updateState')(payload));
            }
            return true;
        },
        *saveUser(action, { select, call }) {
            const toBeSaved = yield select(({ userModel }) => ({
                hashed_password: userModel.hashed_password,
                hashed_pinCode: userModel.hashed_pinCode,
                isBackUp: userModel.isBackUp,
                address_book: userModel.address_book,
            }));
            yield call(Storage.set, 'user', toBeSaved);
        },
        *addContact(
            {
                payload: { contactObj },
            },
            { select, put },
        ) {
            let { address_book } = yield select(mapToUserModel);
            address_book[accountKey(contactObj.symbol, contactObj.address)] = contactObj;
            yield put(createAction('updateState')({ address_book }));
            yield put(createAction('saveUser')());
        },
        *deleteContact(
            {
                payload: { key },
            },
            { select, put },
        ) {
            const { address_book } = yield select(mapToUserModel);
            let new_address_book = { ...address_book };
            delete new_address_book[key];
            yield put(createAction('updateState')({ address_book: new_address_book }));
            yield put(createAction('saveUser')());
        },
        *updatePassword({ payload }, { select, put }) {
            const { hashed_password } = payload;
            const accountsKey = yield select(({ accountsModel }) => accountsModel.accountsKey);
            yield put(createAction('updateState')({ hashed_password }));
            yield put(createAction('saveUser')());
            // re-save all accounts
            yield put(createAction('accountsModel/saveAccounts')({ keys: accountsKey }));
        },
        *updatePinCode({ payload }, { put }) {
            const { hashed_pinCode } = payload;
            yield put(createAction('updateState')({ hashed_pinCode }));
            yield put(createAction('saveUser')());
        },
        *register({ payload }, { call, put }) {
            const { password, password_confirm } = payload;
            if (!validatePassword(password)) {
                return { result: false, error: strings('register.error_password') };
            }
            if (password !== password_confirm) {
                return { result: false, error: strings('register.error_dont_match') };
            }
            const mnemonic = bip39.generateMnemonic();
            yield call(SensitiveStorage.set, 'mnemonic', mnemonic);
            const hashed_password = hashPassword(password);
            yield put(
                createAction('updateState')({
                    hashed_password,
                    hashed_pinCode: '',
                    address_book: {},
                }),
            );
            yield put(createAction('saveUser')());
            return { result: true, data: mnemonic };
        },
        *recovery({ payload }, { call, put }) {
            const { password, password_confirm, mnemonic } = payload;
            if (!validatePassword(password)) {
                return { result: false, error: strings('register.error_password') };
            }
            if (password !== password_confirm) {
                return { result: false, error: strings('register.error_dont_match') };
            }
            const hashed_password = hashPassword(password);
            yield call(SensitiveStorage.set, 'mnemonic', mnemonic);
            yield put(
                createAction('updateState')({
                    hashed_password,
                    hashed_pinCode: '',
                    isBackUp: true,
                    address_book: {},
                }),
            );
            yield put(createAction('saveUser')());
            return { result: true };
        },
        *reset(action, { call, put }) {
            yield call(SensitiveStorage.remove, 'mnemonic');
            yield put(
                createAction('updateState')({
                    hashed_password: '',
                    hashed_pinCode: '',
                    isBackUp: false,
                    address_book: {},
                }),
            );
            yield put(createAction('saveUser')());
        },
        *login(action, { put }) {
            yield put(createAction('updateState')({ isLogin: true }));
            yield put(createAction('settingsModel/getSupportedModule')());
            yield put(
                StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'signed_home' })],
                }),
            );
            sendLoginEventLog();
            DeviceEventEmitter.emit('check_all_transaction_status', { trigger: true });
        },
        *logOut(action, { put }) {
            yield put(createAction('updateState')({ isLogin: false }));
            yield put(createAction('settingsModel/updateState')({activity: {}}));
            yield put(
                StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'unsigned_login', params: { transition: 'modal' } })],
                }),
            );
            DeviceEventEmitter.emit('check_all_transaction_status', { trigger: false });
        },
        *backupFinish(action, { put }) {
            yield put(createAction('updateState')({ isBackUp: true }));
            yield put(createAction('saveUser')());
        },
        *getMnemonic(action, { call }) {
            return yield call(SensitiveStorage.get, 'mnemonic');
        },
    },
};

const mapToUserModel = ({ userModel }) => ({ ...userModel });
