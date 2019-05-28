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
	validatePositiveInteger,
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
		this.account = this.props.navigation.state.params.account;
		this.addr = this.account.address;
		this.account_key = accountKey(this.account.symbol, this.addr);
		let tokenSymbol = this.props.navigation.getParam('tokenSymbol');
		let gasPrice = COINS[this.account.symbol].defaultGasPrice;
		let gasLimit;
		if (COINS[this.account.symbol].tokenSupport && tokenSymbol !== this.account.symbol) {
			gasLimit = COINS[this.account.symbol].defaultGasLimitForContract;
		} else {
			gasLimit = COINS[this.account.symbol].defaultGasLimit;
		}
		this.state={
		    unit: tokenSymbol,
			showAdvanced: false,
			amount: this.props.navigation.state.params.value? this.props.navigation.state.params.value: '0',
			recipient: this.props.navigation.state.params.recipient? this.props.navigation.state.params.recipient: '',
			gasPrice: gasPrice,
			gasLimit: gasLimit,
		};
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
		const {accounts, setting} = this.props;

	    let scannedData = props.navigation.getParam('scanned', '');
	    if (scannedData !== '') {
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
						if (token !== this.account.symbol) {
							// token
							if (accounts[this.account_key].tokens[setting.explorer_server][token] === undefined) {
								AppToast.show(strings('send.toast_unsupported_token', {token: token}));
								return;
							}
							this.coinSelected(token);
						} else {
							// native coin
							this.coinSelected(this.account.symbol);
						}
					} else {
						// if no coin/token is specified, by default it is the native coin.
						this.coinSelected(this.account.symbol);
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

	coinSelected=(tokenSymbol) => {
		let superCoinSelected = this.props.navigation.getParam('coinSelected');
		superCoinSelected(tokenSymbol);
		if (tokenSymbol !== this.state.unit) {
            if (COINS[this.account.symbol].tokenSupport && tokenSymbol !== this.account.symbol) {
                this.setState({
                    unit: tokenSymbol,
                    gasLimit: COINS[this.account.symbol].defaultGasLimitForContract,
                })
            } else {
                this.setState({
                    unit: tokenSymbol,
                    gasLimit: COINS[this.account.symbol].defaultGasLimit,
                })
            }
		}
	}

	toChangeToken=()=> {
		this.props.navigation.navigate('signed_select_coin', {
			account: this.account,
			coinSelected: this.coinSelected,
		});
	}

	validateRecipient=(recipientQRCode, symbol='AION') => {
	    return new Promise((resolve, reject) => {
			validateAddress(recipientQRCode, symbol).then(isValidAddress => {
				if (isValidAddress) {
					resolve(true);
				} else {
					try {
						let receiverObj = JSON.parse(recipientQRCode);
						if (!receiverObj.receiver) {
						    resolve(false);
						    return;
						}
                        validateAddress(receiverObj.receiver, symbol).then(isValidAddress => {
                        	if (!isValidAddress) {
                        		resolve(false);
                        		return;
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
						return;
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
								<SubTextInput
									title={strings('send.label_receiver')}
									style={styles.text_input}
									value={this.state.recipient}
									multiline={true}
									onChangeText={v=>this.setState({recipient:v})}
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

								<SubTextInput
									title={strings('send.label_amount')}
									style={styles.text_input}
									value={this.state.amount}
									onChangeText={v=>this.setState({amount:v})}
									keyboardType={'decimal-pad'}
									rightView={()=>
										<TouchableOpacity onPress={this.sendAll}>
											<Text style={{color: linkButtonColor}}>{strings('send.button_send_all')}</Text>
										</TouchableOpacity>}
									unit={this.state.unit}
									changeUnit={COINS[this.account.symbol].tokenSupport? this.toChangeToken: undefined}
								/>

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
		const { gasPrice, gasLimit, recipient, amount} = this.state;
		let extra_params = COINS[this.account.symbol].txFeeSupport? {'gasPrice': gasPrice * 1e9, 'gasLimit': gasLimit - 0}: {};

		this.loadingView.show(strings('send.progress_sending_tx'));
		console.log("function:", sendTransaction);
		sendTransaction(this.account, this.state.unit, recipient, new BigNumber(amount), extra_params).then(res=> {
			const {pendingTx, pendingTokenTx} = res;
            console.log("transaction sent: ", pendingTx);
            console.log("token tx sent: ", pendingTokenTx);

            let txs = {[pendingTx.hash]: pendingTx};

            dispatch(update_account_txs(this.account_key, txs, setting.explorer_server, user.hashed_password));
            dispatch(update_account_txs(accountKey(this.account.symbol, pendingTx.to), txs, setting.explorer_server, user.hashed_password));

            if (pendingTokenTx != undefined) {
                let tokenTxs = { [pendingTokenTx.hash]: pendingTokenTx};
                dispatch(update_account_token_txs(this.account_key, tokenTxs, this.state.unit, setting.explorer_server, user.hashed_password));
                dispatch(update_account_token_txs(accountKey(this.account.symbol, pendingTokenTx.to), tokenTxs, this.state.unit, setting.explorer_server, user.hashed_password));
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
            		let result = validateBalanceSufficiency(this.account, this.state.unit, this.state.amount, extra_params);
            		console.log("result: ",  result);
            		if (result.result) {
            			resolve(true);
					} else {
						alert_ok(strings('alert_title_error'), strings('send.' + result.err));
						resolve(false);
					}
				}
			});
		});

	};

	sendAll=() => {
		if (this.state.unit === this.account.symbol) {
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
				amount:this.props.accounts[this.account_key].tokens[this.props.setting.explorer_server][this.state.unit].balance.toNotExString(),
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
				console.log("scanned: " + data.data);
				console.log("this.account.symbol:", thus.account.symbol);
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
