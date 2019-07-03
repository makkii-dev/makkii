import * as React from 'react';
import {
	View,
	Image,
	Text,
	TextInput, TouchableOpacity,
	TouchableWithoutFeedback, ActivityIndicator, Platform, ScrollView, Dimensions
} from 'react-native';
import {connect} from "react-redux";
import {strings} from "../../../locales/i18n";
import {ComponentButton} from '../../common';
import {createAction} from "../../../utils/dva";
import Loading from "../../loading";
import commonStyles from '../../styles';
import { mainBgColor} from '../../style_util';
import {COINS} from "../../../coins/support_coin_list";
import BigNumber from "bignumber.js";
import {navigate} from "../../../utils/dva";
import {accountKey, validateAmount} from "../../../utils";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {DismissKeyboard} from "../../dimissKyboradView";
import {getTokenIconUrl} from "../../../coins/api";
import FastImage from "react-native-fast-image";
const {width} = Dimensions.get('window');

const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;
export const renderAddress = (address)=>(
	<View>
		<Text style={{...commonStyles.addressFontStyle, color:'#000'}}>{address.substring(0, 4 )+' '+
		address.substring(4, 8)+' '+
		address.substring(8,12)+' '+
		address.substring(12, 16) + ' ' +
		address.substring(16,21)}</Text>
		<Text style={{...commonStyles.addressFontStyle, color:'#000'}}>{address.substring(21,25)+' '+
		address.substring(25,29)+' '+
		address.substring(29,33)+' '+
		address.substring(33,37)+ ' ' +
		address.substring(37, 42)}</Text>
	</View>
);

class Home extends React.Component {
	static navigationOptions = ({navigation, screenProps})=>{
		const {t, lan} = screenProps;
		return({
			title: t('token_exchange.title',{locale:lan}),
		})
	};


	state = {
		srcToken: this.props.trade.srcToken,
		destToken: this.props.trade.destToken,
		srcQty: 0,
		destQty: 0,
		tradeRate: this.props.trade.tradeRate,
	};
	srcQtyFocused =false;
	destQtyFocused = false;

	componentWillReceiveProps(nextProps){
		const {isLoading, trade} = this.props;
		const {isLoading:nextisLoading, trade:nextTrade,} = nextProps;
		const res =  isLoading!==nextisLoading || trade.destToken!==nextTrade.destToken
			|| trade.srcToken!== nextTrade.srcToken;
		if(res){
			const {srcQty, destQty} = this.state;
			let newState = {
				srcToken: nextTrade.srcToken,
				destToken: nextTrade.destToken,
				tradeRate: nextTrade.tradeRate,
			};
			if(this.srcQtyFocused||!this.destQtyFocused){
				newState={
					...newState,
					srcQty:srcQty,
					destQty: srcQty*nextTrade.tradeRate
				}
			}else{
				newState={
					...newState,
					srcQty: destQty/nextTrade.tradeRate,
					destQty:destQty,
				}
			}
			this.setState(newState)
		}
	}


	onExchangeSrc2dest = ()=>{
		const {srcToken,destToken} = this.props.trade;
		this.props.dispatch(createAction('ERC20Dex/updateTrade')({srcToken:destToken,destToken:srcToken}))
	};

	onChangeSrcTokenValue = (v)=>{
		const {tradeRate} = this.state;
		if(validateAmount(v)||v===''){
			this.setState({
				srcQty:v,
				destQty: v*tradeRate
			});
		}

	};

	onChangeDestTokenValue = (v)=>{
		const {tradeRate} = this.state;
		this.setState({
			srcQty:v/tradeRate,
			destQty: v
		});
	};

	selectAccount =  ()=>{
		navigate('signed_Dex_account_list')(this.props);
	};

	selectToken = (flow)=>{
		navigate('signed_Dex_exchange_token_list', {flow:flow})(this.props);
	};

	goToAccountDetail = (item)=>{
		navigate('signed_vault_account_tokens', {account:item})(this.props);
	};

	onTrade = ()=>{
		const {srcToken, destToken, srcQty,destQty} = this.state;
		const {dispatch, currentAccount} = this.props;
		dispatch(createAction('ERC20Dex/trade')({srcToken,destToken,srcQty,destQty,account:currentAccount}));
	};

	renderAccount = (item) =>{
		if(item) {
			return (
				<View style={{
					...commonStyles.shadow,
					borderRadius: 10,
					marginVertical: 10,
					marginHorizontal:20,
					paddingHorizontal: 10,
					alignItems: 'flex-start',
					backgroundColor: '#fff',
					width:width-40
				}}>
					<TouchableOpacity onPress={this.selectAccount}>
						<View style={{
							width: '100%',
							paddingVertical: 10,
							flexDirection: 'row',
							justifyContent: 'space-between',
							borderBottomWidth: 0.2,
							borderBottomColor: 'lightgray'
						}}>
							<Text style={{
								fontSize: 16,
								fontWeight: 'bold'
							}}>{strings('token_exchange.label_current_account')}</Text>
							<Image source={require('../../../assets/arrow_right.png')} style={{width: 24, height: 24}}/>
						</View>
					</TouchableOpacity>
					<TouchableWithoutFeedback onPress={()=>this.goToAccountDetail(item)}>
						<View style={styles.accountContainerWithShadow}>
							<Image source={COINS[item.symbol].icon} style={{marginRight: 10, width: 24, height: 24}}/>
							<View style={{flex: 1, paddingVertical: 10}}>
								<View style={{...styles.accountSubContainer, width: '100%', alignItems: 'center'}}>
									<Text style={{...styles.accountSubTextFontStyle1, width: '70%'}}
										  numberOfLines={1}>{item.name}</Text>
									<Text style={{
										...styles.accountSubTextFontStyle1,
										fontWeight: 'bold'
									}}>{new BigNumber(item.balance).toFixed(4)}</Text>
								</View>
								<View style={{...styles.accountSubContainer, alignItems: 'center'}}>
									{renderAddress(item.address)}
									<Text style={styles.accountSubTextFontStyle2}>{item.symbol}</Text>
								</View>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			)
		}else{
			return (
				<View style={{
					...commonStyles.shadow,
					borderRadius: 10,
					marginVertical: 10,
					marginHorizontal:20,
					paddingHorizontal: 10,
					alignItems: 'flex-start',
					backgroundColor: '#fff',
					width:width-40
				}}>
					<TouchableOpacity onPress={this.selectAccount}>
						<View style={{
							width: '100%',
							paddingVertical: 10,
							flexDirection: 'row',
							justifyContent: 'space-between',
							borderBottomWidth: 0.2,
							borderBottomColor: 'lightgray'
						}}>
							<Text style={{
								fontSize: 16,
								fontWeight: 'bold'
							}}>{strings('token_exchange.label_select_account')}</Text>
							<Image source={require('../../../assets/arrow_right.png')} style={{width: 24, height: 24}}/>
						</View>
					</TouchableOpacity>

				</View>

			)
		}
	};

	renderLoading = ()=>(
		<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
			<ActivityIndicator
				animating={true}
				color='red'
				size="large"
			/>
		</View>
	);

	getTokenIcon = (tokenSymbol)=>{
		const {tokenList} = this.props;
		try{
			const fastIcon = getTokenIconUrl('ETH',tokenSymbol, tokenList[tokenSymbol].address);
			return <FastImage style={{width: 24, height: 24}} source={{uri: fastIcon}} resizeMode={FastImage.resizeMode.contain}/>
		}catch (e) {
			const Icon = COINS['ETH'].default_token_icon;
			return <Image style={{width: 24, height: 24}} source={Icon} resizeMode={'contain'}/>
		}
	};

	renderContent = ()=>{

		const {srcToken,destToken,srcQty, destQty,tradeRate} = this.state;
		const {currentAccount} = this.props;
		console.log('currentAccount=>', currentAccount);
		let buttonEnabled = false;
		let hasToken = false;
		if(currentAccount){
			const {balance, tokens} = currentAccount;
			hasToken = srcToken === 'ETH'?true:!!tokens[srcToken];
			const ethCost = srcToken === 'ETH'? +srcQty+0.0043:0.0014;
			const tokenCost = srcToken === 'ETH'? 0 : +srcQty;
			const {balance: tokenBalance = 0} = tokens[srcToken] ||{};
			console.log('hasToken=>',hasToken);
			console.log('ethBalance=>',balance);
			console.log('ethCost=>',ethCost);
			console.log('tokenBalance=>',tokenBalance);
			console.log('tokenCost=>',tokenCost);
			buttonEnabled = BigNumber(balance).toNumber()>=ethCost &&  BigNumber(tokenBalance).toNumber()>=tokenCost &&srcQty>0;
		}
		return(
			<DismissKeyboard>
				<View style={{flex:1, backgroundColor:mainBgColor}}>
					<MyscrollView
						style={{width:width}}
						keyboardShouldPersistTaps='always'
					>
						{this.renderAccount(currentAccount)}
						<View style={styles.container1}>
							<View style={{width:'100%', alignItems:'flex-start'}}>
								<Text style={{fontSize: 16, fontWeight: 'bold'}}>
									{strings('token_exchange.label_current_rate') + ' ≈ '}
									<Text style={{fontSize:14}}>{tradeRate}</Text>
								</Text>
							</View>
							<View style={styles.tokenView}>
								<View style={styles.tokenNumberLabel}>
									<Text style={{fontSize:16}}>{strings('token_exchange.label_sell')}</Text>
									<TextInput
										style={styles.textInputStyle}
										value={srcQty+''}
										onChangeText={this.onChangeSrcTokenValue}
										onFocus={()=>this.srcQtyFocused=true}
										onBlur={()=>this.srcQtyFocused=false}
										keyboardType={'number-pad'}
										multiline={false}
										underlineColorAndroid={'transparent'}
									/>
								</View>
								<TouchableOpacity onPress={()=>this.selectToken('src')}>
									<View style={styles.tokenLabel}>
										{this.getTokenIcon(srcToken)}
										<Text style={{fontSize:16}}>{srcToken}</Text>
										<Image source={require('../../../assets/arrow_right.png')} style={{width: 24, height: 24}}/>
									</View>
								</TouchableOpacity>
							</View>
							<TouchableWithoutFeedback onPress={this.onExchangeSrc2dest}>
								<Image source={require('../../../assets/icon_exchange.png')} style={{width:20,height:20}} resizeMode={'contain'}/>
							</TouchableWithoutFeedback>
							<View style={styles.tokenView}>
								<View style={styles.tokenNumberLabel}>
									<Text style={{fontSize:16}}>{strings('token_exchange.label_buy')}</Text>
									<TextInput
										style={styles.textInputStyle}
										value={destQty+''}
										onChangeText={this.onChangeDestTokenValue}
										onFocus={()=>this.destQtyFocused=true}
										onBlur={()=>this.destQtyFocused=false}
										keyboardType={'number-pad'}
										multiline={false}
										underlineColorAndroid={'transparent'}
									/>
								</View>
								<TouchableOpacity onPress={()=>this.selectToken('dest')}>
									<View style={styles.tokenLabel}>
										{this.getTokenIcon(destToken)}
										<Text style={{fontSize:16}}>{destToken+''}</Text>
										<Image source={require('../../../assets/arrow_right.png')} style={{width: 24, height: 24}}/>
									</View>
								</TouchableOpacity>
							</View>

						</View>
						<ComponentButton
							title={currentAccount!==undefined?
								buttonEnabled?
									strings('token_exchange.button_exchange_enable'):
									!hasToken?
										strings('token_exchange.button_exchange_no_token',{token:srcToken})
										: srcQty>0?
											strings('token_exchange.button_exchange_disable')
											:strings('token_exchange.button_exchange_invalid_number')
								:strings('token_exchange.button_exchange_no_account')}
							disabled={!buttonEnabled}
							style={{
								width:width-40,
								marginHorizontal:20,
							}}
							onPress={this.onTrade}
						/>
					</MyscrollView>
					<Loading isShow={this.props.isWaiting}/>
				</View>
			</DismissKeyboard>
		)
	};

	render(){
		const {isLoading} = this.props;
		return isLoading?this.renderLoading():this.renderContent();
	}

}

const mapToState = ({accounts, setting, ERC20Dex})=>{
	return {
		trade:ERC20Dex.trade,
		isLoading:ERC20Dex.isLoading,
		isWaiting:ERC20Dex.isWaiting,
		currentAccount: accounts[accountKey('ETH',ERC20Dex.currentAccount)],
		tokenList:ERC20Dex.tokenList,
		lang:setting.lang,
	}
};


export default connect(mapToState)(Home);


const styles = {
	container1:{
		...commonStyles.shadow,
		borderRadius:10,
		backgroundColor: 'white',
		width:width-40,
		alignItems: 'center',
		padding:10,
		marginVertical:20,
		marginHorizontal:20,
	},
	tokenView:{
		width:'100%',
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
		borderBottomWidth:0.2,
		borderBottomColor:'lightgray',
		marginVertical:10,
		height:50,
	},
	tokenLabel:{
		flexDirection:'row',
		alignItems:'center',
		justifyContent:'space-around',
		width:100,
		padding:5,
	},
	textInputStyle:{
		padding:0,
		width:width-200,
	},
	tokenNumberLabel:{
		flexDirection:'row',
		justifyContent:'center',
		alignItems:'center',
	},
	accountContainerWithShadow:{
		flexDirection:'row',
		justifyContent:'flex-start',
		alignItems: 'center',
		paddingHorizontal:15,
	},
	accountSubContainer:{
		flexDirection:'row',
		justifyContent:'space-between',
	},
	accountSubTextFontStyle1:{
		fontSize:14,
		color:'#000'
	},
	accountSubTextFontStyle2:{
		fontSize:12,
		color:'gray'
	},
};