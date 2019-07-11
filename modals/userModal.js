import {Storage} from "../utils/storage";
import {createAction} from "../utils/dva";

/*
    features: manage user base information
 */
export default {
    namespace: 'userModal',
    state:{
        hashed_password: '',
        hashed_pinCode: '',
        mnemonic: '',
        address_book:{},
    },
    reducers:{
        updateState(state,{payload}){
            console.log('payload=>',payload);
            return {...state,...payload};
        }
    },
    effects:{
        *loadStorage(action,{call,put}){
            // Don't need upgrade
            const payload = yield call(Storage.get, 'user');
            yield put(createAction('updateState')(payload));
            return true;
        },
        *saveUser(action,{select,call}){
            const toBeSaved = yield select(({userModal})=>({
                hashed_password: userModal.hashed_password,
                hashed_pinCode: userModal.hashed_pinCode,
                mnemonic: userModal.mnemonic,
                address_book: userModal.address_book,
            }));
            yield call(Storage.set, 'user',toBeSaved);
        }
    }
}