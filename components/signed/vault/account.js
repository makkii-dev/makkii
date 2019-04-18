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
import {fetchAccountTransactionHistory, getStatusBarHeight, navigationSafely} from "../../../utils";
import {update_account_txs} from "../../../actions/accounts";
import BigNumber from 'bignumber.js';
import {strings} from "../../../locales/i18n";
import {mainColor, fixedWidthFont, mainBgColor,linkButtonColor} from "../../style_util";
import defaultStyles from '../../styles';
import {PopWindow} from "./home_popwindow";
import {ACCOUNT_MENU} from "./constants";
import {Header} from 'react-navigation';
import {TransactionItem} from '../../common';
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

const ImageHeader = ({type, title})=>(
	<View style={{flexDirection:'row', flex:1,justifyContent:'center',paddingHorizontal:20,alignItems:'center'}}>
		<Image source={SwithType(type)} style={{width:20,height:20, marginRight:20,tintColor:'#fff', borderRadius:5, }} resizeMode={'contain'}/>
		<Text style={{color:'#fff', includeFontPadding:true, textAlignVertical:'bottom', fontWeight: 'bold', fontSize:16}}>{title}</Text>
	</View>
);

class AddressComponent extends Component {
	state={
		showAllAddress: false
	};
	render() {
		const {address} = this.props;
		if(this.state.showAllAddress) {
			return (
				<View style={{flexDirection:'row', justifyContent:'center', alignItems:'center',width:width}}>
					<View>
						<Text style={styles.addressFontStyle}>{address.substring(0, 4 )+' '+address.substring(4, 10)+' '+address.substring(10,16)+' '+address.substring(16,22)}</Text>
						<Text style={styles.addressFontStyle}>{address.substring(22,26)+' '+address.substring(26,32)+' '+address.substring(32,38)+' '+address.substring(38,44)}</Text>
						<Text style={styles.addressFontStyle}>{address.substring(44,48)+' '+address.substring(48,54)+' '+address.substring(54,60)+' '+address.substring(60,66)}</Text>
					</View>
					<View style={{marginHorizontal:10,justifyContent:'space-between', alignItems:'center'}}>
						<TouchableOpacity onPress={()=>{
							Clipboard.setString(address);
							AppToast.show(strings('toast_copy_success'));
						}}>
							<Image source={require("../../../assets/copy.png")} style={{width:20, height:20}}/>
						</TouchableOpacity>
						<TouchableOpacity onPress={()=>{Keyboard.dismiss();this.setState({showAllAddress:false})}}>
							<View style={{height:20,backgroundColor:'rgba(255,255,255,0.1)', borderRadius:10, paddingHorizontal:10,justifyContent:'center'}}>
								<Text style={styles.addressFontStyle}>{strings('account_view.collapse_button')}</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			)
		}else {
			return (
				<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: width}}>
					<Text
						style={styles.addressFontStyle}>{address.substring(0, 10) + '...' + address.substring(58)}</Text>
					<TouchableOpacity onPress={() => {
						Clipboard.setString(address);
						AppToast.show(strings('toast_copy_success'));
					}}>
						<Image source={require("../../../assets/copy.png")}
							   style={{marginHorizontal: 10, width: 20, height: 20}}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => {
						Keyboard.dismiss();
						this.setState({showAllAddress: true})
					}}>
						<View style={{
							height: 24,
							backgroundColor: 'rgba(255,255,255,0.1)',
							borderRadius: 10,
							paddingHorizontal: 5,
							justifyContent: 'center'
						}}>
							<Text style={styles.addressFontStyle}>{strings('account_view.show_all_button')}</Text>
						</View>
					</TouchableOpacity>
				</View>
			);
		}
	}
}


class Account extends Component {

	static navigationOptions = ({ navigation }) => {
	    const title = navigation.getParam('title');
	    const type = navigation.getParam('type','[local]' );
	    const showMenu  = navigation.getParam('showMenu', ()=>{});
		return {
	    	headerTitle: <ImageHeader title={title} type={type}/>,
			headerRight: (<TouchableOpacity
				style={{width: 48,
					height: 48,
					alignItems: 'center',
					justifyContent: 'center',}}
				onPress={()=>{showMenu()}}
			>
				<Image source={require('../../../assets/icon_account_menu.png')} style={{width:30,height:30, tintColor:'#fff'}} resizeMode={'contain'}/>
			</TouchableOpacity>),
	    };
    };
	constructor(props){
		super(props);
		this.state={
			refreshing: false,
			loading: true,
			showMenu: false,
		};
		this.addr=this.props.navigation.state.params.address;
		this.account = this.props.accounts[this.addr];
		this.isMount = false;
		this.updateTitle({
			showMenu: ()=>this.openMenu(),
		});
	}
	componentWillMount(){
		this.fetchAccountTransactions(this.addr);
		this.isMount = true;
	}

	async componentWillUnmount() {
		this.isMount = false;
	}


	shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
		return this.props.accounts!==nextProps.accounts || this.state !== nextState;
	}

	updateTitle = (args={}) =>{
		const {type, name} = this.props.accounts[this.addr];
		this.props.navigation.setParams({
			title: name,
			type: type,
			...args
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
						address: this.account.address,
						onUpdateFinish: this.updateTitle,
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
				case ACCOUNT_MENU[2].title:
				    navigation.navigate('signed_select_coin', {});
					break;
				default:
			}
		})
	};

	fetchAccountTransactions = (address, page=0, size=25)=>{
		const {explorer_server} = this.props.setting;
		fetchAccountTransactionHistory(address,explorer_server,page,size).then(txs=>{
			if (Object.keys(txs).length===0){
				AppToast.show(strings('message_no_more_data'));
				throw Error('get no transactions')
			}
			const {dispatch, user} = this.props;
			dispatch(update_account_txs(address,txs,explorer_server, user.hashed_password));
			this.isMount&&this.setState({
				refreshing: false,
				loading:false,
			})
		}).catch(error=>{
			console.log(error);
			this.isMount&&this.setState({
				refreshing: false,
				loading:false,
			})
		});
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
						setTimeout(()=>this.fetchAccountTransactions(this.addr),500);
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
						currentAddr={this.addr}
						onPress={()=>{
							Keyboard.dismiss();
							this.props.navigation.navigate('signed_vault_transaction',{
								account:this.addr,
								transaction: item,
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
		const {navigation, setting} = this.props;
		const {address, transactions, type} = this.account;
		const transactionsList =  transactions[setting.explorer_server]?Object.values(transactions[setting.explorer_server]).slice(0,5):[];
		const accountBalanceText = new BigNumber(this.account.balance).toNotExString()+ ' AION';
		const accountBalanceTextFontSize = Math.max(Math.min(32,200* PixelRatio.get() / (accountBalanceText.length +4) - 5), 16);
		const popwindowTop = Platform.OS==='ios'?(getStatusBarHeight(true)+Header.HEIGHT):Header.HEIGHT;
		return (
			<View style={{flex:1, backgroundColor: mainColor}}>
				<TouchableOpacity  activeOpacity={1} style={{flex:1}} onPress={()=>Keyboard.dismiss()}>

					<View style={{justifyContent:'space-between', alignItems:'center', height:130, paddingVertical:20, backgroundColor:mainColor}}>
						<Text style={{fontSize:accountBalanceTextFontSize, color:'#fff'}}>{accountBalanceText}</Text>
						<AddressComponent address={address}/>
					</View>
					<View style={{width:width,height:60,backgroundColor:'rgba(255,255,255,0.1)',
						flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
						<TouchableOpacity
							style={{width:width/2,height:60, justifyContent:'center', alignItems:'center'}}
							onPress={()=>{
								Keyboard.dismiss();
								navigation.navigate('signed_vault_send', {
									address: this.addr,
								});
							}}
						>
							<Text style={{fontSize:16,color:'#fff'}}>{strings('account_view.send_button')}</Text>
						</TouchableOpacity>
						<Image source={require('../../../assets/separate.png')} style={{height:40,width:2,tintColor:'#fff'}}/>
						<TouchableOpacity
							style={{width:width/2,height:60, justifyContent:'center', alignItems:'center'}}
							onPress={()=>{
								Keyboard.dismiss();
								navigation.navigate('signed_vault_receive', {
									address: this.addr,
								});
							}}
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
									this.props.navigation.navigate('signed_vault_transaction_history', {account: this.account.address})
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
							data={type==='[ledger]'?ACCOUNT_MENU.slice(0,1):ACCOUNT_MENU}
							containerPosition={{position:'absolute', top:popwindowTop,right:5}}
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

export default connect(state => {
	return ({
		accounts: state.accounts,
		user: state.user,
		setting: state.setting,
	});
})(Account);

const styles=StyleSheet.create({
	addressFontStyle: {
		fontSize:12,
		color:'#fff',
		includeFontPadding:false,
		fontFamily:fixedWidthFont,
	},
	divider: {
		height: 0.5,
		backgroundColor: '#dfdfdf'
	},
});
