import * as React from 'react';
import {
	View,
	Image,
	Text,
	TextInput,
	TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import {connect} from "react-redux";
import {strings} from "../../../locales/i18n";
import {ComponentButton, AddressComponent} from '../../common';
import {createAction} from "../../../utils/dva";
import Loading from "../../loading";
import commonStyles from '../../styles';
import {fixedHeight, fixedWidth, fixedWidthFont, mainBgColor} from '../../style_util';
import {COINS} from "../../../coins/support_coin_list";
import BigNumber from "bignumber.js";
import {formatAddress1Line} from "../../../coins/api";
import {accountKey} from "../../../utils";


const renderAddress = (address)=>(
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
)

class Home extends React.Component {
	static navigationOptions = ({navigation})=>{
		return({
			title: strings('token_exchange.title'),
		})
	};


	state = {
		srcToken: this.props.trade.srcToken,
		destToken: this.props.trade.destToken,
		srcQty: 0,
		destQty: 0,
		tradeRate: this.props.trade.tradeRate,
		currentAccount: '0xe92e7096eAaa7B404Df2f95ad6b930846E568f9f',
	};
	srcQtyFocused =false;
	destQtyFocused = false;

	componentWillReceiveProps(nextProps){
		const {isLoading, trade} = this.props;
		const {isLoading:nextisLoading, trade:nextTrade} = nextProps;
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

	onChangeSrcToken = (st)=>{
		const {destToken} = this.props.trade;
		this.props.dispatch(createAction('ERC20Dex/updateTrade')({srcToken:st,destToken:destToken}))
	};

	onChangeDestToken = (dt)=>{
		const {srcToken} = this.props.trade;
		this.props.dispatch(createAction('ERC20Dex/updateTrade')({srcToken:srcToken,destToken:dt}))
	};

	onChangeSrcTokenValue = (v)=>{
		const {tradeRate} = this.state;
		this.setState({
			srcQty:v,
			destQty: v*tradeRate
		});
	};

	onChangeDestTokenValue = (v)=>{
		const {tradeRate} = this.state;
		this.setState({
			srcQty:v/tradeRate,
			destQty: v
		});
	};

	renderAccount = (item) =>{
		if(item) {
			return (
				<View style={{
					...commonStyles.shadow,
					borderRadius: 10,
					marginVertical: 10,
					paddingHorizontal: 10,
					alignItems: 'flex-start',
					backgroundColor: '#fff',
				}}>
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
						<TouchableWithoutFeedback>
							<Image source={require('../../../assets/arrow_right.png')} style={{width: 24, height: 24}}/>
						</TouchableWithoutFeedback>
					</View>
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
				</View>
			)
		}else{
			return (
				<View style={{
					...commonStyles.shadow,
					borderRadius: 10,
					marginVertical: 10,
					paddingHorizontal: 10,
					alignItems: 'flex-start',
					backgroundColor: '#fff',
				}}>
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
						<TouchableWithoutFeedback>
							<Image source={require('../../../assets/arrow_right.png')} style={{width: 24, height: 24}}/>
						</TouchableWithoutFeedback>
					</View>
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

	renderContent = ()=>{

		const {srcToken,destToken,srcQty, destQty,tradeRate,currentAccount} = this.state;
		// const {srcToken,destToken,srcQty, destQty} = {srcToken:'ETH',destToken:'DAI',srcQty:0,destQty:0};
		const {accounts} = this.props;
		return(
			<View style={{flex:1, paddingHorizontal:20, backgroundColor:mainBgColor}}>
				{this.renderAccount(accounts[accountKey('ETH', currentAccount)])}
				<View style={styles.container1}>
					<View style={{width:'100%', alignItems:'flex-start'}}>
						<Text style={{fontSize: 16, fontWeight: 'bold'}}>{strings('token_exchange.label_current_rate') + ' '+ tradeRate}</Text>
					</View>
					<View style={styles.tokenView}>
						<View style={styles.tokenNumberLabel}>
							<Text>{strings('token_exchange.label_sell')}</Text>
							<TextInput
								value={srcQty+''}
								onChangeText={this.onChangeSrcTokenValue}
								onFocus={()=>this.srcQtyFocused=true}
								onBlur={()=>this.srcQtyFocused=false}
								KeyboardType={'numeric'}
							/>
						</View>
						<View style={styles.tokenLabel}>
							<Text>{srcToken}</Text>
						</View>
					</View>
					<TouchableWithoutFeedback onPress={this.onExchangeSrc2dest}>
						<Image source={require('../../../assets/icon_exchange.png')} style={{width:20,height:20}} resizeMode={'contain'}/>
					</TouchableWithoutFeedback>
					<View style={styles.tokenView}>
						<View style={styles.tokenNumberLabel}>
							<Text>{strings('token_exchange.label_buy')}</Text>
							<TextInput
								value={destQty+''}
								onChangeText={this.onChangeDestTokenValue}
								onFocus={()=>this.destQtyFocused=true}
								onBlur={()=>this.destQtyFocused=false}
								KeyboardType={'numeric'}
							/>
						</View>
						<View style={styles.tokenLabel}>
							<Text>{destToken+''}</Text>
						</View>
					</View>

				</View>
				<ComponentButton
					title={'兑换'}
				/>
				<Loading isShow={this.props.isWaiting}/>
			</View>
		)
	};

	render(){
		const {isLoading} = this.props;
		return isLoading?this.renderLoading():this.renderContent();
	}

}

const mapToState = ({accounts, ERC20Dex})=>{
	return {
		// accounts:Object.keys(accounts).filter(k=>k.toLowerCase().startsWith('eth')).reduce((map,el)=>{map[el]=accounts[el];return map},{}),
		accounts: accounts,
		trade:ERC20Dex.trade,
		isLoading:ERC20Dex.isLoading,
		isWaiting:ERC20Dex.isWaiting,
	}
};


export default connect(mapToState)(Home);


const styles = {
	container1:{
		...commonStyles.shadow,
		borderRadius:10,
		backgroundColor: 'white',
		width:'100%',
		alignItems: 'center',
		padding:10,
		marginVertical: 20,
	},
	tokenView:{
		width:'100%',
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
		borderBottomWidth:0.2,
		borderBottomColor:'lightgray',
		marginVertical:10,
	},
	tokenLabel:{

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