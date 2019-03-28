import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Alert,
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	Dimensions,
	StyleSheet,
	Linking,
	Keyboard,
	PixelRatio,
	Platform
} from 'react-native';
import Toast from 'react-native-root-toast';
import { strings } from '../../../locales/i18n';
import { getLedgerMessage, validateAddress, validateAmount, validatePositiveInteger, validateRecipient} from '../../../utils';
import {AionTransaction } from '../../../libs/aion-hd-wallet/index.js';
import { Ed25519Key } from '../../../libs/aion-hd-wallet/src/key/Ed25519Key';
import Loading from '../../loading';
import BigNumber from 'bignumber.js';
import {update_account_txs} from "../../../actions/accounts";
import {ComponentButton,SubTextInput, alert_ok} from '../../common';
import {linkButtonColor, mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import { KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;
const {width} = Dimensions.get('window');


class Send extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: strings('send.title'),
			headerTitleStyle: {
				alignItems: 'center',
				textAlign: 'center',
				flex:1,
			},
			headerRight: <View></View>
		};
	};
	constructor(props){
		super(props);
		this.state={
			showAdvanced: false,
			amount: this.props.navigation.state.params.value? this.props.navigation.state.params.value: '0',
			recipient: this.props.navigation.state.params.recipient? this.props.navigation.state.params.recipient: '',
			gasPrice: '10',
			gasLimit: '21000',
		};
        this.addr=this.props.navigation.state.params.address;
		this.account = this.props.accounts[this.addr];
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);

		Linking.addEventListener('url', this._handleOpenURL);
	}

	componentWillUnmount() {
		Linking.removeEventListener('', this._handleOpenURL);
	}

	_handleOpenURL(event) {
		console.log(event.url);
	}

	async componentWillReceiveProps(props) {
	    let scannedData = props.navigation.getParam('scanned', '');
	    if (scannedData != '') {
	    	if (validateAddress(scannedData)) {
	    		this.setState({
					recipient: scannedData,
				})
			} else {
	    		let receiverCode = JSON.parse(scannedData);
	    		if (receiverCode.receiver) {
	    			this.setState({
						recipient: receiverCode.receiver,
					})
				}
	    		if (receiverCode.amount) {
	    			this.setState({
						amount: receiverCode.amount,
					})
				}
			}
		}
	}
	render(){
		return (
                <View style={{flex:1, backgroundColor: mainBgColor}}>
					<MyscrollView
						contentContainerStyle={{justifyContent: 'center'}}
						keyboardShouldPersistTaps='always'
					>
							<TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={()=>{Keyboard.dismiss()}}>
							<View style={{...styles.containerView, marginTop:30}}>
								<SubTextInput
									title={strings('send.label_receiver')}
									style={styles.text_input}
									value={this.state.recipient}
									multiline={true}
									onChangeText={v=>this.setState({recipient:v})}
									placeholder={strings('send.hint_recipient')}
									rightView={()=>
										<TouchableOpacity onPress={()=> this.scan()}>
											<Image source={require('../../../assets/icon_scan.png')} style={{width: 20, height: 20,tintColor:'#000'}} resizeMode={'contain'} />
										</TouchableOpacity>}
								/>

								<SubTextInput
									title={strings('send.label_amount')}
									style={styles.text_input}
									value={this.state.amount}
									onChangeText={v=>this.setState({amount:v})}
									keyboardType={'decimal-pad'}
									rightView={()=>
										<TouchableOpacity onPress={()=> this.sendAll()}>
											<Text style={{color: linkButtonColor}}>{strings('send.button_send_all')}</Text>
										</TouchableOpacity>}
									unit={'AION'}

								/>

							</View>

							{/*advanced button*/}

							<TouchableOpacity activeOpacity={1} onPress={()=>{
								this.setState({
									showAdvanced: !this.state.showAdvanced,
								})
							}}>
								<Text style={{color: linkButtonColor, marginTop:20,  marginHorizontal:20}}>{strings(this.state.showAdvanced ?'send.hide_advanced':'send.show_advanced')}</Text>
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
												 onPress={this.onTransfer.bind(this)}
								/>
							</View>
							</TouchableOpacity>

                    </MyscrollView>

                    <Loading ref={element => {
                        this.loadingView = element;
                    }}/>
                </View>
		)
	}

	onTransfer=() => {
        Keyboard.dismiss();
		if (!this.validateFields()) return;

		if (this.account.address === this.state.recipient)

		{
			Alert.alert(
				strings('alert_title_warning'),
				strings('send.warning_send_to_itself'),
				[
					{text:strings('cancel_button'), onPress: ()=> {}},
					{text:strings('alert_ok_button'), onPress: () => {this.transfer1()}}
				],
				{cancelable: false}
				);
		} else {
			this.transfer1();
		}
	};

	transfer1=() => {
		let amount = new BigNumber(this.state.amount);
		if (amount === 0) {
			Alert.alert(
				strings('alert_title_warning'),
				strings('send.warning_send_zero'),
				[
					{text:strings('cancel_button'), onPress: ()=> {}},
					{text:strings('alert_ok_button'), onPress: () => {this.transfer()}}
				],
				{cancelable: false}
			);
		} else {
			this.transfer();
		}
	}

	transfer=() => {
		const {goBack} = this.props.navigation;
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
				to: this.state.recipient,
                value: new BigNumber(amount).shiftedBy(18),
				type: 1,
			});
			console.log("tx to send:" , tx);
			try {
				let promise;
				if (accountType === '[ledger]') {
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
						txs[hash]=pendingTx;

						dispatch(update_account_txs(sender, txs, setting.explorer_server, user.hashed_password));
						dispatch(update_account_txs(tx.to, txs, setting.explorer_server, user.hashed_password));
						thisLoadingView.hide();
						AppToast.show(strings('send.toast_tx_sent'), {
							onHidden: () => {
								goBack();
							}
						})
					}).on('error', function(error) {
						console.log("send singed tx failed? ", error);
						thisLoadingView.hide();
						alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
					});
				}, error=> {
					console.log("sign ledger tx error:", error);
					thisLoadingView.hide();
					alert_ok(strings('alert_title_error'), getLedgerMessage(error.message));
				});
			} catch (error) {
				console.log("send signed tx error:", error);
				thisLoadingView.hide();
				alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
			}
		}, error => {
			console.log('get transaction count failed:', error);
			thisLoadingView.hide();
			alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
		});
	}

	validateFields=() => {
		// validate recipient
		if (!validateAddress(this.state.recipient)) {
			alert_ok(strings('alert_title_error'), strings('send.error_format_recipient'));
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

	sendAll=() => {
		console.log("send all clicked.");

		let gasLimit = new BigNumber(this.state.gasLimit);
		let gasPrice = new BigNumber(this.state.gasPrice);
		let totalBalance = new BigNumber(this.account.balance);
		let totalAmount =Math.max(0,totalBalance.minus(gasLimit.multipliedBy(gasPrice).dividedBy(BigNumber(10).pow(9))));

		this.setState({
			amount: totalAmount.toString()
		});

	};
	scan=() => {
		console.log("scan clicked.");

		this.props.navigation.navigate('scan', {
			success: 'signed_vault_send',
			validate: function(data) {
				console.log("scanned: " + data.data);
				let pass = validateRecipient(data.data);
				return {
					pass: pass,
					err: pass? '': strings('error_invalid_qrcode')
				}
			},
		});
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
}); })(Send);
