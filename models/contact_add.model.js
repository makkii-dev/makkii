/* eslint-disable camelcase */
import Toast from 'react-native-root-toast';
import { createAction } from '../utils/dva';
import { parseScannedData, validateAddress } from '../services/contact_add.service';
import { AppToast } from '../app/components/AppToast';
import { strings } from '../locales/i18n';
import { sameAddress } from '../client/api';

const init = {
    symbol: 'AION',
    address: '',
    name: '',
    editable: true,
};

export default {
    namespace: 'contactAddModel',
    state: {
        ...init,
        processing: false,
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('contactAddModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *reset(action, { put }) {
            yield put(createAction('updateState')(init));
        },
        *parseScannedData(
            {
                payload: { data },
            },
            { call, select, put },
        ) {
            const { symbol } = yield select(mapToContactAddModel);
            const ret = yield call(parseScannedData, data, symbol);
            if (ret.result) {
                yield put(createAction('updateState')({ ...ret.data }));
            }
            return ret;
        },
        *addContact({ payload }, { call, put, select }) {
            const { address_book } = yield select(mapToUserModel);
            const { symbol, address, name, editable, processing } = yield select(mapToContactAddModel);
            const contactObj = { symbol, address, name, ...payload };
            if (processing) {
                return false;
            }
            yield put(createAction('updateState')({ processing: true }));
            const ret = yield call(validateAddress, contactObj.address, contactObj.symbol);
            if (!ret) {
                AppToast.show(strings('add_address.error_address_format', { coin: contactObj.symbol }), {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                });
                yield put(createAction('updateState')({ processing: false }));
                return false;
            }
            const exist = Object.keys(address_book)
                .filter(k => k.startsWith(contactObj.symbol))
                .reduce((exist, el) => {
                    exist = exist || sameAddress(contactObj.symbol, el.slice(el.indexOf('+') + 1), contactObj.address);
                    return exist;
                }, false);

            if (exist && editable) {
                AppToast.show(strings('add_address.error_address_exists'), {
                    duration: AppToast.durations.LONG,
                    position: AppToast.positions.CENTER,
                });
                yield put(createAction('updateState')({ processing: false }));

                return false;
            }
            yield put(createAction('userModel/addContact')({ contactObj }));
            yield put(createAction('reset')());
            yield put(createAction('updateState')({ processing: false }));

            return true;
        },
    },
};

const mapToContactAddModel = ({ contactAddModel }) => ({ ...contactAddModel });
const mapToUserModel = ({ userModel }) => ({ ...userModel });
