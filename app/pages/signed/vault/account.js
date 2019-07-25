import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	View,
	TouchableOpacity,
	Text,
	PixelRatio,
	Image,
	RefreshControl,
	Keyboard,
	Dimensions,
	StyleSheet,
	FlatList,
	Platform,
	ActivityIndicator
} from 'react-native';
import {getStatusBarHeight,accountKey} from "../../../../utils";
import BigNumber from 'bignumber.js';
import {strings} from "../../../../locales/i18n";
import {mainColor, mainBgColor,linkButtonColor} from "../../../style_util";
import defaultStyles from '../../../styles';
import {PopWindow} from "./home_popwindow";
import {ACCOUNT_MENU} from "./constants";
import {Header} from 'react-navigation';
import {TransactionItem, AddressComponent} from '../../../components/common';
import {COINS} from '../../../../coins/support_coin_list';
import {sameAddress} from '../../../../coins/api';
import {createAction, navigate} from "../../../../utils/dva";

const {width} = Dimensions.get('window');

const SwithType = type=>{
	let  accountImage=null;
	switch (type) {
		case '[ledger]':
			accountImage = require('../../../../assets/account_le_symbol.png');
			break;
		case '[pk]':
			accountImage = require('../../../../assets/account_pk_symbol.png');
			break;
		default:
			accountImage = require('../../../../assets/account_mk_symbol.png')
	}
	return accountImage;
};

const ImageHeader = ({type, title, hasMenu})=>(
	<View style={{flexDirection:'row', flex:1,justifyContent:'center',paddingHorizontal:20,alignItems:'center'}}>
		{
			hasMenu ?
				<Image source={SwithType(type)}
					   style={{width: 20, height: 20, marginRight: 20, tintColor: '#fff', borderRadius: 5,}}
					   resizeMode={'contain'}/>
				:null
		}
		<Text style={{color:'#fff', includeFontPadding:true, textAlignVertical:'bottom', fontWeight: 'bold', fontSize:16}}>{title}</Text>
	</View>
);



class Account extends Component {

	static navigationOptions = ({ navigation }) => {
	    const title = navigation.getParam('title');
	    const type = navigation.getParam('type','[local]' );
	    const showMenu  = navigation.getParam('showMenu', ()=>{});
	    const hasMenu = navigation.getParam('hasMenu');
		return {
	    	headerTitle: <ImageHeader title={title} type={type} hasMenu={hasMenu}/>,
			headerRight: (
                    <TouchableOpacity
                        style={{width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',}}
                        onPress={()=> {if (hasMenu) showMenu(); }}
                    >
						{
							hasMenu ?
								<Image source={require('../../../../assets/icon_account_menu.png')}
									   style={{width: 30, height: 30, tintColor: '#fff'}} resizeMode={'contain'}/>
								: null
						}
                    </TouchableOpacity>
			),
	    };
    };
	constructor(props){
		super(props);
		const {currentAccount} = this.props;
		this.isMount = false;

		this.state={
			refreshing: false,
			loading: true,
			showMenu: false,
		};
		this.props.navigation.setParams({
			title: currentAccount.name,
			type: currentAccount.type,
			showMenu: this.openMenu,
            hasMenu: !COINS[currentAccount.symbol].tokenSupport
		})
	}
	componentWillMount(){
        this.fetchAccountTransactions();
		this.isMount = true;
		this.listenNavigation  =this.props.navigation.addListener('willBlur',()=>this.setState({showMenu:false}))
	}

	async componentWillUnmount() {
		this.isMount = false;
		this.listenNavigation.remove();
	}



	componentWillReceiveProps(nextProps): void {
		if(nextProps.currentAccount.name !== this.props.currentAccount.name){
			this.props.navigation.setParams({
				title: nextProps.currentAccount.name,
			})
		}
	}



	fetchAccountTransactions = ()=>{
		const {dispatch,currentAccount} = this.props;
		dispatch(createAction('accountsModel/getTransactionHistory')({
			user_address: currentAccount.address,
			symbol: currentAccount.symbol,
			tokenSymbol: currentAccount.coinSymbol === currentAccount.symbol?'':currentAccount.coinSymbol,
			page: 0,
			size: 5,
			needSave: true,
		})).then(r=>{
			this.isMount &&this.setState({
				refreshing: false,
				loading: false,
			})
		})
	};

	onRefresh =()=>{
		this.setState({
			refreshing: true,
		},()=>this.fetchAccountTransactions());
	};

	onReLoad = ()=>{
		this.setState({
			loading: true,
		},()=>this.fetchAccountTransactions());
	};


	openMenu = () => {
		this.setState({
			showMenu:true
		})
	};

	onCloseMenu = (select) => {
		const {dispatch,currentAccount} = this.props;
		const {navigationSafely} = this.props.screenProps;
		this.setState({
			showMenu:false
		},()=>{
			switch(select){
				case ACCOUNT_MENU[0].title:
                    navigate('signed_vault_set_account_name')({dispatch});
                    break;
				case ACCOUNT_MENU[1].title:
					navigationSafely({routeName:'signed_vault_export_private_key', params:{currentAccount: accountKey(currentAccount.symbol, currentAccount.address)}})({dispatch});
					break;
				default:
			}
		})
	};

	toSend=()=> {
		this.props.dispatch(createAction('txSenderModel/reset')());
		this.props.navigation.navigate('signed_vault_send');
	};

	toReceive=()=> {
		this.props.navigation.navigate('signed_vault_receive');
	};

	toHistory=()=>{
		navigate('signed_vault_transaction_history')(this.props);
	};

	toTxDetail=(item)=>{
		const {currentAccount} = this.props;
		navigate('signed_vault_transaction', {
			account:currentAccount,
			transaction:item,
		})(this.props);

	};


	renderEmpty(){
		if(this.state.loading){
			return(
				<View style={{
					width: width,
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: mainBgColor
				}}>
					<ActivityIndicator
						animating={true}
						color='gray'
						size="large"
					/>
				</View>
			)

		}else {
			return (
				<TouchableOpacity style={{flex: 1}} onPress={this.onReLoad}>
					<View style={{
						width: width,
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: mainBgColor
					}}>
						<Image source={require('../../../../assets/empty_transactions.png')}
							   style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
							   resizeMode={'contain'}
						/>
						<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
							<Image source={require('../../../../assets/refresh.png')}
								   style={{width: 20, height: 20, tintColor: 'gray', marginHorizontal: 10}}
								   resizeMode={'contain'}/>
							<Text style={{color: 'gray'}}>{strings('account_view.empty_label')}</Text>
						</View>
					</View>
				</TouchableOpacity>

			)
		}
	}

	renderTransactions(transactionsList){
		const {currentAccount} = this.props;
		if(this.state.loading){
			return(
				<View style={{
					width: width,
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: mainBgColor
				}}>
					<ActivityIndicator
						animating={true}
						color='gray'
						size="large"
					/>
				</View>
			)

		}else {
			return (
				<FlatList
					data={transactionsList}
					style={{backgroundColor:mainBgColor}}
					keyExtractor={(item,index)=>index + ''}
					renderItem={({item})=><TransactionItem
						transaction={item}
						isSender={sameAddress(currentAccount.symbol, currentAccount.address, item.from)}
						symbol={currentAccount.coinSymbol}
						onPress={()=>this.toTxDetail(item)}
					/>}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={()=>this.onRefresh(currentAccount.address)}
							title={'loading'}
						/>
					}
				/>
			)
		}
	}

	render(){
		const {currentAccount, transactions} = this.props;
		const {address, type, coinSymbol, balance} = currentAccount;
    	const accountBalanceText = new BigNumber(balance).toNotExString() + ' ' + coinSymbol;
		const accountBalanceTextFontSize = Math.max(Math.min(32,200* PixelRatio.get() / (accountBalanceText.length +4) - 5), 16);
		const popWindowTop = Platform.OS==='ios'?(getStatusBarHeight(true)+Header.HEIGHT):Header.HEIGHT;
		let menuArray = [ACCOUNT_MENU[0]];
		if (type !== '[ledger]') {
			menuArray.push(ACCOUNT_MENU[1]);
		}

		return (
			<View style={{flex:1, backgroundColor: mainColor}}>
				<TouchableOpacity  activeOpacity={1} style={{flex:1}} onPress={()=>Keyboard.dismiss()}>

					<View style={{justifyContent:'space-between', alignItems:'center', height:130, paddingVertical:20, backgroundColor:mainColor}}>
						<Text style={{fontSize:accountBalanceTextFontSize, color:'#fff'}}>{accountBalanceText}</Text>
						<AddressComponent address={address} symbol={currentAccount.symbol}/>
					</View>
					<View style={{width:width,height:60,backgroundColor:'rgba(255,255,255,0.1)',
						flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
						<TouchableOpacity
							style={{width:width/2,height:60, justifyContent:'center', alignItems:'center'}}
							onPress={this.toSend}
						>
							<Text style={{fontSize:16,color:'#fff'}}>{strings('account_view.send_button')}</Text>
						</TouchableOpacity>
						<Image source={require('../../../../assets/separate.png')} style={{height:40,width:2,tintColor:'#fff'}}/>
						<TouchableOpacity
							style={{width:width/2,height:60, justifyContent:'center', alignItems:'center'}}
							onPress={this.toReceive}
						>
							<Text style={{fontSize:16,color:'#fff'}}>{strings('account_view.receive_button')}</Text>
						</TouchableOpacity>
					</View>

					{/*transaction history*/}
					<View style={{...defaultStyles.shadow,width:width,height:60,flexDirection:'row',justifyContent:'flex-start', alignItems:'center', paddingHorizontal:20,backgroundColor:'#fff'}}>
						<Image source={require('../../../../assets/rectangle.png')} resizeMode={'contain'} style={{width:5, height:30}}/>
						<Text style={{marginLeft:10, fontSize: 16, color:'#000'}}>{strings('account_view.transaction_history_label')}</Text>
						<View style={{flex:1, height:60, alignItems:'flex-end', justifyContent:'center'}}>
							<TouchableOpacity style={{flexDirection:'row',flex:1,height:60,justifyContent:'flex-end', alignItems:'center'}}
								onPress={this.toHistory}
							>
								<Text style={{fontSize:12,color:linkButtonColor}}>{strings('account_view.complete_button')}</Text>
								<Image source={require('../../../../assets/arrow_right.png')} style={{height:20,width:20,tintColor:'gray'}}/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{flex: 1, backgroundColor: mainBgColor}}>
					{
						transactions.length>0?this.renderTransactions(transactions):this.renderEmpty()
					}
					</View>
				</TouchableOpacity>
				{/*Menu Pop window*/}
				{
					this.state.showMenu?
						<PopWindow
							backgroundColor={'rgba(52,52,52,0.54)'}
							onClose={(select)=>this.onCloseMenu(select)}
							data={menuArray}
							containerPosition={{position:'absolute', top:popWindowTop,right:5}}
							imageStyle={{width: 20, height: 20, marginRight:10}}
							fontStyle={{fontSize:12, color:'#000'}}
							itemStyle={{flexDirection:'row',justifyContent:'flex-start', alignItems:'center', marginVertical: 10}}
							containerBackgroundColor={'#fff'}
							ItemSeparatorComponent={()=><View style={styles.divider}/>}
						/>
						:null
				}
			</View>
		)
	}
}



const mapToState=({accountsModel})=>{
	const {currentAccount:key,currentToken, transactionsMap, accountsMap}=accountsModel;
	const currentAccount = {
		...accountsMap[key],
		coinSymbol: currentToken===''?accountsMap[key].symbol:currentToken,
		balance: currentToken===''?accountsMap[key].balance:accountsMap[key].tokens[currentToken]
	};
	const txKey = currentToken===''?key: key + '+' +currentToken;
	const compareFn = (a, b) => {
		if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
		if (b.timestamp === undefined && a.timestamp === undefined) return 0;
		if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
		return b.timestamp - a.timestamp;
	};
	const transactions = Object.values(transactionsMap[txKey]).sort(compareFn).slice(0,5);

	return({
		currentAccount,
		transactions:transactions,
	})
};



export default connect(mapToState)(Account);

const styles=StyleSheet.create({
	divider: {
		height: 0.5,
		backgroundColor: '#dfdfdf'
	},
});
