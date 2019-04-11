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
import {fetchRequest,getStatusBarHeight} from "../../../utils";
import {update_account_txs} from "../../../actions/accounts";
import BigNumber from 'bignumber.js';
import {strings} from "../../../locales/i18n";
import {mainColor, fixedWidthFont, mainBgColor,linkButtonColor} from "../../style_util";
import defaultStyles from '../../styles';
import PendingComponent from './pendingComponent';
import {PopWindow} from "./home_popwindow";
import {ACCOUNT_MENU} from "./constants";
import {Header} from 'react-navigation';
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
		this.fetchAccountTransacions(this.addr);
		this.isMount = true;
	}

	async componentWillUnmount() {
		this.isMount = false;
	}


	shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
		return this.props.accounts!==nextProps.accounts || this.state !== nextState;
	}

	renderSingleTransaction(transaction){
		if(transaction.status === 'PENDING'){
			console.log('try to get transaction '+transaction.hash+' status');
			listenTx.addTransaction(transaction);
		}

		const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
		const isSender = transaction.from === this.addr;
		const m = new BigNumber(transaction.value).toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
		const fixed = Math.min(8,Math.max(0, (m[1] || '').length - m[2]));
		const value = isSender? '-'+new BigNumber(transaction.value).toFixed(fixed): '+'+new BigNumber(transaction.value).toFixed(fixed);
		const valueColor = isSender? 'red':'green';
		return (
			<TouchableOpacity
				style={{...defaultStyles.shadow,marginHorizontal:20,marginVertical:10, borderRadius:10,
					width:width-40,height:80,backgroundColor:'#fff', justifyContent:'space-between',padding: 10}}
				onPress={e => {
					Keyboard.dismiss();
					this.props.navigation.navigate('signed_vault_transaction',{
						account:this.addr,
						transaction: transaction,
					});
				}}
			>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <Text>{timestamp}</Text>
                    <PendingComponent status={transaction.status}/>
                </View>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
                    <Text>{transaction.hash.substring(0, 16) + '...' }</Text>
                    <Text style={{color:valueColor}}>{value} <Text>AION</Text></Text>
                </View>
			</TouchableOpacity>
		)
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
		this.fetchAccountTransacions(address);
	};
	openMenu = () => {
		this.setState({
			showMenu:true
		})
	};

	onCloseMenu = (select) => {
		const {navigation} = this.props;
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

					break;
				default:
			}
		})
	};

	fetchAccountTransacions = (address, page=0, size=25)=>{
		const url = `https://${this.props.setting.explorer_server}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&page=${page}&size=${size}`;
		console.log("request url: " + url);
		fetchRequest(url).then(res=>{
			let txs = {};
			if(res&&res.content){
				res.content.forEach(value=>{
					let tx={};
					tx.hash = '0x'+value.transactionHash;
					tx.timestamp = value.transactionTimestamp/1000;
					tx.from = '0x'+value.fromAddr;
					tx.to = '0x'+value.toAddr;
					tx.value = this.props.setting.explorer_server==='mastery'?new BigNumber(value.value,10).toNumber():new BigNumber(value.value,16).shiftedBy(-18).toNumber();
					tx.status = value.txError === ''? 'CONFIRMED':'FAILED';
					tx.blockNumber = value.blockNumber;
					txs[tx.hash]=tx;
				});
			}else{
			    AppToast.show(strings('message_no_more_data'));
			}
			const {dispatch, user, setting} = this.props;
			dispatch(update_account_txs(address,txs,setting.explorer_server, user.hashed_password));
			this.isMount&&this.setState({
				refreshing: false,
				loading:false,
			})
		},error => {
			console.log(error);
			this.isMount&&this.setState({
				refreshing: false,
				loading:false,
			})
		})
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
						setTimeout(()=>this.fetchAccountTransacions(this.addr),500);
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
					renderItem={({item})=>this.renderSingleTransaction(item)}
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
		const {address, transactions} = this.account;
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
							data={ACCOUNT_MENU}
							containerPosition={{position:'absolute', top:popwindowTop,right:5,width:150}}
							imageStyle={{width: 20, height: 20, marginRight:10}}
							fontStyle={{fontSize:12, color:'#000'}}
							itemStyle={{width:150,flexDirection:'row',justifyContent:'flex-start', alignItems:'center', marginVertical: 10}}
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
