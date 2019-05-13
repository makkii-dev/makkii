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
import { strings } from '../../../locales/i18n';
import {
	getLedgerMessage,
	navigationSafely,
	validateAddress,
	validateAmount,
	validatePositiveInteger,
	validateRecipient,
	sendTransaction,
} from '../../../utils';
import Loading from '../../loading';
import BigNumber from 'bignumber.js';
import {update_account_txs, update_account_token_txs} from "../../../actions/accounts";
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
		let symbol = this.props.navigation.getParam('symbol');
		this.state={
		    unit: symbol,
			showAdvanced: false,
			amount: this.props.navigation.state.params.value? this.props.navigation.state.params.value: '0',
			recipient: this.props.navigation.state.params.recipient? this.props.navigation.state.params.recipient: '',
			gasPrice: '10',
			gasLimit: symbol==='AION'? '21000':'90000',
		};
        this.addr=this.props.navigation.state.params.address;
		this.account = this.props.accounts[this.addr];
		if (symbol !== 'AION') {
			this.decimals = this.props.accounts[this.addr].tokens[this.props.setting.explorer_server][symbol].tokenDecimal + 0;
		}
	}
	async componentDidMount(){
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
	    if (scannedData !== '') {
	    	if (validateAddress(scannedData)) {
	    		this.setState({
					recipient: scannedData,
				})
			} else {
	    		let receiverCode = JSON.parse(scannedData);
	    		if (receiverCode.coin !== undefined) {
	    			if (receiverCode.coin !== 'AION') {
						console.log("tokens: " + Object.keys(this.props.accounts[this.addr].tokens[this.props.setting.explorer_server]));
						console.log("receiver.coin: " + receiverCode.coin);
						if (this.props.accounts[this.addr].tokens[this.props.setting.explorer_server][receiverCode.coin] === undefined) {
							AppToast.show(strings('send.toast_unsupported_token', {token: receiverCode.coin}));
							return;
						}
						this.coinSelected(receiverCode.coin);
					} else {
	    				this.coinSelected('AION')
					}
				} else {
	    			// to be compatible with previous version, if no coin is specified in qr code, then it is AION.
	    		    this.coinSelected('AION');
				}
	    		if (receiverCode.receiver !== undefined && receiverCode.amount !== undefined) {
	    			this.setState({
						recipient: receiverCode.receiver,
						amount: receiverCode.amount,
					})
				} else if (receiverCode.receiver !== undefined && receiverCode.amount === undefined) {
					this.setState({
						recipient: receiverCode.receiver,
					})
				}
			}
		}
	}

	coinSelected=(tokenSymbol) => {
		let superCoinSelected = this.props.navigation.getParam('coinSelected');
		superCoinSelected(tokenSymbol);
		if (tokenSymbol !== this.state.unit) {
			if (tokenSymbol !== 'AION') {
				this.decimals = this.props.accounts[this.addr].tokens[this.props.setting.explorer_server][tokenSymbol].tokenDecimal + 0;
				this.setState({
					unit: tokenSymbol,
					gasLimit: '90000',
				})
			} else {
				this.setState({
					unit: tokenSymbol,
					gasLimit: '21000',
				})
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
									unit={this.state.unit}
									changeUnit={() => {
										this.props.navigation.navigate('signed_select_coin', {
											address: this.addr,
											coinSelected: this.coinSelected,
										});
									}}

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
			popCustom.show(
				strings('alert_title_warning'),
				strings('send.warning_send_to_itself'),
				[
					{text:strings('cancel_button'), onPress: ()=> {}},
					{text:strings('alert_ok_button'), onPress: () => {setTimeout(this.transfer1, 200)}}
				],
				{cancelable:false}
				);
		} else {
			this.transfer1();
		}
	};

	transfer1=() => {
		let amount = new BigNumber(this.state.amount);
		if (amount.isZero()) {
			popCustom.show(
				strings('alert_title_warning'),
				strings('send.warning_send_zero'),
				[
					{text:strings('cancel_button'), onPress: ()=> {}},
					{text:strings('alert_ok_button'), onPress: () => {setTimeout(this.beforeTransfer, 200)}}
				],
				{cancelable:false}
			);
		} else {
			this.beforeTransfer();
		}
	};

	beforeTransfer = ()=>{
		const {navigation} = this.props;
		const {pinCodeEnabled} = this.props.setting;
		const {hashed_password} = this.props.user;
		navigationSafely(
			pinCodeEnabled,
			hashed_password,
			navigation,
			{
				onVerifySuccess: this.transfer
			}
		);
	};

	transfer=() => {
		const {goBack} = this.props.navigation;
		let sender = this.account.address;
		if (!sender.startsWith('0x')) {
			sender = '0x' + sender;
		}
		const {dispatch, user, setting, accounts} = this.props;
		this.loadingView.show(strings('send.progress_sending_tx'));
		const { gasPrice, gasLimit, recipient,amount} = this.state;
		let amountValue = new BigNumber(0);
		let tokenAmountValue = new BigNumber(0);
		let to;
		let tokenTo;
		if (this.state.unit ==='AION') {
			amountValue = new BigNumber(amount).shiftedBy(18);
			to = recipient;
		} else {
			tokenAmountValue = new BigNumber(amount).shiftedBy(this.decimals);
			to = accounts[sender].tokens[setting.explorer_server][this.state.unit].contractAddr;
			tokenTo = recipient;
		}
		let tx = {
			sender: sender,
			gasPrice: gasPrice * 1e9,
			gas: gasLimit - 0,
			to: to,
			tokenTo: tokenTo,
			value: amountValue,
			tokenValue: tokenAmountValue,
			type: 1,
		};
		sendTransaction(tx,this.account,this.state.unit,setting.explorer_server).then(res=>{
			const {pending, signedTransaction} = res;
			return new Promise((resolve, reject)=> {
				pending.on('transactionHash', (hash) => {
					console.log("transaction sent: hash=" + hash);
					let txs = {};
					let pendingTx = {};
					pendingTx.hash = hash;
					pendingTx.timestamp = signedTransaction.timestamp.toNumber() / 1000;
					pendingTx.from = sender;
					pendingTx.to = signedTransaction.to;
					pendingTx.value = new BigNumber(amount);
					pendingTx.status = 'PENDING';
					txs[hash] = pendingTx;

					dispatch(update_account_txs(sender, txs, setting.explorer_server, user.hashed_password));
					dispatch(update_account_txs(tx.to, txs, setting.explorer_server, user.hashed_password));

					if (this.state.unit !== 'AION') {
                        let tokenTxs = {};
                        let pendingTokenTxs = {};
                        pendingTokenTxs.hash = hash;
                        pendingTokenTxs.timestamp = signedTransaction.timestamp.toNumber() / 1000;
                        pendingTokenTxs.from = sender;
                        pendingTokenTxs.to = tokenTo;
                        pendingTokenTxs.value = new BigNumber(amount);
                        pendingTokenTxs.status = 'PENDING';
                        tokenTxs[hash] = pendingTokenTxs;
                        dispatch(update_account_token_txs(sender, tokenTxs, this.state.unit, setting.explorer_server, user.hashed_password));
                        dispatch(update_account_token_txs(tokenTo, tokenTxs, this.state.unit, setting.explorer_server, user.hashed_password));
                    }

					this.loadingView.hide();
					AppToast.show(strings('send.toast_tx_sent'), {
						onHidden: () => {
							goBack();
						}
					})
				}).on('error', error => {
					console.log("error", error);
					reject(error);
				});
			});
		}).catch(error=>{
			console.log('send Transaction failed ', error);
			this.loadingView.hide();
			if(error.message && this.account.type === '[ledger]'){
				alert_ok(strings('alert_title_error'), getLedgerMessage(error.message));
			}else{
				alert_ok(strings('alert_title_error'), strings('send.error_send_transaction'));
			}
		})
	};

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


		// 2. < total balance
		let gasLimit = new BigNumber(this.state.gasLimit);
		let gasPrice = new BigNumber(this.state.gasPrice);
		let balance = new BigNumber(this.account.balance);
		let amount = new BigNumber(this.state.amount);
        if (this.state.unit === 'AION') {
			console.log("gasPrice(" + this.state.gasPrice + ") * gasLimit(" + this.state.gasLimit + "):" + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit));
			console.log("amount+gasfee:" + (parseFloat(this.state.amount) + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit) / Math.pow(10, 9)));
			console.log("total balance: " + this.account.balance);

			if (amount.plus(gasPrice.multipliedBy(gasLimit).dividedBy(BigNumber(10).pow(9))).isGreaterThan(balance)) {
				alert_ok(strings('alert_title_error'), strings('send.error_insufficient_amount'));
				return false;
			}
		} else {
        	if (gasPrice.multipliedBy(gasLimit).dividedBy(BigNumber(10).pow(9)).isGreaterThan(balance)) {
				alert_ok(strings('alert_title_error'), strings('send.error_insufficient_amount'));
				return false;
        	}
        	let totalCoins = this.props.accounts[this.addr].tokens[this.props.setting.explorer_server][this.state.unit].balance
        	if (amount.isGreaterThan(totalCoins)) {
				alert_ok(strings('alert_title_error'), strings('send.error_insufficient_amount'));
				return false;
			}
		}

		return true;
	};

	sendAll=() => {
		if (this.state.unit === 'AION') {
			let gasLimit = new BigNumber(this.state.gasLimit);
			let gasPrice = new BigNumber(this.state.gasPrice);
			let totalBalance = new BigNumber(this.account.balance);
			let totalAmount = BigNumber.max(new BigNumber(0), totalBalance.minus(gasLimit.multipliedBy(gasPrice).dividedBy(BigNumber(10).pow(9))));

			this.setState({
				amount: totalAmount.toNotExString()
			});
		} else {
		    this.setState({
				amount:this.props.accounts[this.addr].tokens[this.props.setting.explorer_server][this.state.unit].balance.toNotExString(),
			});
		}
	};
	scan=() => {
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
