import {
    createBottomTabNavigator,
    createStackNavigator,
    BottomTabBar,
    NavigationActions,
    StackActions
} from "react-navigation";
import React, {PureComponent} from 'react';
import {View, TouchableOpacity, Image, BackHandler, Easing, Animated} from 'react-native';
import {
    createReduxContainer,
    createNavigationReducer,
    createReactNavigationReduxMiddleware,
} from "react-navigation-redux-helpers";
import {connect} from 'react-redux';
import {AppToast} from "../utils/AppToast";

// ui
import Scan                  	from './scan.js';
import Splash                	from './splash.js';
import Login                 	from './unsigned/login.js';
import Register              	from './unsigned/register.js';
import RegisterMnemonic      	from './unsigned/register_mnemonic.js';
import Recovery              	from './unsigned/recovery.js';
import Vault                	from './signed/vault/home.js';
import VaultAccount         	from './signed/vault/account.js';
import VaultAccountTokens       from './signed/vault/account_tokens.js';
import VaultImportHdWallet   	from './signed/vault/import_list';
import VaultImportCoin          from './signed/vault/import_coin';
import VaultImportFrom          from './signed/vault/import_from';
import VaultImportPrivateKey 	from './signed/vault/import_private_key.js';
import VaultReceive          	from './signed/vault/receive.js';
import VaultSend             	from './signed/vault/send.js';
import VaultTransaction      	from './signed/vault/transaction.js';
import VaultTransactionHistory 	from './signed/vault/transaction_history.js';
import VaultChangeAccountName   from './signed/vault/change_account_name.js';
import VaultExportPRivateKey    from './signed/vault/export_private_key.js';
import Dapps                 	from './signed/dapps/home.js';
import DappsDapp             	from './signed/dapps/dapp.js';
import DappsLaunch           	from './signed/dapps/launch.js';
import DappsSend 	         	from './signed/dapps/dapp_send.js';
import Dex                      from './signed/dex/home.js';
import DexTAccountList          from './signed/dex/account_list.js';
import DexExchangeTokenList   from './signed/dex/exchange_token_list.js';
import Setting               	from './signed/setting/home.js';
import SettingAbout          	from './signed/setting/about.js';
import SettingPassword       	from './signed/setting/password.js';
import SettingRecovery       	from './signed/setting/recovery.js';
import SettingServices       	from './signed/setting/services.js';
import SettingLanguage      	from './signed/setting/language.js';
import SettingAdvanced       	from './signed/setting/advanced.js';
import SettingCurrency       	from './signed/setting/currency.js';
import SettingPinCode           from './signed/setting/pinCode.js';
import SettingAddressBook       from './signed/setting/address_book.js';
import SettingAddAddress        from './signed/setting/add_address.js';
import RecoveryPassword      	from './unsigned/recovery_password.js';
import SimpleWebView         	from './WebViewComponent';
import PinCodeScreen            from './pinCodeScreen';
import SelectCoin               from './signed/vault/select_coin';
import AddToken                 from './signed/vault/add_token';



import {strings} from "../locales/i18n";
import {ComponentTabBar} from './common';
import {createAction} from "../utils/dva";

const transitionConfig = () => {
    return {
        transitionSpec: {
            duration: 0,
            easing: Easing.out(Easing.poly(4)),
            timing: Animated.timing,
            useNativeDriver: true,
        },
        screenInterpolator: sceneProps => {
            const { layout, position, scene } = sceneProps;
            const thisSceneIndex = scene.index;
            const width = layout.initWidth;

            const translateX = position.interpolate({
                inputRange: [thisSceneIndex - 1, thisSceneIndex],
                outputRange: [width, 0],
            });

            return { transform: [ { translateX } ] }
        },
    }
};



const navigationOptions = ({navigation}) => ({
    headerRight: (<View/>),
    headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Image source={require('../assets/arrow_back.png')} style={{
                tintColor: 'white',
                width: 20,
                height: 20,
            }} />
        </TouchableOpacity>
    ),
    headerStyle: styles.headerStyle,
    headerTitleStyle: styles.headerTitleStyle
});

const navigationOptionsWithoutShadow = ({navigation}) => ({
    headerRight: (<View/>),
    headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Image source={require('../assets/arrow_back.png')} style={{
                tintColor: 'white',
                width: 20,
                height: 20,
            }} />
        </TouchableOpacity>
    ),
    headerStyle: styles.headerStyleWithoutShadow,
    headerTitleStyle: styles.headerTitleStyle,
    headerTitleAllowFontScaling: false,
});

const navigationOptionsWithoutRight = ({navigation}) => ({
    headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Image source={require('../assets/arrow_back.png')} style={{
                tintColor: 'white',
                width: 20,
                height: 20,
            }} />
        </TouchableOpacity>
    ),
    headerStyle: styles.headerStyle,
    headerTitleStyle: styles.headerTitleStyle,
    headerTitleAllowFontScaling: false,
});


const tabNavigator = createBottomTabNavigator({
    'signed_vault': createStackNavigator({
        'signed_vault':{
            screen: Vault,
            navigationOptions: {
                header: null
            }
        }
    }),
    'signed_dapps': createStackNavigator({
        'signed_dapps':{
            screen: DappsLaunch,
            navigationOptions: {
                headerLeft: null,
                headerRight: null,
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTitleAllowFontScaling: false,
            }}
    }),
    'signed_dex': createStackNavigator({
        'signed_dex': {
            screen: Dex,
            navigationOptions: {
                headerLeft: null,
                headerRight: null,
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTitleAllowFontScaling: false,
            }}
    }),
    'signed_setting': createStackNavigator({
        'signed_setting':{
            screen: Setting,
            navigationOptions: {
                headerLeft: null,
                headerRight: null,
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTitleAllowFontScaling: false,
            }}
    })},{
    initialRouteName:'signed_vault',
    tabBarComponent: (props)=>{

        return(
            <BottomTabBar
                {...props}
                style={{
                    backgroundColor: 'white',
                    borderTopWidth: 0.3,
                    borderTopColor: '#8c8a8a',
                    height:50,
                }}
                tabStyle={{
                    padding:5,
                }}
                allowFontScaling={false}
                adaptive={true}
                getLabelText = {(scene)=>{
                    const routeName = scene.route.routeName;
                    return 'signed_vault' === routeName?strings('menuRef.title_wallet')
                    :'signed_dapps'=== routeName?strings('menuRef.title_dapps')
                    :'signed_setting' === routeName?strings('menuRef.title_settings') :strings('menuRef.title_dex');
                }}
                renderIcon={(scene)=>{
                    const {route, tintColor} =  scene;
                    const {routeName} = route;
                    return 'signed_vault' === routeName?<Image source={require('../assets/tab_wallet.png')} style={{width:24, height: 24, marginTop:2, opacity: 0.6, tintColor:tintColor}} resizeMode={'contain'}/>
                        :'signed_dapps'=== routeName?<Image source={require('../assets/tab_app.png')} style={{width:24, height: 24, marginTop:2, opacity: 0.6, tintColor: tintColor}} resizeMode={'contain'}/>
                        :'signed_setting' === routeName?<Image source={require('../assets/tab_settings.png')} style={{width:24, height: 24, marginTop:2, opacity: 0.6, tintColor:tintColor}} resizeMode={'contain'}/>
                        :<Image source={require('../assets/icon_token_exchange.png')} style={{width:24, height: 24, marginTop:2, opacity: 0.6, tintColor:tintColor}} resizeMode={'contain'}/>
                }}

            />
        )}
});
const AppNavigator = createStackNavigator({
    'unlock': {
        screen: PinCodeScreen,
        navigationOptions: {
            header: null,
            gesturesEnabled: false,
        }
    },
    'splash':   {
        screen:Splash,
        navigationOptions: {
            header: null
        }
    },
    'scan': {
        screen: Scan,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'unsigned_login': {
        screen: Login,
        navigationOptions: {
            header: null
        }
    },
    'unsigned_register': {
        screen: Register,
        navigationOptions: navigationOptionsWithoutShadow,
    },
    'unsigned_register_mnemonic': {
        screen: RegisterMnemonic,
        navigationOptions,
    },
    'unsigned_recovery': {
        screen: Recovery,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'unsigned_recovery_password': {
        screen: RecoveryPassword,
        navigationOptions,
    },
    'signed_home': {
        screen:tabNavigator,
        navigationOptions:{
            header: null,
        }
    },
    'signed_vault_account': {
        screen: VaultAccount,
        navigationOptions: ({navigation}) =>({
            headerLeft: (
                <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image source={require('../assets/arrow_back.png')} style={{
                        tintColor: 'white',
                        width: 20,
                        height: 20,
                    }} />
                </TouchableOpacity>
            ),
            headerStyle: styles.headerStyleWithoutShadow,
        }),
    },
    'signed_vault_account_tokens': {
        screen: VaultAccountTokens,
        navigationOptions: ({navigation}) =>({
            headerLeft: (
                <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image source={require('../assets/arrow_back.png')} style={{
                        tintColor: 'white',
                        width: 20,
                        height: 20,
                    }} />
                </TouchableOpacity>
            ),
            headerStyle: styles.headerStyleWithoutShadow,
        }),
    },
    'signed_vault_import_coin': {
        screen: VaultImportCoin,
        navigationOptions,
    },
    'signed_vault_import_from': {
        screen: VaultImportFrom,
        navigationOptions,
    },
    'signed_vault_import_list': {
        screen: VaultImportHdWallet,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_vault_import_private_key': {
        screen: VaultImportPrivateKey,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_vault_receive': {
        screen: VaultReceive,
        navigationOptions: navigationOptionsWithoutShadow,
    },
    'signed_vault_send': {
        screen: VaultSend,
        navigationOptions,
    },
    'signed_select_coin': {
        screen: SelectCoin,
        navigationOptions: ({navigation}) =>({
            headerLeft: (
                <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image source={require('../assets/arrow_back.png')} style={{
                        tintColor: 'white',
                        width: 20,
                        height: 20,
                    }} />
                </TouchableOpacity>
            ),
            headerStyle: styles.headerStyleWithoutShadow,
        }),
    },
    'signed_Dex_exchange_token_list':{
        screen:DexExchangeTokenList,
        navigationOptions
    },
    'signed_Dex_account_list':{
        screen:DexTAccountList,
        navigationOptions
    },
    'signed_add_token': {
        screen: AddToken,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_vault_transaction': {
        screen: VaultTransaction,
        navigationOptions,
    },
    'signed_vault_transaction_history':{
        screen: VaultTransactionHistory,
        navigationOptions,
    },
    'signed_vault_change_account_name':{
        screen: VaultChangeAccountName,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_vault_export_private_key':{
        screen: VaultExportPRivateKey,
        navigationOptions
    },
    'signed_dapps_dapp': {
        screen: DappsDapp,
        navigationOptions: {
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
            headerTitleAllowFontScaling: false,
        }
    },
    'signed_dapps_send': {
        screen: DappsSend,
        navigationOptions: {
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
            headerTitleAllowFontScaling: false,
        }
    },
    'signed_setting_about': {
        screen: SettingAbout,
        navigationOptions,
    },
    'signed_setting_password': {
        screen: SettingPassword,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_setting_recovery': {
        screen: SettingRecovery,
        navigationOptions,
    },
    'signed_setting_services': {
        screen: SettingServices,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_setting_currency': {
        screen: SettingCurrency,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_setting_language': {
        screen: SettingLanguage,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_setting_advanced': {
        screen: SettingAdvanced,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_setting_pinCode': {
        screen: SettingPinCode,
        navigationOptions
    },
    'signed_setting_address_book': {
        screen: SettingAddressBook,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'signed_setting_add_address': {
        screen: SettingAddAddress,
        navigationOptions: navigationOptionsWithoutRight,
    },
    'simple_webview': {
        screen: SimpleWebView,
        navigationOptions: {
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
            headerTitleAllowFontScaling: false,
        }
    }
}, {
    initialRouteName: 'splash',
    swipeEnabled: false,
    animationEnabled: false,
    lazy: true,
    transitionConfig: transitionConfig
});

const defaultGetStateForAction = AppNavigator.router.getStateForAction;
AppNavigator.router.getStateForAction = (action, state) => {
    if (state) {
        let newRoutes, newIndex;
        switch(action.type){
            case 'Navigation/NAVIGATE':
                if (state.routes[state.routes.length - 1].routeName === 'unlock') {
                    newRoutes = state.routes.slice(0,state.routes.length-1);
                    newIndex = newRoutes.length;
                    return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
                } else {
                    return defaultGetStateForAction(action, state);
                }
            case 'Navigation/BACK':
                if (state.routes && state.routes.length > 0) {

                    newRoutes = state.routes.filter(
                        r =>
                            r.routeName !== 'scan' &&
                            r.routeName !== 'splash' &&
                            r.routeName !== 'unlock'
                    );
                    newIndex = newRoutes.length - 1;
                    return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
                }else {
                    return defaultGetStateForAction(action, state);
                }
            default:
                return defaultGetStateForAction(action, state);
        }
    }
    return defaultGetStateForAction(action, state);
};

export const routerReducer = createNavigationReducer(AppNavigator);

export const routerMiddleware = createReactNavigationReduxMiddleware(
    state => state.router
)

const App = createReduxContainer(AppNavigator);

class Router extends PureComponent {
    backClickCount=0;
    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backHandle);
        this.props.dispatch(createAction('txsListener/loadStorage')());
        this.listenTx = setInterval(()=>{
            this.props.dispatch(createAction('txsListener/checkAllTxs')());
        },10*1000);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backHandle);
        clearInterval(this.listenTx);
    }

    backHandle = () => {
        const currentScreen = getActiveRouteName(this.props.router);
        console.log('currentScreen=>',currentScreen);
        if (currentScreen === "signed_dapps"||currentScreen === "signed_vault"||currentScreen === "signed_setting"||currentScreen === "signed_dex") {
            if(this.backClickCount === 1){
                listenApp.stop(()=> BackHandler.exitApp());
                this.props.dispatch(StackActions.reset({
                    index:0,
                    actions:[
                        NavigationActions.navigate({routeName:'unsigned_login'})
                    ]
                }));
            }else{
                this.prepare();
            }
            return true;
        }else if(currentScreen !== 'unsigned_login'){
            this.props.dispatch(NavigationActions.back());
            return true;
        }
        return false;
    };


    prepare() {
        this.backClickCount = 1;
        AppToast.show(strings('toast_double_press_exit'), {
            onHidden:()=>this.backClickCount&&(this.backClickCount = 0),
        });
    }

    render() {
        const { app, dispatch, router,setting} = this.props;

        return <App dispatch={dispatch} state={router} screenProps={{
                t:strings,
                lan: setting.lan,
            }}/>
    }
}

const mapStateToProps = state => {
    const { app, router,setting} = state;
    return { app, router,setting };
};

export default connect(mapStateToProps)(Router);


const getActiveRouteName = navigationState => {
    if (!navigationState) {
        return null;
    }
    const route = navigationState.routes[navigationState.index];
    if (route.routes) {
        return getActiveRouteName(route);
    }
    return route.routeName;
};


