import {createAction} from "../utils/dva";
import {parseScannedData,validateAddress} from "../services/contactAddService";
import {accountKey} from "../utils";
import {AppToast} from "../utils/AppToast";
import {strings} from "../locales/i18n";
import Toast from "react-native-root-toast";

const init ={
    symbol:'AION',
    address: '',
    name: '',
    editable: true,
};

export default {
    namespace: 'contactAddModal',
    state:init,
    reducers:{
        updateState(state, {payload}){
            console.log('payload=>',payload);
            return {...state,...payload};
        }
    },
    effects:{
        *reset(action, {put}){
            yield put(createAction('updateState')(init));
        },
        *parseScannedData({payload:{data}}, {call, select, put}){
            const {symbol} = yield select(mapToConTactAddModal);
            const ret = yield call(parseScannedData, data, symbol);
            if(ret.result){
                yield put(createAction('updateState')({...ret.data}));
            }
            return ret.result;
        },
        *addContact({payload}, {call, put, select}){
            const {address_book} = yield select(mapToUserModal);
            const {symbol, address, name} = yield select(mapToConTactAddModal);
            const contactObj = {symbol, address, name, ...payload};
            const key = accountKey(contactObj.symbol, contactObj.address);
            const ret = yield call(validateAddress, contactObj.symbol, contactObj.address);
            if(!ret){
                AppToast.show(strings('add_address.error_address_format', { coin: this.newSymbol }), {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER
                });
                return false;
            }
            if(address_book[key]){
                AppToast.show(strings('add_address.error_address_exists'), {
                    duration: AppToast.durations.LONG,
                    position: AppToast.positions.CENTER,
                });
                return false;
            }
            yield put(createAction('userModal/addContact')({contactObj}));
            return true;
        }

    }
}

const mapToConTactAddModal = ({contactAddModal})=>({...contactAddModal});
const mapToUserModal = ({userModal})=>({...userModal});