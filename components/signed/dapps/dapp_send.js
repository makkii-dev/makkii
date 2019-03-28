import * as React from 'react';
import {
    View,
    DeviceEventEmitter,
    TouchableOpacity,
    Text,
    BackHandler,
    ScrollView,
    Keyboard, StyleSheet, Dimensions, PixelRatio,Platform
} from 'react-native';
import {strings} from "../../../locales/i18n";
import BigNumber from "bignumber.js";
import Loading from '../../loading';
import {AionTransaction} from "../../../libs/aion-hd-wallet";
import {Ed25519Key} from "../../../libs/aion-hd-wallet/src/key/Ed25519Key";
import {update_account_txs} from "../../../actions/accounts";
import Toast from "react-native-root-toast";
import {getLedgerMessage, validateAddress, validateAmount, validatePositiveInteger} from "../../../utils";
import {connect} from "react-redux";
import {ComponentButton, SubTextInput, alert_ok} from "../../common";
import defaultStyles from '../../styles';
import {linkButtonColor, mainBgColor} from '../../style_util';
import { KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const MyScrollView = Platform.OS === 'ios'?KeyboardAwareScrollView:ScrollView;
const {width} = Dimensions.get('window');
class DappSend extends React.Component{
    static navigationOptions = ({ navigation }) => ({
        title: strings('send.title'),
        headerLeft:<View style={{marginLeft: 10}}>
            <TouchableOpacity onPress={()=>navigation.state.params.onGoback()}>
                <Text style={{color:'#fff'}}>{strings('send.cancel')}</Text>
            </TouchableOpacity>
        </View>,
        headerRight:<View></View>
    });

    onGoback=()=>{
        this.state.isSend || DeviceEventEmitter.emit(this.message,{cancel: true, data:"I'm cancel"});
        this.props.navigation.goBack();
    };

    constructor(props) {
        super(props);
        this.message = this.props.navigation.state.params.message;
        const txInfo = this.props.navigation.state.params.txInfo;
        console.log('txInfo ', txInfo);
        this.state={
            isSend: false,
            from: txInfo.from || '',
            to: txInfo.to || '',
            amount: new BigNumber(txInfo.value || 0).shiftedBy(-18).toString(),
            data: txInfo.data || '',
            gasLimit: (txInfo.gas-0||21000)+'',
            gasPrice: (txInfo.gasPrice||10)+'',
            showAdvanced:false

        };
        this.account = this.props.accounts[txInfo.from];
        this.props.navigation.setParams({
            onGoback: this.onGoback,
        });
        console.log('[message] ', this.message);
    }

    componentWillMount(): void {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoback(); // works best when the goBack is async
            return true;
        });
    }

    componentWillUnmount(): void {
        this.backHandler.remove();
    }

    transfer=() => {
        Keyboard.dismiss();

        console.log("transfer clicked.");
        const {goBack} = this.props.navigation;
        const message  = this.message;
        if (!this.validateFields()) return;

        let accountType = this.account.type;
        let derivationIndex = this.account.derivationIndex;
        let sender = this.account.address;
        if (!sender.startsWith('0x')) {
            sender = '0x' + sender;
        }
        let thisLoadingView = this.loadingView;
        const {dispatch, user, setting} = this.props;
        thisLoadingView.show(strings('send.progress_sending_tx'));
        web3.eth.getTransactionCount(sender, 'pending').then(count => {
            console.log('get transaction count: ' + count);

            let amount = this.state.amount;
            let tx = new AionTransaction({
                sender: sender,
                nonce: count,
                gasPrice: this.state.gasPrice * 1e9,
                gas: this.state.gasLimit - 0,
                to: this.state.to,
                value: new BigNumber(amount).shiftedBy(18),
                data: this.state.data,
                type: 1,
            });
            console.log("tx to send:" , tx);
            try {
                let promise;
                if (accountType == '[ledger]') {
                    console.log("sign tx for " + accountType + " account(index=" + derivationIndex + ")");
                    try {
                        promise = tx.signByLedger(derivationIndex);
                    } catch (e) {
                        console.log("sign by ledger throw error: ", e);
                        thisLoadingView.hide();
                        alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
                        return;
                    }
                } else {
                    promise = tx.signByECKey(Ed25519Key.fromSecretKey(this.account.private_key));
                }
                promise.then(()=> {
                    web3.eth.sendSignedTransaction(tx.getEncoded()).on('transactionHash', function(hash) {
                        console.log("transaction sent: hash=" + hash);

                        let txs = {};
                        let pendingTx={};
                        pendingTx.hash = hash;
                        pendingTx.timestamp = tx.timestamp.toNumber()/1000;
                        pendingTx.from = sender;
                        pendingTx.to = tx.to;
                        pendingTx.value = amount - 0;
                        pendingTx.status = 'PENDING';
                        pendingTx.data  = tx.data;
                        txs[hash]=pendingTx;

                        dispatch(update_account_txs(sender, txs, setting.explorer_server, user.hashed_password));
                        thisLoadingView.hide();
                        DeviceEventEmitter.emit(message,{data: hash});
                        AppToast.show(strings('send.toast_tx_sent'), {
                            onHidden: () => {
                                goBack();
                            }
                        })
                    }).on('error', function(error) {
                        console.log("send singed tx failed? ", error);
                        thisLoadingView.hide();
                        alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
                        DeviceEventEmitter.emit(message,{error: true, data:error});
                        goBack();
                    });
                }, error=> {
                    console.log("sign ledger tx error:", error);
                    thisLoadingView.hide();
                    alert_ok(strings('alert_title_error'), getLedgerMessage(error.message));
                    DeviceEventEmitter.emit(message,{error: true, data:error});
                    goBack();
                });
            } catch (error) {
                console.log("send signed tx error:", error);
                thisLoadingView.hide();
                alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
                DeviceEventEmitter.emit(message,{error: true, data:error});
                goBack();
            }
        }, error => {
            console.log('get transaction count failed:', error);
            thisLoadingView.hide();
            alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
            DeviceEventEmitter.emit(message,{error: true, data:error});
            goBack();
        });
        this.setState({
            isSend: true,
        })
    };

    render(){
        return (
            <View style={{flex:1, backgroundColor: mainBgColor}}>
                <MyScrollView
                    contentContainerStyle={{justifyContent: 'center'}}
                >
                    <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={()=> {Keyboard.dismiss()}}>

                        <View style={{...styles.containerView, marginTop:30}}>
                            <SubTextInput
                                title={strings('send.label_sender')}
                                style={styles.text_input}
                                value={this.state.from}
                                multiline={true}
                                editable={false}
                            />

                            <SubTextInput
                                title={strings('send.label_receiver')}
                                style={styles.text_input}
                                value={this.state.to}
                                multiline={true}
                                editable={false}
                                placeholder={strings('send.hint_recipient')}
                            />

                            <SubTextInput
                                title={strings('send.label_amount')}
                                style={styles.text_input}
                                value={this.state.amount}
                                editable={false}
                                unit={'AION'}
                            />
                            <SubTextInput
                                title={strings('send.label_data')}
                                style={styles.text_input}
                                value={this.state.data}
                                multiline={true}
                                editable={false}
                            />

                        </View>

                        {/*advanced button*/}

                        <TouchableOpacity activeOpacity={1} onPress={()=>{
                            this.setState({
                                showAdvanced: !this.state.showAdvanced,
                            })
                        }}>
                            <Text style={{color: linkButtonColor, marginTop:20,  marginHorizontal:20 }}>{strings(this.state.showAdvanced ?'send.hide_advanced':'send.show_advanced')}</Text>
                        </TouchableOpacity>


                        {
                            this.state.showAdvanced?<View style={styles.containerView}>
                                <SubTextInput
                                    title={strings('send.label_gas_price')}
                                    style={styles.text_input}
                                    value={this.state.gasPrice}
                                    onChangeText={v=>this.setState({gasPrice:v})}
                                    keyboardType={'decimal-pad'}
                                    unit={'AMP'}
                                />
                                <SubTextInput
                                    title={strings('send.label_gas_limit')}
                                    style={styles.text_input}
                                    value={this.state.gasLimit}
                                    onChangeText={v=>this.setState({gasLimit:v})}
                                    keyboardType={'decimal-pad'}
                                />
                            </View>:null
                        }

                        {/*send button*/}
                        <View style={{ marginHorizontal:20, marginTop:20, marginBottom: 40}}>
                            <ComponentButton title={strings('send_button')}
                                             onPress={this.transfer.bind(this)}
                            />
                        </View>
                    </TouchableOpacity>

                </MyScrollView>
                <Loading ref={element => {
                    this.loadingView = element;
                }}/>
            </View>
        )
    }

    validateFields=() => {
        // validate recipient
        if (!validateAddress(this.state.from)) {
            alert_ok(strings('alert_title_error'), strings('send.error_format_recipient'));
            return false;
        }

        // validate recipient
        if (!validateAddress(this.state.to)) {
            alert_ok(strings('alert_title_error'), strings('send.error_format_sender'));
            return false;
        }


        // validate amount
        // 1. amount format
        if (!validateAmount(this.state.amount)) {
            alert_ok(strings('alert_title_error'), strings('send.error_format_amount'));
            return false;
        }
        // 2. < total balance
        console.log("gasPrice(" + this.state.gasPrice + ") * gasLimit(" + this.state.gasLimit + "):" + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit));
        console.log("amount+gasfee:" + (parseFloat(this.state.amount) + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit) / Math.pow(10, 9)));
        console.log("total balance: " + this.account.balance);

        let gasLimit = new BigNumber(this.state.gasLimit);
        let gasPrice = new BigNumber(this.state.gasPrice);
        let amount = new BigNumber(this.state.amount);
        let balance = new BigNumber(this.account.balance);
        if (amount.plus(gasPrice.multipliedBy(gasLimit).dividedBy(BigNumber(10).pow(9))).isGreaterThan(balance)) {
            alert_ok(strings('alert_title_error'), strings('send.error_insufficient_amount'));
            return false;
        }

        // validate gas price
        if (!validateAmount(this.state.gasPrice)) {
            alert_ok(strings('alert_title_error'), strings('send.error_invalid_gas_price'));
            return false;
        }

        // validate gas limit
        if (!validatePositiveInteger(this.state.gasLimit)) {
            alert_ok(strings('alert_title_error'), strings('send.error_invalid_gas_limit'));
            return false;
        }

        return true;
    };


}

const styles = StyleSheet.create({
    text_input: {
        flex: 1,
        fontSize: 16,
        color: '#777676',
        fontWeight: 'normal',
        borderColor: '#8c8a8a',
        textAlignVertical:'bottom',
        borderBottomWidth: 1/ PixelRatio.get(),
        paddingVertical: 10,
    },
    containerView:{
        ...defaultStyles.shadow,
        width:width-40,
        marginHorizontal:20,
        marginVertical: 10,
        paddingHorizontal:30,
        paddingVertical:10,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1/ PixelRatio.get(),
        backgroundColor:'#fff',
        borderColor:'#eee',
        borderRadius:10,
    }
});


export default connect(state => { return ({
    setting: state.setting,
    accounts: state.accounts,
    user:state.user,
}); })(DappSend);
