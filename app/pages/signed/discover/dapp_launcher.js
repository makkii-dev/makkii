import React from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Image, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Bridge from 'makkii-webview-bridge/dist/native';
import { ProgressBar } from '../../../components/ProgressBar';
import { COINS } from '../../../../client/support_coin_list';
import { createAction } from '../../../../utils/dva';

const { width } = Dimensions.get('window');
const renderLoading = () => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
            }}
        >
            <ActivityIndicator animating color="red" size="large" />
        </View>
    );
};
let invoke;
const getMagnitude = n => Math.floor(Math.log(n) / Math.LN10 + 0.000000001);

const getCurrentAccount = symbol => {
    symbol = Object.keys(COINS).indexOf(symbol) >= 0 ? symbol : 'AION';
    const { currentAccount, accountsKey } = AppStore.getState().accountsModel;
    if (currentAccount.startsWith(symbol)) {
        return currentAccount.substr(symbol.length + 1);
    }
    const accounts = accountsKey.filter(k => k.startsWith(symbol));
    const _acc = accounts[0];
    if (_acc) {
        AppStore.dispatch(createAction('accountsModel/updateState')({ currentAccount: _acc }));
        return _acc.substr(symbol.length + 1);
    }
    // no account that meet the condition
    return '';
};

const switchAccount = navigation => symbol =>
    new Promise((resolve, reject) => {
        symbol = Object.keys(COINS).indexOf(symbol) >= 0 ? symbol : 'AION';
        navigation.navigate('signed_Dex_account_list', {
            type: symbol,
            usage: 'dapp',
            callback: (err, value) => {
                console.log('err', err);
                console.log('value', value);
                if (err) {
                    reject(err);
                }
                resolve(value);
            },
        });
    });

const sendTx = navigation => txObj =>
    new Promise((resolve, reject) => {
        console.log('sendTx=>', txObj);
        AppStore.dispatch(
            createAction('txSenderModel/updateState')({
                ...txObj,
                gasPrice: txObj.gasPrice && (getMagnitude(txObj.gasPrice) >= 9 ? txObj.gasPrice / 1e9 : txObj.gasPrice),
                editable: false,
            }),
        );
        navigation.navigate('signed_vault_send', {
            title: 'Dapp Send',
            callback: (err, value) => {
                console.log('err', err);
                console.log('value', value);
                if (err) {
                    reject(err);
                }
                resolve(value);
            },
        });
    });
let canGoBack = false;

const dappLauncher = props => {
    const [state, setState] = React.useState({
        WebViewProgress: 0,
        showProgressBar: true,
    });

    const { navigation } = props;
    const uri = navigation.getParam('uri');
    const webViewRef = React.useRef();
    const handleProcessBar = v => {
        setState({ ...state, WebViewProgress: 0, showProgressBar: v });
    };

    const onGoBack = () => {
        console.log('onGoBack=>', canGoBack);
        if (canGoBack) {
            webViewRef.current.goBack();
        } else {
            navigation.goBack();
        }
    };

    const onMessage = event => {
        canGoBack = event.nativeEvent.canGoBack;
        invoke.listener(event);
    };

    const onReload = () => {
        handleProcessBar(true);
        webViewRef.current.reload();
    };
    React.useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            onGoBack(); // works best when the goBack is async
            return true;
        });
        return () => {
            handler.remove();
        };
    });
    React.useEffect(() => {
        navigation.setParams({
            Reload: onReload,
        });
        invoke = new Bridge(() => webViewRef.current);
        invoke.define('getCurrentAccount', getCurrentAccount);
        invoke.define('switchAccount', switchAccount(navigation));
        invoke.define('sendTx', sendTx(navigation));
    }, []);
    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={webViewRef}
                source={{ uri }}
                cacheEnabled={false}
                useWebKit
                onMessage={onMessage}
                renderLoading={renderLoading}
                startInLoadingState
                originWhitelist={['*']}
                allowFileAccess
                onLoadStart={() => handleProcessBar(true)}
                onLoadProgress={e => {
                    setState({ ...state, WebViewProgress: e.nativeEvent.progress });
                }}
                onNavigationStateChange={navState => {
                    canGoBack = navState.canGoBack;
                    navigation.setParams({ dappName: navState.title });
                }}
            />
            {state.showProgressBar ? (
                <ProgressBar style={{ position: 'absolute', top: 0, width, height: 2 }} width={width} progress={state.WebViewProgress} color="red" onComplete={() => handleProcessBar(false)} />
            ) : null}
        </View>
    );
};

dappLauncher.navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.dappName || 'Dapp',
    headerRight: (
        <TouchableOpacity
            activeOpacity={1}
            style={{
                height: 48,
                width: 48,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
            }}
            onPress={() => {
                navigation.state.params.Reload && navigation.state.params.Reload();
            }}
        >
            <Image source={require('../../../../assets/icon_refresh.png')} style={{ height: 24, width: 24, tintColor: '#fff' }} resizeMode="contain" />
        </TouchableOpacity>
    ),
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
                source={require('../../../../assets/icon_popCustom_clear.png')}
                style={{
                    tintColor: 'white',
                    width: 20,
                    height: 20,
                }}
            />
        </TouchableOpacity>
    ),
});

export default dappLauncher;
