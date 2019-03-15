import React, { Component } from 'react';
import { connect } from 'react-redux';
import {FlatList, View, TouchableOpacity, Text, PixelRatio, Image,Clipboard, RefreshControl, Keyboard, Dimensions, StyleSheet,TextInput,ImageBackground} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {EditableView} from "../../common";
import {fetchRequest} from "../../../utils";
import {update_account_name, update_account_txs} from "../../../actions/accounts";
import Toast from 'react-native-root-toast';
import BigNumber from 'bignumber.js';
import {strings} from "../../../locales/i18n";
import GeneralStatusBar from "../../GeneralStatusBar";
import {mainColor} from "../../style_util";
import PropTypes from 'prop-types';
const {width,height} = Dimensions.get('window');


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

class AccountNameComponent extends Component{
	static propTypes={
		value: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		endInput: PropTypes.func.isRequired,
	};

	state = {
		editable: false,
		value: this.props.value,
	};

	onPress=()=>{
		const {editable} = this.state;
		this.setState({
			editable: !editable,
		},()=>{
			if (this.state.editable){
				this.inputRef.focus();
			}else {
				this.inputRef.blur();
				this.props.endInput(this.state.value);
			}
		})
	};
	render(){
		const {navigation, type} = this.props;
		const accountImage = SwithType(type);
		let style = {color:'#fff', width:140,textAlign:'center',includeFontPadding:false, textAlignVertical:'center', fontWeight: 'bold', fontSize:16};
		this.state.editable&&(style={...style, borderBottomWidth:1/PixelRatio.get(), borderBottomColor:'#fff'});
		return (
			<View style={{...this.props.style, flexDirection:'row'}}>
				<TouchableOpacity onPress={()=>navigation.goBack()} style={{width: 48, height: 48, alignItems: 'center', justifyContent: 'center'}}>
					<Image source={require('../../../assets/arrow_back.png')} style={{tintColor: '#fff', width: 20, height: 20}}/>
				</TouchableOpacity>
				<View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
					<Image source={accountImage} style={{width:20,height:20, marginRight:10,tintColor:'#fff', borderRadius:5}} resizeMode={'contain'}/>
					<TextInput
						ref={ref=>this.inputRef=ref}
						numberOfLines={1}
						value={this.state.value}
						editable={this.state.editable}
						onChangeText={v=>this.setState({value:v})}
						style={style}
						maxLength={15}
					/>
				</View>
				<TouchableOpacity onPress={()=>this.onPress()}>
					<ImageBackground source={require('../../../assets/edit.png')} style={{height:20,alignItems:'flex-end'}} imageStyle={{borderRadius:20}}>
						<Text style={{marginLeft:30, marginRight:10,fontSize:12, color:'#fff', fontFamily: 'monospace'}}>
							{this.state.editable?strings('account_view.save_button'):strings('account_view.editable_button')}</Text>
					</ImageBackground>
				</TouchableOpacity>

			</View>
		)
	}
}

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
							Toast.show(strings('toast_copy_success'));
						}}>
							<Image source={require("../../../assets/copy.png")} style={{width:20, height:20}}/>
						</TouchableOpacity>
						<TouchableOpacity onPress={()=>{Keyboard.dismiss();this.setState({showAllAddress:false})}}>
							<View style={{height:24,backgroundColor:'rgba(255,255,255,0.1)', borderRadius:10, paddingHorizontal:5,justifyContent:'center'}}>
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
						Toast.show(strings('toast_copy_success'));
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
	    return {
	        header: null,
	    };
    };
	constructor(props){
		super(props);
		this.state={
			refreshing: false,
		};
		this.addr=this.props.navigation.state.params.address;
		this.account = this.props.accounts[this.addr];
		this.props.navigation.setParams({
			title: this.account.name
		});
		this.isMount = false;
	}
	async componentDidMount(){
		this.isMount = true;
	}

	async componentWillUnmount() {
		this.isMount = false;
	}

	shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
		return this.props.accounts!==nextProps.accounts || this.state !== nextState;
	}

	_renderTransaction(transaction){
		if(transaction.status === 'PENDING'){
			console.log('try to get transaction '+transaction.hash+' status');
			listenTx.addTransaction(transaction);
		}

		const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
		const isSender = transaction.from === this.addr;
		const value = isSender? '-'+new BigNumber(transaction.value).toNotExString(): '+'+new BigNumber(transaction.value).toNotExString();
		const valueColor = isSender? 'red':'green';
		return (
			<TouchableOpacity
				onPress={e => {
					Keyboard.dismiss();
					this.props.navigation.navigate('signed_vault_transaction',{
						account:this.addr,
						transactionHash: transaction.hash,
					});
				}}
			>
				<View style={{...styles.shadow,marginHorizontal:20,marginVertical:10, borderColor:'gray', borderWidth:1/PixelRatio.get(), borderRadius:10,
					width:width-40,height:80,backgroundColor:'#fff', justifyContent:'space-between',paddingHorizontal:5,paddingVertical:10}}>
					<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
						<Text>{timestamp.substring(0,timestamp.length-2)} <Text style={{color:'blue'}}>{timestamp.substring(timestamp.length-2)}</Text></Text>
						<Text>{transaction.status}</Text>
					</View>
					<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
						<Text>{transaction.hash.substring(0, 16) + '...' }</Text>
						<Text style={{color:valueColor}}>{value} <Text>AION</Text></Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}
	onChangeName = (newName) =>{
		const {dispatch} = this.props;
		const key = this.account.address;
		dispatch(update_account_name(key,newName,this.props.user.hashed_password));
		this.props.navigation.setParams({
			title: newName
		});
	};

	onRefresh =(address)=>{
		this.setState({
			refreshing: true,
		});
		this.fetchAccountTransacions(address);
	};

	fetchAccountTransacions = (address, page=0, size=25)=>{
		const url = `https://${this.props.setting.explorer_server}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&page=${page}&size=${size}`;
		console.log("request url: " + url);
		fetchRequest(url).then(res=>{
			console.log('[fetch result]', res);
			let txs = {};
			if(res&&res.content){
				console.log('res content ', res.content);
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
			    Toast.show(strings('message_no_more_data'));
			}
			const {dispatch} = this.props;
			console.log('[txs] ', JSON.stringify(txs));
			dispatch(update_account_txs(address,txs,this.props.user.hashed_password));
			if (this.isMount) {
				this.setState({
					refreshing: false,
				})
			}
		},error => {
			console.log(error);
			if (this.isMount) {
				this.setState({
					refreshing: false,
				})
			}
		})
	};
	render(){
		const {navigation} = this.props;
		const {address, type, name ,transactions} = this.account;
		const transactionsList =  Object.values(transactions).slice(0,5);
		const accountBalanceText = new BigNumber(this.account.balance).toNotExString()+ ' AION';
		const accountBalanceTextFontSize = 32 - (accountBalanceText.length-10);
		return (
			<View style={{flex:1}}>
				<TouchableOpacity  activeOpacity={1} style={{flex:1}} onPress={()=>Keyboard.dismiss()}>
					<GeneralStatusBar backgroundColor={mainColor}/>
					{/*title bar*/}
					<AccountNameComponent
						style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:10,
							height:48, width:width, backgroundColor:mainColor}}
						value={name}
						type={type}
						navigation={navigation}
						endInput={(v)=>this.onChangeName(v)}
					/>

					<View style={{justifyContent:'space-between', alignItems:'center', height:130, paddingVertical:20, backgroundColor:mainColor}}>
						<Text style={{fontSize:accountBalanceTextFontSize, color:'#fff'}}>{accountBalanceText}</Text>
						<AddressComponent address={address}/>
					</View>
					<View style={{width:width,height:60,backgroundColor:'rgba(36,111,250,.9)',
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
					<View style={{...styles.shadow,width:width,height:60,flexDirection:'row',justifyContent:'flex-start', alignItems:'center', paddingHorizontal:20,backgroundColor:'#fff',
						borderBottomWidth:1/PixelRatio.get(), borderBottomColor:'gray'}}>
						<Image source={require('../../../assets/rectangle.png')} style={{width:5, height:30}}/>
						<Text style={{marginLeft:20, fontSize: 16, color:'#000'}}>{strings('account_view.transaction_history_label')}</Text>
					</View>
					<FlatList
						data={transactionsList}
						style={{backgroundColor:'#fff'}}
						keyExtractor={(item,index)=>index + ''}
						renderItem={({item})=>this._renderTransaction(item)}
						ListEmptyComponent={()=>
							<View style={{width:width,height:180,justifyContent:'center',alignItems:'center'}}>
								<Image source={require('../../../assets/empty_transactions.png')} style={{width:80,height:80, tintColor:'gray',marginBottom:20}}/>
								<Text style={{color:'gray'}}>{strings('account_view.empty_label')}</Text>
							</View>
						}
						refreshControl={
							<RefreshControl
								refreshing={this.state.refreshing}
								onRefresh={()=>this.onRefresh(this.account.address)}
								title={'loading'}
							/>
						}
					/>

				</TouchableOpacity>
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
		fontFamily:'monospace',
	},
	shadow:{
		shadowColor:'#eee',shadowOffset:{width:10,height:10}, elevation:5
	}
});
