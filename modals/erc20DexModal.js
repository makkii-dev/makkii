import {NavigationActions} from "react-navigation";
import {genTradeData, getTokenList, getTokenTradeRate,getEnabledStatus} from '../services/erc20DexService';
import {createAction} from "../utils/dva";
import {AppToast} from "../utils/AppToast";
import {strings} from "../locales/i18n";
import {COINS} from "../coins/support_coin_list";
import {popCustom} from "../utils/dva";

export default {
    namespace: 'ERC20Dex',
    state:{
        isLoading: true,
        isWaiting: false,
        network: COINS.ETH.network,
        currentAccount: '',
        tokenList: {},
        trade:{
            srcToken: '',
            destToken: '',
            tradeRate: 1,
        }
    },
    reducers:{
        ERC20DexUpdateState(state, {payload}){
            return {...state, ...payload};
        },

    },
    effects:{
        *getTokenList({payload}, {call, select, put}){
            const network = yield select(({ERC20Dex})=>ERC20Dex.network);
            const lists = yield call(getTokenList,network);
            // init trade;
            const srcToken = Object.keys(lists)[0];
            const destToken = Object.keys(lists)[1];
            const rate = yield call(getTokenTradeRate,srcToken, destToken, network);
            console.log(`get rate ${srcToken} -> ${destToken}=${rate}`);
            const trade = {
                srcToken:srcToken,
                destToken: destToken,
                tradeRate: rate,
            };
            yield put(createAction('ERC20DexUpdateState')({isLoading:false,tokenList:lists, trade:trade}));
        },
        *updateTrade({payload},{call,put,select}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            const network = yield select(({ERC20Dex})=>ERC20Dex.network);
            const {srcToken,destToken} = payload;
            if(tokenList[srcToken]===undefined){
                AppToast.show(strings('token_exchange.toast_not_support',{token: srcToken}));
                return;
            }
            if(tokenList[destToken]===undefined){
                AppToast.show(strings('token_exchange.toast_not_support',{token: destToken}));
                return;
            }
            const rate = yield call(getTokenTradeRate,srcToken, destToken, network);
            console.log(`get rate ${srcToken} -> ${destToken}=${rate}`);
            let trade = {
                srcToken:srcToken,
                destToken: destToken,
                tradeRate: rate,
            };
            yield put(createAction('ERC20DexUpdateState')({trade:trade,isWaiting:false}));
        },
        *trade({payload},{call,put, select}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const {srcToken,destToken,srcQty,destQty, account} = payload;
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            const network = yield select(({ERC20Dex})=>ERC20Dex.network);
            if('ETH'===srcToken){
                //  no need approve
                const tradeDatResp = yield call(genTradeData,account.address,'0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', tokenList[destToken].address,srcQty,destQty,network);
                if(!tradeDatResp.error){
                    const rawTx = tradeDatResp.data[0];
                    console.log('rawTx=>',rawTx);
                    yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{rawTx:rawTx, account:account}}))
                }else{
                    AppToast.show(tradeDatResp["reason"] + tradeDatResp["additional_data"]);
                }
            }else{
                // check enabledStatus
                const txs_required = yield call(getEnabledStatus, account.address,tokenList[srcToken].address,network);
                if(txs_required === 1){
                    // No allowance so approve to maximum amount (2^255)
                    popCustom.show(

                    )

                }else if(txs_required ===2){

                }else{
                    const tradeDatResp = yield call(genTradeData,account.address,tokenList[srcToken].address, tokenList[destToken].address,srcQty,destQty,network);
                    if(!tradeDatResp.error){
                        const rawTx = tradeDatResp.data[0];
                        console.log('rawTx=>',rawTx);
                        yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{rawTx:rawTx, account:account}}))
                    }else{
                        AppToast.show(tradeDatResp["reason"] + tradeDatResp["additional_data"]);
                    }
                }
            }
            yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
        }

    }
}