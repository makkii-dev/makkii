import {
    createBottomTabNavigator,
    createStackNavigator,
    BottomTabBar,
    NavigationActions,
} from 'react-navigation';
import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Image, BackHandler, Easing, Animated } from 'react-native';
import {
    createReduxContainer,
    createNavigationReducer,
    createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { AppToast } from './components/AppToast';
import { createAction } from '../utils/dva';
import { navigationSafely } from '../utils';
// ui
import Scan from './pages/scan';
import Splash from './pages/splash';
import Login from './pages/unsigned/login';
import Register from './pages/unsigned/register';
import RegisterMnemonic from './pages/unsigned/register_mnemonic';
import Recovery from './pages/unsigned/recovery';
import Vault from './pages/signed/vault/home';
import VaultAccount from './pages/signed/vault/account';
import VaultAccountTokens from './pages/signed/vault/account_tokens';
import VaultImportHdWallet from './pages/signed/vault/import_ledger_lists';
import VaultSelectCoin from './pages/signed/vault/select_coin';
import VaultImportFrom from './pages/signed/vault/import_from';
import VaultImportPrivateKey from './pages/signed/vault/import_private_key';
import VaultReceive from './pages/signed/vault/receive';
import VaultSend from './pages/signed/vault/send';
import VaultTransaction from './pages/signed/vault/transaction';
import VaultTransactionHistory from './pages/signed/vault/transaction_history';
import VaultSetAccountName from './pages/signed/vault/set_account_name';
import VaultExportPrivateKey from './pages/signed/vault/export_private_key';
import DappsDapp from './pages/signed/dapps/dapp';
import DappsLaunch from './pages/signed/dapps/launch';
import DappsSend from './pages/signed/dapps/dapp_send';
import Dex from './pages/signed/dex/home';
import DexTAccountList from './pages/signed/dex/account_list';
import DexExchangeTokenList from './pages/signed/dex/exchange_token_list';
import DexExchangeHistory from './pages/signed/dex/exchange_history';
import Setting from './pages/signed/setting/home';
import SettingAbout from './pages/signed/setting/about';
import SettingPassword from './pages/signed/setting/password';
import SettingRecovery from './pages/signed/setting/recovery';
import SettingLanguage from './pages/signed/setting/language';
import SettingAdvanced from './pages/signed/setting/advanced';
import SettingCurrency from './pages/signed/setting/currency';
import SettingPinCode from './pages/signed/setting/pinCode';
import SettingAddressBook from './pages/signed/setting/address_book';
import SettingAddAddress from './pages/signed/setting/add_address';
import RecoveryPassword from './pages/unsigned/recovery_password';
import SimpleWebView from './pages/simple_webview';
import PinCodeScreen from './pages/pin_code_screen';
import SelectToken from './pages/signed/vault/select_token';
import AddToken from './pages/signed/vault/add_token';
import BackUpTips from './pages/signed/backup/backup_tips';
import MnemonicBackUp from './pages/signed/backup/mnemonic_backup';
import MnemonicConfirm from './pages/signed/backup/mnemonic_confirm';

import { strings } from '../locales/i18n';
import styles from './styles';

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

            return { transform: [{ translateX }] };
        },
    };
};

const navigationOptions = ({ navigation, navigationOptions }) => {
    return {
        headerRight: <View />,
        headerLeft: (
            <TouchableOpacity
                onPress={() => {
                    navigation.goBack();
                }}
                style={{
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Image
                    source={require('../assets/arrow_back.png')}
                    style={{
                        tintColor: 'white',
                        width: 20,
                        height: 20,
                    }}
                />
            </TouchableOpacity>
        ),
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        ...navigationOptions,
    };
};

const navigationOptionsWithoutShadow = ({ navigation }) => ({
    headerRight: <View />,
    headerLeft: (
        <TouchableOpacity
            onPress={() => {
                navigation.goBack();
            }}
            style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Image
                source={require('../assets/arrow_back.png')}
                style={{
                    tintColor: 'white',
                    width: 20,
                    height: 20,
                }}
            />
        </TouchableOpacity>
    ),
    headerStyle: styles.headerStyleWithoutShadow,
    headerTitleStyle: styles.headerTitleStyle,
    headerTitleAllowFontScaling: false,
});

const navigationOptionsWithoutRight = ({ navigation }) => ({
    headerLeft: (
        <TouchableOpacity
            onPress={() => {
                navigation.goBack();
            }}
            style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Image
                source={require('../assets/arrow_back.png')}
                style={{
                    tintColor: 'white',
                    width: 20,
                    height: 20,
                }}
            />
        </TouchableOpacity>
    ),
    headerStyle: styles.headerStyle,
    headerTitleStyle: styles.headerTitleStyle,
    headerTitleAllowFontScaling: false,
});

const tabNavigator = createBottomTabNavigator(
    {
        signed_vault: createStackNavigator({
            signed_vault: {
                screen: Vault,
                navigationOptions: {
                    header: null,
                },
            },
        }),
        signed_dapps: createStackNavigator({
            signed_dapps: {
                screen: DappsLaunch,
                navigationOptions: {
                    headerLeft: null,
                    headerRight: null,
                    headerStyle: styles.headerStyle,
                    headerTitleStyle: styles.headerTitleStyle,
                    headerTitleAllowFontScaling: false,
                },
            },
        }),
        signed_dex: createStackNavigator({
            signed_dex: {
                screen: Dex,
                navigationOptions: {
                    headerLeft: <View />,
                    headerStyle: styles.headerStyle,
                    headerTitleStyle: styles.headerTitleStyle,
                    headerTitleAllowFontScaling: false,
                },
            },
        }),
        signed_setting: createStackNavigator({
            signed_setting: {
                screen: Setting,
                navigationOptions: {
                    headerLeft: null,
                    headerRight: null,
                    headerStyle: styles.headerStyle,
                    headerTitleStyle: styles.headerTitleStyle,
                    headerTitleAllowFontScaling: false,
                },
            },
        }),
    },
    {
        initialRouteName: 'signed_vault',
        tabBarComponent: props => {
            return (
                <BottomTabBar
                    {...props}
                    style={{
                        backgroundColor: 'white',
                        borderTopWidth: 0.3,
                        borderTopColor: '#8c8a8a',
                        height: 50,
                    }}
                    tabStyle={{
                        padding: 5,
                    }}
                    allowFontScaling={false}
                    adaptive
                    getLabelText={scene => {
                        const { routeName } = scene.route;
                        return routeName === 'signed_vault'
                            ? strings('menuRef.title_wallet')
                            : routeName === 'signed_dapps'
                            ? strings('menuRef.title_dapps')
                            : routeName === 'signed_setting'
                            ? strings('menuRef.title_settings')
                            : strings('menuRef.title_dex');
                    }}
                    renderIcon={scene => {
                        const { route, tintColor } = scene;
                        const { routeName } = route;
                        return routeName === 'signed_vault' ? (
                            <Image
                                source={require('../assets/tab_wallet.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginTop: 2,
                                    opacity: 0.6,
                                    tintColor,
                                }}
                                resizeMode="contain"
                            />
                        ) : routeName === 'signed_dapps' ? (
                            <Image
                                source={require('../assets/tab_app.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginTop: 2,
                                    opacity: 0.6,
                                    tintColor,
                                }}
                                resizeMode="contain"
                            />
                        ) : routeName === 'signed_setting' ? (
                            <Image
                                source={require('../assets/tab_settings.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginTop: 2,
                                    opacity: 0.6,
                                    tintColor,
                                }}
                                resizeMode="contain"
                            />
                        ) : (
                            <Image
                                source={require('../assets/icon_token_exchange.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginTop: 2,
                                    opacity: 0.6,
                                    tintColor,
                                }}
                                resizeMode="contain"
                            />
                        );
                    }}
                />
            );
        },
    },
);
const AppNavigator = createStackNavigator(
    {
        unlock: {
            screen: PinCodeScreen,
            navigationOptions: {
                header: null,
                gesturesEnabled: false,
            },
        },
        splash: {
            screen: Splash,
            navigationOptions: {
                header: null,
            },
        },
        scan: {
            screen: Scan,
            navigationOptions: navigationOptionsWithoutRight,
        },
        unsigned_login: {
            screen: Login,
            navigationOptions: {
                header: null,
            },
        },
        unsigned_register: {
            screen: Register,
            navigationOptions: navigationOptionsWithoutShadow,
        },
        unsigned_register_mnemonic: {
            screen: RegisterMnemonic,
            navigationOptions,
        },
        unsigned_recovery: {
            screen: Recovery,
            navigationOptions: navigationOptionsWithoutRight,
        },
        unsigned_recovery_password: {
            screen: RecoveryPassword,
            navigationOptions,
        },
        signed_home: {
            screen: tabNavigator,
            navigationOptions: {
                header: null,
            },
        },
        signed_vault_account: {
            screen: VaultAccount,
            navigationOptions: ({ navigation }) => ({
                headerLeft: (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={{
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={require('../assets/arrow_back.png')}
                            style={{
                                tintColor: 'white',
                                width: 20,
                                height: 20,
                            }}
                        />
                    </TouchableOpacity>
                ),
                headerStyle: styles.headerStyleWithoutShadow,
            }),
        },
        signed_vault_account_tokens: {
            screen: VaultAccountTokens,
            navigationOptions: ({ navigation }) => ({
                headerLeft: (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={{
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={require('../assets/arrow_back.png')}
                            style={{
                                tintColor: 'white',
                                width: 20,
                                height: 20,
                            }}
                        />
                    </TouchableOpacity>
                ),
                headerStyle: styles.headerStyleWithoutShadow,
            }),
        },
        signed_vault_select_coin: {
            screen: VaultSelectCoin,
            navigationOptions,
        },
        signed_vault_import_from: {
            screen: VaultImportFrom,
            navigationOptions,
        },
        signed_vault_import_list: {
            screen: VaultImportHdWallet,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_vault_import_private_key: {
            screen: VaultImportPrivateKey,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_vault_receive: {
            screen: VaultReceive,
            navigationOptions: navigationOptionsWithoutShadow,
        },
        signed_vault_send: {
            screen: VaultSend,
            navigationOptions,
        },
        signed_select_token: {
            screen: SelectToken,
            navigationOptions: ({ navigation }) => ({
                headerLeft: (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={{
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={require('../assets/arrow_back.png')}
                            style={{
                                tintColor: 'white',
                                width: 20,
                                height: 20,
                            }}
                        />
                    </TouchableOpacity>
                ),
                headerStyle: styles.headerStyleWithoutShadow,
            }),
        },
        signed_Dex_exchange_token_list: {
            screen: DexExchangeTokenList,
            navigationOptions,
        },
        signed_Dex_account_list: {
            screen: DexTAccountList,
            navigationOptions,
        },
        signed_Dex_exchange_history: {
            screen: DexExchangeHistory,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_add_token: {
            screen: AddToken,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_vault_transaction: {
            screen: VaultTransaction,
            navigationOptions,
        },
        signed_vault_transaction_history: {
            screen: VaultTransactionHistory,
            navigationOptions,
        },
        signed_vault_set_account_name: {
            screen: VaultSetAccountName,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_vault_export_private_key: {
            screen: VaultExportPrivateKey,
            navigationOptions,
        },
        signed_dapps_dapp: {
            screen: DappsDapp,
            navigationOptions: {
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTitleAllowFontScaling: false,
            },
        },
        signed_dapps_send: {
            screen: DappsSend,
            navigationOptions: {
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTitleAllowFontScaling: false,
            },
        },
        signed_setting_about: {
            screen: SettingAbout,
            navigationOptions,
        },
        signed_setting_password: {
            screen: SettingPassword,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_setting_recovery: {
            screen: SettingRecovery,
            navigationOptions,
        },
        signed_setting_currency: {
            screen: SettingCurrency,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_setting_language: {
            screen: SettingLanguage,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_setting_advanced: {
            screen: SettingAdvanced,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_setting_pinCode: {
            screen: SettingPinCode,
            navigationOptions,
        },
        signed_setting_address_book: {
            screen: SettingAddressBook,
            navigationOptions: navigationOptionsWithoutRight,
        },
        signed_setting_add_address: {
            screen: SettingAddAddress,
            navigationOptions: navigationOptionsWithoutRight,
        },
        simple_webview: {
            screen: SimpleWebView,
            navigationOptions: {
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTitleAllowFontScaling: false,
            },
        },
        signed_backup_tips: {
            screen: BackUpTips,
            navigationOptions,
        },
        signed_backup_mnemonic: {
            screen: MnemonicBackUp,
            navigationOptions,
        },
        signed_confirm_mnemonic: {
            screen: MnemonicConfirm,
            navigationOptions,
        },
    },
    {
        initialRouteName: 'splash',
        // initialRouteName: 'signed_backup_tips',
        swipeEnabled: false,
        animationEnabled: false,
        lazy: true,
        transitionConfig,
    },
);

const defaultGetStateForAction = AppNavigator.router.getStateForAction;
AppNavigator.router.getStateForAction = (action, state) => {
    if (state) {
        let newRoutes;
        let newIndex;
        switch (action.type) {
            case 'Navigation/NAVIGATE':
                if (
                    state.routes[state.routes.length - 1].routeName.match(
                        /^unlock$|^signed_backup_tips$|^signed_confirm_mnemonic$|^unsigned_register_mnemonic$/,
                    )
                ) {
                    newRoutes = state.routes.slice(0, state.routes.length - 1);
                    newIndex = newRoutes.length;
                    return defaultGetStateForAction(action, { index: newIndex, routes: newRoutes });
                }
                return defaultGetStateForAction(action, state);

            case 'Navigation/BACK':
                if (state.routes && state.routes.length > 0) {
                    newRoutes = state.routes.filter(
                        r =>
                            r.routeName !== 'scan' &&
                            r.routeName !== 'splash' &&
                            r.routeName !== 'unlock',
                    );
                    newIndex = newRoutes.length - 1;
                    return defaultGetStateForAction(action, { index: newIndex, routes: newRoutes });
                }
                return defaultGetStateForAction(action, state);

            default:
                return defaultGetStateForAction(action, state);
        }
    }
    return defaultGetStateForAction(action, state);
};

export const routerReducer = createNavigationReducer(AppNavigator);

export const routerMiddleware = createReactNavigationReduxMiddleware(state => state.router);

const App = createReduxContainer(AppNavigator);

class Router extends PureComponent {
    backClickCount = 0;

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backHandle);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backHandle);
    }

    backHandle = () => {
        const currentScreen = getActiveRouteName(this.props.router);
        console.log('currentScreen=>', currentScreen);
        if (currentScreen === 'unsigned_register_mnemonic') {
            return true;
        }
        if (
            currentScreen === 'signed_dapps' ||
            currentScreen === 'signed_vault' ||
            currentScreen === 'signed_setting' ||
            currentScreen === 'signed_dex'
        ) {
            if (this.backClickCount === 1) {
                BackHandler.exitApp();
                this.props.dispatch(createAction('userModel/logOut')());
            } else {
                this.prepare();
            }
            return true;
        }
        if (currentScreen !== 'unsigned_login') {
            this.props.dispatch(NavigationActions.back());
            return true;
        }
        return false;
    };

    prepare() {
        this.backClickCount = 1;
        AppToast.show(strings('toast_double_press_exit'), {
            onHidden: () => this.backClickCount && (this.backClickCount = 0),
        });
    }

    render() {
        const {
            lang,
            dispatch,
            router,
            pinCodeEnabled,
            hashed_password: hashedPassword,
        } = this.props;
        return (
            <App
                dispatch={dispatch}
                state={router}
                screenProps={{
                    t: strings,
                    lang: lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang,
                    navigationSafely: ({ routeName, params, onVerifySuccess = undefined }) => ({
                        dispatch,
                    }) => {
                        navigationSafely(pinCodeEnabled, hashedPassword, {
                            routeName,
                            params,
                            onVerifySuccess,
                        })({ dispatch });
                    },
                }}
            />
        );
    }
}

const mapStateToProps = state => {
    const { app, router, settingsModel, userModel } = state;
    return {
        app,
        router,
        lang: settingsModel.lang,
        pinCodeEnabled: settingsModel.pinCodeEnabled,
        hashed_password: userModel.hashed_password,
    };
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
