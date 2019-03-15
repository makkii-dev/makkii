import React, { Component } from 'react';
import { connect } from 'react-redux';
import {FlatList, View, TouchableOpacity, Text, PixelRatio, Image,Clipboard, RefreshControl, Keyboard, Dimensions, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {EditableView} from "../../common";
import {fetchRequest} from "../../../utils";
import {update_account_name, update_account_txs} from "../../../actions/accounts";
import Toast from 'react-native-root-toast';
import BigNumber from 'bignumber.js';
import {strings} from "../../../locales/i18n";
import GeneralStatusBar from "../../GeneralStatusBar";
import {fixedWidth, fixedHeight} from "../../style_util";
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
							<View style={{height:24,backgroundColor:'rgba(255,255,255,0.1)', borderRadius:10, paddingHorizontal:2,justifyContent:'center'}}>
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
							paddingHorizontal: 2,
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
					//dispatch(account(this.account[key]));
					this.props.navigation.navigate('signed_vault_transaction',{
						account:this.addr,
						transactionHash: transaction.hash,
					});
				}}
			>
				<View style={styles.Transaction.container}>
					<View style={styles.Transaction.subContainer}>
						<Text style={{
							color: 'grey',
						}}>{ timestamp }</Text>
						<Text style={{
							color: 'grey',
						}}>{ transaction.status }</Text>
					</View>
					<View style={styles.Transaction.subContainer}>
						<Text style={{
							color: 'grey',
						}}>{ transaction.hash.substring(0, 16) + ' ...' }</Text>
						<Text style={{
							color: 'grey',
						}}>
							<Text style={{color:valueColor}}>{value} </Text>
							AION
						</Text>
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
				res.content.forEach(value=>{
					let tx={};
					tx.hash = '0x'+value.transactionHash;
					tx.timestamp = value.transactionTimestamp/1000;
					tx.from = '0x'+value.fromAddr;
					tx.to = '0x'+value.toAddr;
					tx.value = new BigNumber(value.value,16).shiftedBy(-18).toNumber();
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
		const {address, type} = this.account;
		const accountImage = SwithType(type);
		return (
			<View style={{flex:1}}>
				<GeneralStatusBar backgroundColor={"#4a87fa"}/>
				{/*title bar*/}
				<View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'center', height:48, width:width, backgroundColor:'#4a87fa'}}>
					<TouchableOpacity onPress={()=>navigation.goBack()} style={{width: 48, height: 48, alignItems: 'center', justifyContent: 'center'}}>
						<Image source={require('../../../assets/arrow_back.png')} style={{tintColor: '#fff', width: 20, height: 20,}} />
					</TouchableOpacity>
					<Image source={accountImage} style={{width:20,height:20, tintColor:'#fff'}}/>
				</View>
				<View style={{justifyContent:'space-between', alignItems:'center', height:150, paddingVertical:20, backgroundColor:'#4a87fa'}}>
					<Text style={{fontSize:32, color:'#fff'}}>{new BigNumber(this.account.balance).toNotExString()} AION</Text>
					<AddressComponent address={address}/>
				</View>
				<View style={{width:width,height:60,backgroundColor:'rgba(74,135,250,.9)',
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
			{/*<TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>*/}
				{/*<View style={{flex:1, justifyContent: 'space-between'}}>*/}
				{/*<View style={styles.Account.summaryContainer}>*/}
					{/*<View style={styles.Account.summaryLeftContainer}>*/}
						{/*<EditableView*/}
							{/*value={this.account.name}*/}
							{/*endInput={this.onChangeName.bind(this)}*/}
							{/*type={this.account.type}*/}
						{/*/>*/}
						{/*<Text style={{textAlign:'auto'}}>{new BigNumber(this.account.balance).toNotExString()} AION</Text>*/}
					{/*</View>*/}
					{/*<View>*/}
						{/*<QRCode*/}
							{/*value={this.account.address}*/}
							{/*size={100}*/}
							{/*color='purple'*/}
							{/*backgroundColor='white'*/}
						{/*/>*/}
					{/*</View>*/}
				{/*</View>*/}
				{/*<View style={styles.Account.addressView}>*/}
					{/*<Text style={{fontSize:10, textAlign:'auto',marginRight: 10}}>{ this.account.address }</Text>*/}
					{/*<TouchableOpacity onPress={()=>{*/}
						{/*Clipboard.setString(this.account.address);*/}
						{/*Toast.show(strings('toast_copy_success'));*/}
					{/*}}>*/}
						{/*<Image source={require("../../../assets/copy.png")} style={{width:20, height:20}}/>*/}
					{/*</TouchableOpacity>*/}
				{/*</View>*/}

				{/*<View style={{...styles.Account.buttonContainer}}>*/}
					{/*<TouchableOpacity*/}
						{/*onPress={()=>{*/}
							{/*navigation.navigate('signed_vault_send', {*/}
								{/*address: this.addr,*/}
							{/*});*/}
						{/*}}*/}
					{/*>*/}
						{/*<View style={{width:100,height:40,borderRadius:10,backgroundColor:'#3399ff',alignItems:'center',justifyContent:'center',elevation:2}}>*/}
							{/*<Text style={{color:'#fff'}}>{strings('account_view.send_button')}</Text>*/}
						{/*</View>*/}
					{/*</TouchableOpacity>*/}
					{/*<TouchableOpacity*/}
						{/*onPress={()=>{*/}
							{/*navigation.navigate('signed_vault_receive', {*/}
								{/*address: this.addr,*/}
							{/*});*/}
						{/*}}*/}
					{/*>*/}
						{/*<View style={{width:100,height:40,borderRadius:10,backgroundColor:'#3399ff',alignItems:'center',justifyContent:'center',elevation:2}}>*/}
						{/*<Text style={{color:'#fff'}}>{strings('account_view.receive_button')}</Text>*/}
						{/*</View>*/}
					{/*</TouchableOpacity>*/}
				{/*</View>*/}
				{/*<View style={{alignItems:'center', backgroundColor:'#eee', marginRight:10, marginLeft: 10}}>*/}
					{/*<Text>{strings('account_view.transaction_history_label')}</Text>*/}
				{/*</View>*/}
				{/*<FlatList*/}
					{/*style={{marginLeft:10, marginRight:10}}*/}
					{/*data={Object.values(this.account.transactions).slice(0,3)}*/}
					{/*keyExtractor={(item,index)=>index + ''}*/}
					{/*renderItem={({item})=>this._renderTransaction(item)}*/}
                    {/*ItemSeparatorComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}*/}
					{/*ListEmptyComponent={()=>*/}
						{/*<View style={{alignItems:'center', backgroundColor:'#fff'}}>*/}
							{/*<Text>{strings('account_view.empty_label')}</Text>*/}
						{/*</View>*/}
					{/*}*/}
					{/*ListHeaderComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}*/}
					{/*ListFooterComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}*/}
					{/*refreshControl={*/}
						{/*<RefreshControl*/}
							{/*refreshing={this.state.refreshing}*/}
							{/*onRefresh={()=>this.onRefresh(this.account.address)}*/}
							{/*title={'loading'}*/}
						{/*/>*/}
					{/*}*/}
				{/*/>*/}
			{/*</View>*/}
			{/*</TouchableOpacity>*/}
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
	}
});
