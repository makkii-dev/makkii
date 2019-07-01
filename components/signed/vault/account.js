import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	View,
	TouchableOpacity,
	Text,
	PixelRatio,
	Image,
	Clipboard,
	RefreshControl,
	Keyboard,
	Dimensions,
	StyleSheet,
	FlatList,
	Platform,
	ActivityIndicator
} from 'react-native';
import {getStatusBarHeight, navigationSafely,accountKey} from "../../../utils";
import Loading from '../../loading';
import {update_account_txs, update_account_tokens, update_account_name} from "../../../actions/accounts";
import BigNumber from 'bignumber.js';
import {strings} from "../../../locales/i18n";
import {mainColor, fixedWidthFont, mainBgColor,linkButtonColor} from "../../style_util";
import defaultStyles from '../../styles';
import {PopWindow} from "./home_popwindow";
import {ACCOUNT_MENU} from "./constants";
import {Header} from 'react-navigation';
import {TransactionItem, AddressComponent} from '../../common';
import {COINS} from '../../../coins/support_coin_list';
import {getTransactionsByAddress,formatAddress1Line,fetchAccountTokenBalance,fetchAccountTokenTransferHistory,fetchAccountTokens} from '../../../coins/api';
import {AppToast} from "../../../utils/AppToast";

const {width} = Dimensions.get('window');

const SwithType = type=>{
	let  accountImage=null;
	switch (type) {
		case '[ledger]':
			accountImage = require('../../../assets/account_le_symbol.png');
			break;
		case '[pk]':
			accountImage = require('../../../assets/account_pk_symbol.png');
			break;
		default:
			accountImage = require('../../../assets/account_mk_symbol.png')
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
								<Image source={require('../../../assets/icon_account_menu.png')}
									   style={{width: 30, height: 30, tintColor: '#fff'}} resizeMode={'contain'}/>
								: null
						}
                    </TouchableOpacity>
			),
	    };
    };
	constructor(props){
		super(props);
		this.account = this.props.navigation.state.params.account;
		this.token = this.props.navigation.state.params.token;

		this.account_key = accountKey(this.account.symbol, this.account.address);
		this.isMount = false;

		this.state={
			refreshing: false,
			loading: true,
			showMenu: false,
		};
		this.props.navigation.setParams({
			title: this.account.name,
			type: this.account.type,
			showMenu: this.openMenu,
            hasMenu: !COINS[this.account.symbol].tokenSupport
		})
	}
	componentWillMount(){
        this.fetchAccountTransactions(this.account.address);
		this.isMount = true;
	}

	async componentWillUnmount() {
		this.isMount = false;
	}

	shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
		return this.props.accounts!==nextProps.accounts || this.state !== nextState;
	}

	updateAccountName = (newName) =>{
	    const {dispatch} = this.props;
	    dispatch(update_account_name(this.account_key, newName, this.props.user.hashed_password));
		const {name} = this.props.accounts[this.account_key];
		this.props.navigation.setParams({
			title: name,
		})
	};

	onRefresh =(address)=>{
		this.setState({
			refreshing: true,
		});
		this.fetchAccountTransactions(address,0,10);
	};
	openMenu = () => {
		this.setState({
			showMenu:true
		})
	};

	onCloseMenu = (select) => {
		const {navigation} = this.props;
		const {pinCodeEnabled} = this.props.setting;
		const {hashed_password} = this.props.user;
		this.setState({
			showMenu:false
		},()=>{
			switch(select){
				case ACCOUNT_MENU[0].title:
					navigation.navigate('signed_vault_change_account_name',{
					    name: this.account.name,
						onUpdate: this.updateAccountName,
					});
					break;
				case ACCOUNT_MENU[1].title:
					navigationSafely(
						pinCodeEnabled,
						hashed_password,
						navigation,
						{
							url:'signed_vault_export_private_key',
							args:{privateKey: this.account.private_key},
						});
					break;
				default:
			}
		})
	};

	toSend=()=> {
		Keyboard.dismiss();
		this.props.navigation.navigate('signed_vault_send', {
			account: this.account,
			token: this.token,
		});
	}

	toReceive=()=> {
		Keyboard.dismiss();
		this.props.navigation.navigate('signed_vault_receive', {
		    account: this.account,
			token: this.token,
		});
	}

	fetchAccountTransactions = (address, page=0, size=5, obj={}, callback=()=>{})=>{
		const {accounts,dispatch,user} = this.props;
		if (this.token === undefined) {
			getTransactionsByAddress(this.account.symbol, address, page, size).then(txs => {
				if (Object.keys(txs).length === 0) {
					AppToast.show(strings('message_no_more_data'));
					throw Error('get no transactions')
				}
				dispatch(update_account_txs(this.account_key, txs, user.hashed_password));
				this.isMount && this.setState({
					refreshing: false,
					loading: false,
					...obj
				})
			}).catch(error => {
				console.log(error);
				this.isMount && this.setState({
					refreshing: false,
					loading: false,
					...obj
				})
			});
		} else {
			// currently only support aion token
			const {contractAddr, tokenTxs} = this.token;
			fetchAccountTokenTransferHistory(this.account.symbol, address, contractAddr, null, page, size).then(txs => {
				if (Object.keys(txs).length === 0) {
					AppToast.show(strings('message_no_more_data'));
					throw Error('get no transactions')
				}

				this.token.tokenTxs = tokenTxs?Object.assign({}, tokenTxs, txs): txs;
				dispatch(update_account_tokens(this.account_key, tokens, user.hashed_password));
				this.isMount && this.setState({
					refreshing: false,
					loading: false,
					...obj
				}, callback)
			}).catch(error => {
				console.log(error);
				this.isMount && this.setState({
					refreshing: false,
					loading: false,
					...obj
				}, callback)
			});
		}
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
				<TouchableOpacity style={{flex: 1}} onPress={()=>{
					this.setState({loading:true},()=>{
						setTimeout(()=>this.fetchAccountTransactions(this.account.address),500);
					})
				}}>
					<View style={{
						width: width,
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: mainBgColor
					}}>
						<Image source={require('../../../assets/empty_transactions.png')}
							   style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
							   resizeMode={'contain'}
						/>
						<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
							<Image source={require('../../../assets/refresh.png')}
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
		console.log('transcationList=>', transactionsList);
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
						currentAddr={this.account.address}
						symbol={this.token === undefined? this.account.symbol: this.token.symbol}
						account={this.account}
						onPress={()=>{
							Keyboard.dismiss();
							this.props.navigation.navigate('signed_vault_transaction',{
								account:this.account,
								transaction: item,
                                token: this.token
							});
						}}/>}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={()=>this.onRefresh(this.account.address)}
							title={'loading'}
						/>
					}
				/>
			)
		}
	}

	render(){
		const {navigation, setting, accounts} = this.props;
		const {address, transactions, type, symbol} = this.account;
		let transactionsList, accountBalanceText;
		let compareFn = (a, b) => {
		    if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
		    if (b.timestamp === undefined && a.timestamp === undefined) return 0;
		    if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
		    return b.timestamp - a.timestamp;
		};
		if (this.token === undefined) {
			transactionsList = transactions?Object.values(transactions).slice(0,5):[];
			accountBalanceText = new BigNumber(accounts[this.account_key].balance).toNotExString() + ' ' + this.account.symbol;
		} else {
		    let tokenTxs = accounts[this.account_key].tokens[this.token.symbol].tokenTxs;
            transactionsList = tokenTxs? Object.values(tokenTxs).sort(compareFn).slice(0,5):[];

			accountBalanceText = new BigNumber(accounts[this.account_key].tokens[this.token.symbol].balance) + ' ' + this.token.symbol;
		}
		const accountBalanceTextFontSize = Math.max(Math.min(32,200* PixelRatio.get() / (accountBalanceText.length +4) - 5), 16);
		const popwindowTop = Platform.OS==='ios'?(getStatusBarHeight(true)+Header.HEIGHT):Header.HEIGHT;
		let menuArray = [ACCOUNT_MENU[0]];
		if (type !== '[ledger]') {
			menuArray.push(ACCOUNT_MENU[1]);
		}

		return (
			<View style={{flex:1, backgroundColor: mainColor}}>
				<TouchableOpacity  activeOpacity={1} style={{flex:1}} onPress={()=>Keyboard.dismiss()}>

					<View style={{justifyContent:'space-between', alignItems:'center', height:130, paddingVertical:20, backgroundColor:mainColor}}>
						<Text style={{fontSize:accountBalanceTextFontSize, color:'#fff'}}>{accountBalanceText}</Text>
						<AddressComponent address={address} symbol={this.account.symbol}/>
					</View>
					<View style={{width:width,height:60,backgroundColor:'rgba(255,255,255,0.1)',
						flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
						<TouchableOpacity
							style={{width:width/2,height:60, justifyContent:'center', alignItems:'center'}}
							onPress={this.toSend}
						>
							<Text style={{fontSize:16,color:'#fff'}}>{strings('account_view.send_button')}</Text>
						</TouchableOpacity>
						<Image source={require('../../../assets/separate.png')} style={{height:40,width:2,tintColor:'#fff'}}/>
						<TouchableOpacity
							style={{width:width/2,height:60, justifyContent:'center', alignItems:'center'}}
							onPress={this.toReceive}
						>
							<Text style={{fontSize:16,color:'#fff'}}>{strings('account_view.receive_button')}</Text>
						</TouchableOpacity>
					</View>

					{/*transaction history*/}
					<View style={{...defaultStyles.shadow,width:width,height:60,flexDirection:'row',justifyContent:'flex-start', alignItems:'center', paddingHorizontal:20,backgroundColor:'#fff'}}>
						<Image source={require('../../../assets/rectangle.png')} resizeMode={'contain'} style={{width:5, height:30}}/>
						<Text style={{marginLeft:10, fontSize: 16, color:'#000'}}>{strings('account_view.transaction_history_label')}</Text>
						<View style={{flex:1, height:60, alignItems:'flex-end', justifyContent:'center'}}>
							<TouchableOpacity style={{flexDirection:'row',flex:1,height:60,justifyContent:'flex-end', alignItems:'center'}}
								onPress={()=>{
									this.props.navigation.navigate('signed_vault_transaction_history', {
										account: this.account,
										token: this.token,
									})
								}}
							>
								<Text style={{fontSize:12,color:linkButtonColor}}>{strings('account_view.complete_button')}</Text>
								<Image source={require('../../../assets/arrow_right.png')} style={{height:20,width:20,tintColor:'gray'}}/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{flex: 1, backgroundColor: mainBgColor}}>
					{
						transactionsList.length>0?this.renderTransactions(transactionsList):this.renderEmpty()
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
							containerPosition={{position:'absolute', top:popwindowTop,right:5}}
							imageStyle={{width: 20, height: 20, marginRight:10}}
							fontStyle={{fontSize:12, color:'#000'}}
							itemStyle={{flexDirection:'row',justifyContent:'flex-start', alignItems:'center', marginVertical: 10}}
							containerBackgroundColor={'#fff'}
							ItemSeparatorComponent={()=><View style={styles.divider}/>}
						/>
						:null
				}
				<Loading ref={element => {
					this.loadingView = element;
				}}/>
			</View>
		)
	}
}

export default connect(state => {
	return ({
		accounts: state.accounts,
		user: state.user,
		setting: state.setting,
	});
})(Account);

const styles=StyleSheet.create({
	divider: {
		height: 0.5,
		backgroundColor: '#dfdfdf'
	},
});
