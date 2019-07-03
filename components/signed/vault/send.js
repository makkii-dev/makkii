import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
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
	validateAmount,
	accountKey,
} from '../../../utils';
import {sendTransaction, validateAddress} from "../../../coins/api";
import Loading from '../../loading';
import BigNumber from 'bignumber.js';
import {update_account_txs, update_account_token_txs} from "../../../actions/accounts";
import {ComponentButton,SubTextInput, alert_ok} from '../../common';
import {linkButtonColor, mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {COINS} from '../../../coins/support_coin_list';
import { KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {validateBalanceSufficiency} from '../../../coins/api';
import {AppToast} from "../../../utils/AppToast";
import {popCustom} from "../../../utils/dva";

const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;
const {width} = Dimensions.get('window');


class Send extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: navigation.state.params.title||strings('send.title'),
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
		this.account = this.props.navigation.state.params.account;
		this.rawTx = this.props.navigation.state.params.rawTx;
		this.token = this.props.navigation.state.params.token;
		this.account_key = accountKey(this.account.symbol, this.account.address);

		let gasPrice = COINS[this.account.symbol].defaultGasPrice;
		let gasLimit;
		if (this.token !== undefined) {
			gasLimit = COINS[this.account.symbol].defaultGasLimitForContract;
			this.unit = this.token.symbol;
		} else {
			gasLimit = COINS[this.account.symbol].defaultGasLimit;
			this.unit = this.account.symbol;
		}
		if(this.rawTx){
			this.state = {
				showAdvanced: false,
				amount: BigNumber(this.rawTx.value).shiftedBy(-18).toNumber() +'',
				recipient: this.rawTx.to,
				data: this.rawTx.data,
				gasPrice: BigNumber(this.rawTx.gasPrice).shiftedBy(-9).toNumber()+'',
				gasLimit: BigNumber(this.rawTx.gasLimit).toNumber()+'',
			}
		}else{
			this.state={
				showAdvanced: false,
				amount: this.props.navigation.state.params.value? this.props.navigation.state.params.value: '0',
				recipient: this.props.navigation.state.params.recipient? this.props.navigation.state.params.recipient: '',
				gasPrice: gasPrice,
				gasLimit: gasLimit,
			};
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
	oldScannedData = null;

	async componentWillReceiveProps(props) {

		let scannedData = props.navigation.getParam('scanned', '');
		if (scannedData !== this.oldScannedData&&scannedData!=='') {
			this.oldScannedData = scannedData;
			validateAddress(scannedData, this.account.symbol).then(isValidAddress => {
				if (isValidAddress) {
					// only address is in qrcode
					this.setState({
						recipient: scannedData,
					})
				} else {
					let receiverCode = JSON.parse(scannedData);

					// process token in qrcode
					let token = receiverCode.coin;
					if (token !== undefined) {
						if (token !== this.unit) {
							AppToast.show(strings('send.toast_unsupported_token', {token: token}));
							return;
						}
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
			});
		}
	}

	validateRecipient=(recipientQRCode, symbol) => {
		return new Promise((resolve, reject) => {

			validateAddress(recipientQRCode, symbol).then(isValidAddress => {
				if (isValidAddress) {
					resolve(true);
				} else {
					try {
						let receiverObj = JSON.parse(recipientQRCode);
						if (!receiverObj.receiver) {
							resolve(false);
						}
						validateAddress(receiverObj.receiver, symbol).then(isValidAddress => {
							if (!isValidAddress) {
								resolve(false);
							} else {
								if (receiverObj.amount) {
									if (!validateAmount(receiverObj.amount)) {
										resolve(false);
										return;
									}
								}
								resolve(true);
							}
						});
					} catch (error) {
						console.log("recipient qr code is not a json");
						resolve(false);
					}
				}
			});
		});
	}

	render(){
		let showAdvancedOption = COINS[this.account.symbol].txFeeSupport;
		return (
			<View style={{flex:1, backgroundColor: mainBgColor}}>
				<MyscrollView
					contentContainerStyle={{justifyContent: 'center'}}
					keyboardShouldPersistTaps='always'
				>
					<TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={()=>{Keyboard.dismiss()}}>
						<View style={{...styles.containerView, marginTop:30}}>
							{
								this.rawTx?
									<SubTextInput
										title={strings('send.label_receiver')}
										style={styles.text_input}
										value={this.state.recipient+''}
										multiline={true}
										editable={false}
									/>
									:<SubTextInput
										title={strings('send.label_receiver')}
										style={styles.text_input}
										value={this.state.recipient}
										multiline={true}
										onChangeText={v => this.setState({recipient: v})}
										placeholder={strings('send.hint_recipient')}
										rightView={() =>
											<View style={{flexDirection: 'row'}}>
												<TouchableOpacity onPress={() => this.scan()} style={{marginRight: 10}}>
													<Image source={require('../../../assets/icon_scan.png')}
														   style={{width: 20, height: 20, tintColor: '#000'}}
														   resizeMode={'contain'}/>
												</TouchableOpacity>
												<TouchableOpacity onPress={() => this.selectFromAddressBook()}>
													<Image source={require('../../../assets/address_book_btn.png')}
														   style={{width: 20, height: 20, tintColor: '#000'}}
														   resizeMode={'contain'}/>
												</TouchableOpacity>
											</View>
										}
									/>
							}

							{
								this.rawTx?
									<SubTextInput
										title={strings('send.label_amount')}
										style={styles.text_input}
										value={this.state.amount}
										multiline={true}
										editable={false}
									/>
									:<SubTextInput
										title={strings('send.label_amount')}
										style={styles.text_input}
										value={this.state.amount}
										onChangeText={v => this.setState({amount: v})}
										keyboardType={'decimal-pad'}
										rightView={() =>
											<TouchableOpacity onPress={this.sendAll}>
												<Text
													style={{color: linkButtonColor}}>{strings('send.button_send_all')}</Text>
											</TouchableOpacity>}
										unit={this.unit}
									/>
							}
							{
								this.state.data?<SubTextInput
									title={strings('send.label_data')}
									style={styles.text_input}
									value={this.state.data}
									multiline={true}
									editable={false}
								/>:null

							}
						</View>

						{/*advanced button*/}
						{
							showAdvancedOption ?
								<View>
									<TouchableOpacity activeOpacity={1} onPress={() => {
										this.setState({
											showAdvanced: !this.state.showAdvanced,
										})
									}}>
										<Text style={{
											color: linkButtonColor,
											marginTop: 20,
											marginHorizontal: 20
										}}>{strings(this.state.showAdvanced ? 'send.hide_advanced' : 'send.show_advanced')}</Text>
									</TouchableOpacity>


									{
										this.state.showAdvanced ? <View style={styles.containerView}>
											<SubTextInput
												title={strings('send.label_gas_price')}
												style={styles.text_input}
												value={this.state.gasPrice}
												onChangeText={v => this.setState({gasPrice: v})}
												keyboardType={'decimal-pad'}
												unit={COINS[this.account.symbol].gasPriceUnit}
											/>
											<SubTextInput
												title={strings('send.label_gas_limit')}
												style={styles.text_input}
												value={this.state.gasLimit}
												onChangeText={v => this.setState({gasLimit: v})}
												keyboardType={'decimal-pad'}
											/>
										</View> : null
									}
								</View>
								:null
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
		this.validateFields().then(result => {
			if (result) {
				if (this.account.address === this.state.recipient) {
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
			}
		});
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
		const {dispatch, user, setting} = this.props;
		const { gasPrice, gasLimit, recipient, amount, data} = this.state;
		// TODO:
		let extra_params = COINS[this.account.symbol].txFeeSupport? {'gasPrice': gasPrice * 1e9, 'gasLimit': gasLimit - 0}: {};

		this.loadingView.show(strings('send.progress_sending_tx'));
		sendTransaction(this.account, this.unit, recipient, new BigNumber(amount), extra_params, data).then(res=> {
			const {pendingTx, pendingTokenTx} = res;
			console.log("transaction sent: ", pendingTx);
			console.log("token tx sent: ", pendingTokenTx);

			let txs = {[pendingTx.hash]: pendingTx};

			dispatch(update_account_txs(this.account_key, txs, user.hashed_password));
			dispatch(update_account_txs(accountKey(this.account.symbol, pendingTx.to), txs, user.hashed_password));

			if (pendingTokenTx !== undefined) {
				let tokenTxs = { [pendingTokenTx.hash]: pendingTokenTx};
				dispatch(update_account_token_txs(this.account_key, tokenTxs, this.unit, user.hashed_password));
				dispatch(update_account_token_txs(accountKey(this.account.symbol, pendingTokenTx.to), tokenTxs, this.unit, user.hashed_password));
			}

			this.loadingView.hide();
			AppToast.show(strings('send.toast_tx_sent'), {
				onHidden: () => {
					goBack();
				}
			})
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
		return new Promise((resolve, reject) => {
			validateAddress(this.state.recipient, this.account.symbol).then(isValidAddress => {
				if (!isValidAddress) {
					alert_ok(strings('alert_title_error'), strings('send.error_format_recipient'));
					resolve(false);
				} else {
					let extra_params = {};
					if (COINS[this.account.symbol].txFeeSupport) {
						extra_params['gasPrice'] = this.state.gasPrice;
						extra_params['gasLimit'] = this.state.gasLimit;
					}
					if (this.account.symbol === 'BTC'|| this.account.symbol === 'LTC'){
						extra_params['network'] = COINS[this.account.symbol].network;
					}
					validateBalanceSufficiency(this.account, this.unit, this.state.amount, extra_params).then(result=>{
						console.log("result: ",  result);
						if (result.result) {
							resolve(true);
						} else {
							alert_ok(strings('alert_title_error'), strings('send.' + result.err));
							resolve(false);
						}
					}).catch(e=>{
						alert_ok(strings('alert_title_error'), strings('send.' + e.err));
						resolve(false);
					});
				}
			});
		});

	};

	sendAll=() => {
		if (this.token === undefined) {
			let totalAmount;
			if (COINS[this.account.symbol].txFeeSupport) {
				let gasLimit = new BigNumber(this.state.gasLimit);
				let gasPrice = new BigNumber(this.state.gasPrice);
				let totalBalance = new BigNumber(this.account.balance);
				totalAmount = BigNumber.max(new BigNumber(0), totalBalance.minus(gasLimit.multipliedBy(gasPrice).dividedBy(BigNumber(10).pow(9))));
			} else {
				totalAmount = new BigNumber(this.account.balance);
			}

			this.setState({
				amount: totalAmount.toNotExString()
			});
		} else {
			this.setState({
				amount:this.props.accounts[this.account_key].tokens[this.unit].balance.toNotExString(),
			});
		}
	};
	selectFromAddressBook=() => {
		this.props.navigation.navigate('signed_setting_address_book', {
			type: 'select',
			addressSelected: this.addressSelected,
			filterSymbol: this.account.symbol,
		});
	}
	addressSelected=(address) => {
		this.setState({
			recipient: address,
		});
	}
	scan=() => {
		let thus = this;
		this.props.navigation.navigate('scan', {
			success: 'signed_vault_send',
			validate: function(data, callback) {
				thus.validateRecipient(data.data, thus.account.symbol).then(result=> {
					if (result) {
						callback(true);
					} else {
						callback(false, strings('error_invalid_qrcode'));
					}
				});
			},
		});
	}
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
