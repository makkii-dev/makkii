import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    View,
    DeviceEventEmitter,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Platform,
    Text,
    BackHandler
} from 'react-native';
import Web3WebView from 'react-native-web3-webview';
import createInvoke from '../../../libs/aion-web3-inject/webView-invoke/native';
import * as RNFS from 'react-native-fs';
import {strings} from "../../../locales/i18n";
import {alert_ok} from '../../common';

class Dapp extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.dappName || 'Dapp',
        headerRight: (
            <TouchableOpacity activeOpacity={1} style={{height:48, width:48, justifyContent: 'center', alignItems: 'center', marginRight:10}} onPress={()=>{
                navigation.state.params.Reload&&navigation.state.params.Reload();
            }}>
                <Image source={require("../../../assets/refresh.png")} style={{height:24,width:24,tintColor:'#fff'}} resizeMode={'contain'}/>
            </TouchableOpacity>
        ),
        headerLeft:(
            <TouchableOpacity onPress={()=>{navigation.state.params.GoBack&&navigation.state.params.GoBack()}} style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Image source={require('../../../assets/arrow_back.png')} style={{
                    tintColor: 'white',
                    width: 20,
                    height: 20,
                }} />
            </TouchableOpacity>
        )
    });

    onGoBack = ()=>{
        if(this.canGoBack) {
            this.webViewRef.goBack();
        }else{
            this.props.navigation.goBack();
        }
    };


    constructor(props) {
        super(props);
        this.uri = this.props.navigation.state.params.uri;
        this.wallet = null;
        Object.values(this.props.accounts).map(v=>{
            if (v.isDefault)
                this.wallet = v.address;
        });
        if(!this.wallet){
            console.log('not set makkii');
            alert_ok(strings('alert_title_error'), strings('dapp_send.error_not_set_default'));
            this.props.navigation.goBack();
        }
        this.webViewRef = null;
        this.count = 0;
        this.listeners = [];
        this.state={
            inject:'',
            loading:false,
        };
        this.props.navigation.setParams({
            Reload:()=>this.onReload(),
            GoBack: ()=>this.onGoBack(),
        })
    }
    getInitState=()=>{
        console.log('getInitState');
        const network = this.props.setting.endpoint_wallet;
        const wallet = this.wallet;
        return {
            network,
            wallet,
        };
    };

    EthsignTransaction = (txInfo)=>{
        console.log('eth_signTransaction');
        return new Promise((resolve, reject) => {
            reject("Temporarily not implemented")
        })
    };

    EthsendTransaction = (txInfo)=> {
        console.log('eth_sendTransaction');
        return new Promise((resolve, reject) => {
            const count = this.count++;
            const message =  `Dappsend_${count}`;
            setTimeout(()=>{
                if(this.listeners[count]){
                    this.listeners[count].remove();
                    delete this.listeners[count];
                    reject("timeOut")
                }
            },5*60*1000);
            this.props.navigation.navigate('signed_dapps_send', {message: message, txInfo: txInfo});
            this.listeners[count] = DeviceEventEmitter.addListener(message, (res)=>{
                this.listeners[count].remove();
                delete this.listeners[count];
                console.log('res ', res);
                if (res.cancel||res.error){
                    console.log('reject');
                    reject(res.data);
                }else{
                    resolve(res.data);
                }
            })
        })
    };

    Ethsign = ()=>{
        console.log('eth_sign');
        return new Promise((resolve, reject) => {
            reject("Temporarily not implemented")
        })
    };
    Ethaccounts = ()=>{
        console.log('eth_accounts');
        return this.wallet;
    };

    componentWillUnmount(): void {
        this.listeners.forEach(d=>d.remove());
        this.backHandler.remove();
    }

    componentWillMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoBack(); // works best when the goBack is async
            return true;
        });
        console.log('[route]' + this.props.navigation.state.routeName);
        if (Platform.OS==='android') {
            RNFS.readFileAssets('contentScript.bundle.js', 'utf8').then((content) => {
                this.setState({
                    inject: content
                }, () => {
                    this.invoke = createInvoke(this.webViewRef);
                    this.invoke.define('getInitState', this.getInitState)
                        .define('eth_signTransaction', this.EthsignTransaction)
                        .define('eth_sendTransaction', this.EthsendTransaction)
                        .define('eth_sign', this.Ethsign)
                        .define('eth_accounts', this.Ethaccounts);
                    this.updateCurrentNetwork = this.invoke.bind("updateCurrentNetwork");
                    this.updateCurrentAddress = this.invoke.bind("updateCurrentAddress");
                });
            })
        }else {
            const path = `${RNFS.MainBundlePath}/contentScript.bundle.js`;
            RNFS.readFile(path, 'utf8').then((content) => {
                this.setState({
                    inject: content
                }, () => {
                    this.invoke = createInvoke(() => this.webViewRef);
                    this.invoke.define('getInitState', this.getInitState)
                        .define('eth_signTransaction', this.EthsignTransaction)
                        .define('eth_sendTransaction', this.EthsendTransaction)
                        .define('eth_sign', this.Ethsign)
                        .define('eth_accounts', this.Ethaccounts);
                    this.updateCurrentNetwork = this.invoke.bind("updateCurrentNetwork");
                    this.updateCurrentAddress = this.invoke.bind("updateCurrentAddress");
                });
            })
        }
    }

    onMessage=(event)=>{
        this.invoke.listener(event)
    };

    onReload = ()=>{
        this.webViewRef.reload();
    };

    renderLoading = () => {
        return (
            <View style={{flex: 1,justifyContent: 'center', alignItems:'center'}}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    };

    render() {
        if(this.state.inject === ''){
            return this.renderLoading();
        }else{
            return (
                <View style={{flex: 1}}>
                    <Web3WebView
                        ref={ref=>this.webViewRef=ref}
                        source={{uri: this.uri}}
                        cacheEnabled={false}
                        onMessage={this.onMessage}
                        renderLoading={()=>this.renderLoading()}
                        injectedOnStartLoadingJavaScript={this.state.inject}
                        onNavigationStateChange={(navState)=>{
                            this.canGoBack = navState.canGoBack;
                        }}
                        onLoadEnd={()=>{
                            setTimeout(() => {
                                this.updateCurrentNetwork && this.updateCurrentNetwork(this.props.setting.endpoint_wallet);
                                this.updateCurrentAddress && this.updateCurrentAddress(this.wallet);
                            }, 500);
                        }}
                    />
                </View>
            )
        }
    }
}
export default connect(state => {return ({dapps: state.dapps, setting: state.setting, accounts:state.accounts});})(Dapp);
