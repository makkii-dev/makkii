import {Storage} from "../utils/storage";
import {createAction} from "../utils/dva";
import {accountKey, hashPassword, validatePassword} from "../utils";
import keyStore from "react-native-makkii-core";
import {strings} from "../locales/i18n";
import {NavigationActions, StackActions} from "react-navigation";
import {generateMnemonic} from "../libs/aion-hd-wallet";

/*
    features: manage user base information
 */
export default {
    namespace: 'userModel',
    state:{
        isLogin: false,
        hashed_password: '',
        hashed_pinCode: '',
        mnemonic: '',
        address_book:{},
    },
    reducers:{
        updateState(state,{payload}){
            console.log('userModel payload=>',payload);
            return {...state,...payload};
        }
    },
    effects:{
        *loadStorage(action,{call,put}){
            // Don't need upgrade
            const payload = yield call(Storage.get, 'user');
            if (payload) {
                keyStore.createByMnemonic(payload.mnemonic, '');
                yield put(createAction('updateState')(payload));
            }
            return true;
        },
        *saveUser(action,{select,call}){
            const toBeSaved = yield select(({userModel})=>({
                hashed_password: userModel.hashed_password,
                hashed_pinCode: userModel.hashed_pinCode,
                mnemonic: userModel.mnemonic,
                address_book: userModel.address_book,
            }));
            yield call(Storage.set, 'user',toBeSaved);
        },
        *addContact({payload:{contactObj}}, {select, put}){
            let {address_book} = yield select(mapToUserModal);
            address_book[accountKey(contactObj.symbol, contactObj.address)] = contactObj;
            yield put(createAction('updateState')({address_book}));
            yield put(createAction('saveUser')());
        },
        *deteleContact({payload:{key}},{select, put}){
            let {address_book} = yield select(mapToUserModal);
            delete address_book[key];
            yield put(createAction('updateState')({address_book}));
            yield put(createAction('saveUser')());
        },
        *updatePassword({payload}, {select,put}){
            const {hashed_password} = payload;
            const accountsKey = yield select(({accountsModel})=>accountsModel.accountsKey);
            yield put(createAction('updateState')({hashed_password}));
            yield put(createAction('saveUser')());
            // re-save all accounts
            yield put(createAction('accountsModel/saveAccounts')({keys:accountsKey}));
        },
        *updatePinCode({payload}, {put}){
            const {hashed_pinCode} = payload;
            yield put(createAction('updateState')({hashed_pinCode}));
            yield put(createAction('saveUser')());
        },
        *register({payload}, {call,put}){
            const {password, password_confirm} = payload;
            if(!validatePassword(password)){
                return {result:false, error:strings("register.error_password")}
            }
            if(password!==password_confirm){
                return {result:false, error:strings("register.error_dont_match")}
            }
            const mnemonic = generateMnemonic();
            keyStore.createByMnemonic(mnemonic,'');
            const hashed_password = hashPassword(password);
            yield put(createAction('updateState')({hashed_password,mnemonic,hashed_pinCode:'', address_book:{}}));
            yield put(createAction('saveUser')());
            return {result:true}
        },
        *recovery({payload}, {put}){
            const {password, password_confirm, mnemonic} = payload;
            if(!validatePassword(password)){
                return {result:false, error:strings("register.error_password")}
            }else if(password!==password_confirm){
                return {result:false, error:strings("register.error_password")}
            }
            const hashed_password = hashPassword(password);
            keyStore.createByMnemonic(mnemonic,'');
            yield put(createAction('updateState')({hashed_password,mnemonic,hashed_pinCode:'', address_book:{}}));
            yield put(createAction('saveUser')());
            return {result:true}
        },
        *reset(action, {put}){
            yield put(createAction('updateState')({hashed_password:'',mnemonic:'',hashed_pinCode:'', address_book:{}}));
            yield put(createAction('saveUser')());
        },
        *login(action, {put}){
            yield put(createAction('updateState')({isLogin:true}));
            yield put(StackActions.reset({
                index: 0,
                actions:[NavigationActions.navigate({routeName:'signed_home'})]
            }));
        },
        *logOut(action, {put}){
            yield put(createAction('updateState')({isLogin:false}));
            yield put(StackActions.reset({
                index: 0,
                actions:[NavigationActions.navigate({routeName:'unsigned_login'})]
            }));
        },
    }
}

const mapToUserModal = ({userModel})=>({...userModel});
