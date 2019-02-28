import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, View, DeviceEventEmitter} from 'react-native';
import {WebView} from 'react-native-webview';
import createInvoke from '../../../libs/aion-web3-inject/webView-invoke/native';
import * as RNFS from 'react-native-fs';
import {strings} from "../../../locales/i18n";

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
    };

    componentWillUnmount(): void {
        this.listeners.forEach(d=>d.remove());
    }

    componentDidMount() {
        console.log('[route]' + this.props.navigation.state.routeName);
        RNFS.readFileAssets('contentScript.bundle.js', 'utf8').then((content)=>{
            this.invoke=createInvoke(()=>this.webViewRef);
            this.invoke.define('getInitState', this.getInitState)
                .define('eth_signTransaction', this.EthsignTransaction)
                .define('eth_sendTransaction', this.EthsendTransaction)
                .define('eth_sign', this.Ethsign)
                .define('eth_accounts', this.Ethaccounts);
            this.webViewRef.injectJavaScript(content);
            this.updateCurrentNetwork = this.invoke.bind("updateCurrentNetwork");
            this.updateCurrentAddress = this.invoke.bind("updateCurrentAddress");
        })
    }

    onMessage=(event)=>{
        this.invoke.listener(event)
    };


    render() {
        return (
            <View style={{flex: 1, backgroundColor: "orange"}}>
                <Button title={"Test"} onPress={()=>{
                    this.updateCurrentNetwork("http://localhost:8545");
                    // this.webViewRef.postMessage("123");
                }}/>
                <WebView
                    ref={ref=>this.webViewRef=ref}
                    source={{uri: this.uri}}
                    cacheEnabled={false}
                    onMessage={this.onMessage}
                />
            </View>
        )
    }
}
export default connect(state => {return ({dapps: state.dapps, setting: state.setting, accounts:state.accounts});})(Dapp);
