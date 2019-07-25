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
import { strings } from '../../../../locales/i18n';
import {sameAddress} from "../../../../coins/api";
import Loading from '../../../components/Loading';
import BigNumber from 'bignumber.js';
import {ComponentButton,SubTextInput} from '../../../components/common';
import {linkButtonColor, mainBgColor} from '../../../style_util';
import defaultStyles from '../../../styles';
import {COINS} from '../../../../coins/support_coin_list';
import { KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {AppToast} from "../../../components/AppToast";
import {createAction, popCustom} from "../../../../utils/dva";

const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;
const {width} = Dimensions.get('window');

const updateTxObj = (txObj, nextTxObj, oldState, field)=>{
	if(txObj[field]!==nextTxObj[field]){
		return {...oldState,[field]:nextTxObj[field]}
	}else{
		return oldState
	}
};

class Send extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: navigation.getParam('title',strings('send.title')),
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
		const {currentAccount, txObj} = this.props;
		let gasPrice = txObj.gasPrice||COINS[currentAccount.symbol].defaultGasPrice;
		let gasLimit;
		if (currentAccount.coinSymbol !== currentAccount.symbol) {
			gasLimit = txObj.gasLimit||COINS[currentAccount.symbol].defaultGasLimitForContract;
		} else {
			gasLimit = txObj.gasLimit||COINS[currentAccount.symbol].defaultGasLimit;
		}
		this.state = {
			showAdvanced: false,
			...txObj,
			gasPrice,
			gasLimit,
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

	componentWillReceiveProps(props) {
		const {txObj: nextTxObj} = props;
		const {txObj} = this.props;
		let newState = {};
		['to', 'amount', 'data', 'gasLimit', 'gasPrice'].forEach(f=>{
			newState = updateTxObj(txObj, nextTxObj, newState, f);
		});
		if(JSON.stringify(newState)!=='{}'){
			this.setState(newState);
		}
	}

	scan=() => {
		const {dispatch, navigation} = this.props;
		navigation.navigate('scan', {
			success: 'signed_vault_send',
			validate: (data, callback)=> {
				dispatch(createAction('txSenderModel/parseScannedData')({data:data.data}))
					.then(res=>{
						res?callback(true):callback(false,strings('error_invalid_qrcode'));
					})
			},
		});
	};

	selectFromAddressBook=() => {
		this.props.navigation.navigate('signed_setting_address_book', {
			type: 'select',
			filterSymbol: this.props.currentAccount.symbol,
		});
	};


	render(){
		const {currentAccount, editable} = this.props;
		const {to, amount, data, gasPrice, gasLimit, showAdvanced} = this.state;
		const showAdvancedOption = COINS[currentAccount.symbol].txFeeSupport;
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
								value={to}
								multiline={true}
								editable={editable}
								onChangeText={v => this.setState({to: v})}
								placeholder={strings('send.hint_recipient')}
								rightView={() =>
									editable?
										(
											<View style={{flexDirection: 'row'}}>
												<TouchableOpacity onPress={() => this.scan()} style={{marginRight: 10}}>
													<Image source={require('../../../../assets/icon_scan.png')}
														   style={{width: 20, height: 20, tintColor: '#000'}}
														   resizeMode={'contain'}/>
												</TouchableOpacity>
												<TouchableOpacity onPress={() => this.selectFromAddressBook()}>
													<Image source={require('../../../../assets/icon_address_book.png')}
														   style={{width: 20, height: 20, tintColor: '#000'}}
														   resizeMode={'contain'}/>
												</TouchableOpacity>
											</View>
										):null
								}
							/>
							<SubTextInput
								title={strings('send.label_amount')}
								style={styles.text_input}
								value={amount+''}
								editable={editable}
								onChangeText={v => this.setState({amount: v})}
								keyboardType={'decimal-pad'}
								rightView={() =>
									editable?
										<TouchableOpacity onPress={this.sendAll}>
											<Text style={{color: linkButtonColor}}>{strings('send.button_send_all')}</Text>
										</TouchableOpacity>
										:null
								}
								unit={currentAccount.coinSymbol}
							/>
							{
								data?
									<SubTextInput
										title={strings('send.label_data')}
										style={styles.text_input}
										value={data}
										multiline={true}
										editable={false}
									/>
									:null

							}
						</View>

						{/*advanced button*/}
						{
							showAdvancedOption ?
								<View>
									<TouchableOpacity activeOpacity={1} onPress={() => {
										this.setState({
											showAdvanced: !showAdvanced,
										})
									}}>
										<Text style={{
											color: linkButtonColor,
											marginTop: 20,
											marginHorizontal: 20
										}}>
											{strings(showAdvanced ? 'send.hide_advanced' : 'send.show_advanced')}
										</Text>
									</TouchableOpacity>

									{
										showAdvanced ?
											<View style={styles.containerView}>
												<SubTextInput
													title={strings('send.label_gas_price')}
													style={styles.text_input}
													value={gasPrice+''}
													onChangeText={v => this.setState({gasPrice: v})}
													keyboardType={'decimal-pad'}
													unit={COINS[currentAccount.symbol].gasPriceUnit}
												/>
												<SubTextInput
													title={strings('send.label_gas_limit')}
													style={styles.text_input}
													value={gasLimit+''}
													onChangeText={v => this.setState({gasLimit: v})}
													keyboardType={'decimal-pad'}
												/>
											</View>
											: null
									}
								</View>
								:null
						}

						{/*send button*/}
						<View style={{ marginHorizontal:20, marginTop:20, marginBottom: 40}}>
							<ComponentButton
								disabled={(amount + '').length <= 0||!to}
								title={strings('send_button')}
								onPress={this.onTransfer}
							/>
						</View>
					</TouchableOpacity>

				</MyscrollView>

				<Loading ref={'refLoading'}/>
			</View>
		)
	}

	onTransfer=() => {
		Keyboard.dismiss();
		const {dispatch} = this.props;
		const txObj = {
			to: this.state.to,
			amount: this.state.amount,
			data: this.state.data,
			gasPrice: this.state.gasPrice,
			gasLimit: this.state.gasLimit,
		};
		dispatch(createAction('txSenderModel/validateTxObj')({txObj}))
			.then(result => {
				if (result) {
					this.checkSameAddress();
				}
			});
	};

	checkSameAddress = ()=>{
		const {address, symbol} = this.props.currentAccount;
		const {to} = this.state;
		if (sameAddress(symbol, address, to)) {
			popCustom.show(
				strings('alert_title_warning'),
				strings('send.warning_send_to_itself'),
				[
					{text:strings('cancel_button'), onPress: ()=> {}},
					{text:strings('alert_ok_button'), onPress: () => {setTimeout(this.checkZeroAmount, 200)}}
				],
				{cancelable:false}
			);
		} else {
			this.checkZeroAmount();
		}
	};

	checkZeroAmount =() => {
		let amount = new BigNumber(this.state.amount);
		if (amount.isZero() && this.state.data.length === 0) {
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
		const {navigationSafely} =  this.props.screenProps;
		navigationSafely({onVerifySuccess: this.dispatchTxObj})(this.props);
	};

	dispatchTxObj=() => {
		this.refs['refLoading'].show();
		const {dispatch, navigation} = this.props;
		const txObj = {
			to: this.state.to,
			amount: this.state.amount,
			data: this.state.data,
			gasPrice: this.state.gasPrice,
			gasLimit: this.state.gasLimit,
		};
		dispatch(createAction('txSenderModel/sendTx')({txObj}))
			.then(r=>{
				this.refs['refLoading'].hide();
				if(r){
					AppToast.show(strings('send.toast_tx_sent'), {
						onHidden: () => {
							// reset txSenderModel
							dispatch(createAction('txSenderModel/reset')());
							navigation.goBack();
						}
					})
				}

			})
	};



	sendAll=() => {
		this.refs['refLoading'].show();
		const {dispatch} = this.props;
		const {gasLimit,gasPrice} = this.state;
		dispatch(createAction('txSenderModel/sendAll')({currentGasPrice:gasPrice, currentGasLimit:gasLimit}))
			.then(r=>{
				this.refs['refLoading'].hide();
			})
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


const mapToState = ({accountsModel, txSenderModel})=>{

	const {to, amount, data, gasLimit, gasPrice,editable} = txSenderModel;
	const {currentAccount:key,currentToken, accountsMap}=accountsModel;
	const currentAccount = {
		...accountsMap[key],
		coinSymbol: currentToken===''?accountsMap[key].symbol:currentToken,
	};
	return ({
		currentAccount:currentAccount,
		txObj: {to, amount, data, gasLimit, gasPrice},
		editable:editable
	})

};


export default connect(mapToState)(Send);
