import {fetchTokenDetail, getTopTokens, searchTokens} from "../coins/api";
import {createAction} from "../utils/dva";

const initToken ={
    contractAddr: '',
    name: '',
    symbol: '',
    tokenDecimal: '',
};

export default {
    namespace: 'tokenImportModal',
    state:{
        tokenToBeImported:initToken,
        token_lists:[]
    },
    reducers:{
        updateState(state, {payload}){
            console.log('payload=>', payload);
            return {...state, ...payload}
        }
    },
    effects:{
        *searchTokens({payload:{keyword}}, {call, select, put }){
            const {currentAccount} = yield select(({accountsModal})=>{
                const {currentAccount,accountsMap} = accountsModal;
                return ({
                    currentAccount: accountsMap[currentAccount],
                })
            });
            const {symbol} = currentAccount;
            let token_lists = [];
            try{
                token_lists = yield call(searchTokens,symbol,keyword);
            }catch (e) {
                console.log("search token failed:", e);
            }
            yield put(createAction('updateState')({token_lists}));
            return token_lists.length;

        },
        *getTopTokens(action, {call, select, put}){
            const {currentAccount} = yield select(({accountsModal})=>{
                const {currentAccount,accountsMap} = accountsModal;
                return ({
                    currentAccount: accountsMap[currentAccount],
                })
            });
            const {symbol} = currentAccount;
            let token_lists = [];
            try{
                token_lists = yield call(getTopTokens,symbol);
            }catch (e) {
                console.log("get Top tokens failed:", e);
            }
            yield put(createAction('updateState')({token_lists}));
            return token_lists.length;
        },
        *fetchTokenDetail({payload:{address}},{call, select, put}){
            const {currentAccount} = yield select(({accountsModal})=>{
                const {currentAccount,accountsMap} = accountsModal;
                return ({
                    currentAccount: accountsMap[currentAccount],
                })
            });
            try {
                const {name, symbol, decimals} = yield call(fetchTokenDetail, currentAccount.symbol, address);
                const tokenToBeImported = {
                    contractAddr: address,
                    name,
                    symbol,
                    tokenDecimal: decimals
                };
                yield put(createAction('updateState')({tokenToBeImported}));
                return true;
            }catch (e) {
                return false;
            }
        }
    }
}