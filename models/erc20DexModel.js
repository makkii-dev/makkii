import {NavigationActions} from "react-navigation";
import {
    genTradeData,
    getTokenList,
    getTokenTradeRate,
    getEnabledStatus,
    getApproveAuthorizationTx, getExchangeHistory, findSymbolByAddress
} from '../services/erc20DexService';
import {createAction, navigate} from "../utils/dva";
import {AppToast} from "../utils/AppToast";
import {strings} from "../locales/i18n";
import {COINS} from "../coins/support_coin_list";
import {popCustom} from "../utils/dva";
import {Storage} from "../utils/storage";
import BigNumber from 'bignumber.js';
import {getExchangeRulesURL} from "../components/signed/dex/constants";

const ETHID = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const network = COINS.ETH.network;
export default {
    namespace: 'ERC20Dex',
    state:{
        isLoading: true,
        isWaiting: false,
        currentAccount: '',
        tokenList: {},
        tokenApprovals:{}, // save; 2 states 'waitApprove'/'waitRevoke'
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
        *loadStorage(action,{call,put}){
            const tokenApprovals = yield call(Storage.get, 'tokenApprovals', false);
            console.log('get tokenApprovals from storage => ', tokenApprovals);
            yield put(createAction('ERC20DexUpdateState')({tokenApprovals}))
            yield put(createAction('getTokenList')());
        },
        *reset(action, {call, put}){
            yield call(Storage.remove, 'tokenApprovals');
            yield put(createAction('ERC20DexUpdateState')({tokenApprovals:{}}))
        },
        *updateTokenApproval({payload},{call,select,put}) {
            const oldTokenApprovals = yield select(({ERC20Dex}) => ERC20Dex.tokenApprovals);
            const {symbol, state, address} = payload; // state one of 'waitApprove'/'waitRevoke'/'delete'
            let newTokenApprovals =  Object.assign({},oldTokenApprovals);
            if('delete'===state){
                delete newTokenApprovals[address][symbol]
            }else {
                newTokenApprovals[address]={...newTokenApprovals[address],[symbol]:state};
            }
            yield put(createAction('ERC20DexUpdateState')({tokenApprovals:newTokenApprovals}));
            yield call(Storage.set, 'tokenApprovals', newTokenApprovals);
        },

        *getTokenList({payload}, {call, select, put}){
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
        *trade({payload},{call,put,select}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const {srcToken,destToken,srcQty,destQty, account, dispatch} = payload;
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            const lang = yield select(({settingsModel})=>settingsModel.lang);
            if('ETH'===srcToken){
                //  no need approve
                const tradeDatResp = yield call(genTradeData,account.address,ETHID, tokenList[destToken].address,srcQty,destQty,network);
                yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
                if(!tradeDatResp.error){
                    const rawTx = tradeDatResp.data[0];
                    console.log('rawTx=>',rawTx);
                    yield put(createAction('accountsModel/updateState')({currentToken:''}));
                    yield put(createAction('txSenderModel/updateState')({
                        ...rawTx,
                        gasPrice: BigNumber(rawTx.gasPrice).shiftedBy(-9).toNumber(),
                        gasLimit:BigNumber(rawTx.gasLimit).toNumber(),
                        amount:BigNumber(rawTx.value).shiftedBy(-18).toNumber(),
                        editable:false,
                        txType:{type:'exchange', data:{srcToken:srcToken,destToken:destToken,srcQty:srcQty,destQty:destQty, status:'PENDING'}}}));
                    yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{title:strings('token_exchange.title_exchange'),}}));
                }else{
                    AppToast.show(tradeDatResp["reason"] + tradeDatResp["additional_data"]);
                }
            }else{
                // check enabledStatus
                const txs_required = yield call(getEnabledStatus, account.address,tokenList[srcToken].address, network);
                console.log('tx_required=>',txs_required);
                const tokenApprovals = yield select(({ERC20Dex}) => ERC20Dex.tokenApprovals);
                if(tokenApprovals[srcToken]){
                    yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
                    AppToast.show(strings('token_exchange.toast_waitApprove',{position:AppToast.positions.TOP}));
                    return;
                }
                if(txs_required === 1){
                    // No allowance so approve to maximum amount (2^255)
                    popCustom.show(
                        strings('token_exchange.alert_title_need_authorization'),
                        strings('token_exchange.alert_content_need_approve',{token:srcToken}),
                        [
                            {
                                text:strings('token_exchange.alert_button_why_need_authorization'),
                                onPress:()=>{
                                    const initialUrl = getExchangeRulesURL(lang);
                                    navigate("simple_webview", {
                                        title: strings('token_exchange.title_exchange_rules'),
                                        initialUrl: initialUrl
                                    })({dispatch});
                                }
                            },
                            {
                                text:strings('cancel_button'),
                                onPress:()=>{}
                            },

                            {
                                text:strings('token_exchange.alert_button_approve'),
                                onPress:()=>{
                                    dispatch(createAction('ERC20Dex/enableTransfer')({token:srcToken, account:account, title:strings('token_exchange.title_approve'), type:'waitApprove'}))
                                }
                            }
                        ]
                    )
                }else if(txs_required ===2){
                    // Allowance has been given but is insufficient.
                    // Have to approve to 0 first to avoid this issue https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
                    popCustom.show(
                        strings('token_exchange.alert_title_need_authorization'),
                        strings('token_exchange.alert_content_need_re-approve'),
                        [
                            {
                                text:strings('token_exchange.alert_button_why_need_authorization'),
                                onPress:()=>{
                                    const initialUrl = getExchangeRulesURL(lang);
                                    navigate("simple_webview", {
                                        title: strings('token_exchange.title_exchange_rules'),
                                        initialUrl: initialUrl
                                    })({dispatch});
                                }
                            },
                            {
                                text:strings('cancel_button'),
                                onPress:()=>{}
                            },
                            {
                                text:strings('token_exchange.alert_button_approve'),
                                onPress:()=>{
                                    dispatch(createAction('ERC20Dex/enableTransfer')({token:srcToken, account:account, title:strings('token_exchange.title_revoke'), type:'waitRevoke'}))
                                }
                            }
                        ]
                    )
                }else{
                    const tradeDatResp = yield call(genTradeData,account.address,tokenList[srcToken].address, tokenList[destToken].address,srcQty,destQty,network);
                    if(!tradeDatResp.error){
                        const rawTx = tradeDatResp.data[0];
                        console.log('rawTx=>',rawTx);
                        yield put(createAction('accountsModel/updateState')({currentToken:''}));
                        yield put(createAction('txSenderModel/updateState')({
                            ...rawTx,
                            gasPrice: BigNumber(rawTx.gasPrice).shiftedBy(-9).toNumber(),
                            gasLimit:BigNumber(rawTx.gasLimit).toNumber(),
                            amount:BigNumber(rawTx.value).shiftedBy(-18).toNumber(),
                            editable:false,
                            txType:{type:'exchange', data:{srcToken:srcToken,destToken:destToken,srcQty:srcQty,destQty:destQty, status:'PENDING'}}}));
                        yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{title:strings('token_exchange.title_exchange'),}}))
                    }else{
                        AppToast.show(tradeDatResp["reason"] + tradeDatResp["additional_data"]);
                    }
                }
                yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
            }
        },
        *enableTransfer({payload},{call,select,put}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            const {token, account, title,type} = payload;
            const rawTx = yield call(getApproveAuthorizationTx,account.address,tokenList[token].address,network);
            console.log('rawTx=>', rawTx);
            yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
            yield put(createAction('accountsModel/updateState')({currentToken:''}));
            yield put(createAction('txSenderModel/updateState')({
                ...rawTx,
                gasPrice: BigNumber(rawTx.gasPrice).shiftedBy(-9).toNumber(),
                gasLimit:BigNumber(rawTx.gasLimit).toNumber(),
                amount:BigNumber(rawTx.value).shiftedBy(-18).toNumber(),
                editable:false,
                txType:{type:'approve',data:{address: account.address,symbol:token, state:type}}}));
            yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{title}}))
        }

    }
}