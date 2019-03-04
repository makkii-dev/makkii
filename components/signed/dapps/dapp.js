import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, View, DeviceEventEmitter, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import Web3WebView from 'react-native-web3-webview';
import createInvoke from '../../../libs/aion-web3-inject/webView-invoke/native';
import * as RNFS from 'react-native-fs';
import {strings} from "../../../locales/i18n";

let isInjected = false;
class Dapp extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.dappName || 'Dapp'
    });


    constructor(props) {
        super(props);
        this.uri = this.props.navigation.state.params.uri;
        this.webViewRef = null;
        this.count = 0;
        this.listeners = [];
        this.state={
            inject:'',
            loading:false,
        }
    }
    getInitState=()=>{
        console.log('getInitState');
        const network = this.props.setting.endpoint_wallet;
        const wallet = Object.values(this.props.accounts)[0].address;
        return {
            network,
            wallet,
        };
    };

    EthsignTransaction = ()=>{
        console.log('eth_signTransaction');
    };

    EthsendTransaction = ()=> {
        console.log('eth_sendTransaction');
        return new Promise((resolve, reject) => {
            const count = this.count++;
            const message =  `Dappsend_${count}`;
            this.props.navigation.navigate('signed_dapps_send', {message: message});
            this.listeners[count] = DeviceEventEmitter.addListener(message, (res)=>{
                this.listeners[count].remove();
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
    };
    Ethaccounts = ()=>{
        console.log('eth_accounts');
        return [Object.values(this.props.accounts)[0].address];
    };

    componentWillUnmount(): void {
        this.listeners.forEach(d=>d.remove());
    }

    componentDidMount() {
        console.log('[route]' + this.props.navigation.state.routeName);


        RNFS.readFileAssets('contentScript.bundle.js', 'utf8').then((content)=>{
            this.setState({
                inject: content
            },()=>{
                this.invoke=createInvoke(()=>this.webViewRef);
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

    onMessage=(event)=>{
        this.invoke.listener(event)
    };


    render() {
        if(this.state.inject === ''){
            return (
                <View style={{flex: 1,justifyContent: 'center', alignItems:'center'}}>
                    <ActivityIndicator
                        animating={true}
                        color='red'
                        size="large"
                    />
                </View>
            );
        }else{
            return (
                <View style={{flex: 1}}>
                    <Web3WebView
                        ref={ref=>this.webViewRef=ref}
                        source={{uri: this.uri}}
                        cacheEnabled={false}
                        onMessage={this.onMessage}
                        injectedOnStartLoadingJavaScript={this.state.inject}
                    />
                </View>
            )
        }
    }
}
export default connect(state => {return ({dapps: state.dapps, setting: state.setting, accounts:state.accounts});})(Dapp);
