import React, { Component } from 'react';
import { connect } from 'react-redux';
import {FlatList, View, TouchableOpacity, Text, PixelRatio, Image,Clipboard, RefreshControl, Keyboard} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../../styles.js';
import {EditableView} from "../../common";
import {fetchRequest} from "../../../utils";
import {update_account_name, update_account_txs} from "../../../actions/accounts";
import Toast from 'react-native-root-toast';
import BigNumber from 'bignumber.js';
import {strings} from "../../../locales/i18n";
import GeneralStatusBar from "./home";

class Account extends Component {

	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : '',
	        headerTitleStyle: {
	        	alignSelf: 'center',
				textAlign: 'center',
				width: '100%',
	        },
	        headerStyle: {
	        	shadowOpacity: 0,
	        	shadowOffset: {
	        		height: 0,
	        		width:0,
	        	},
	        	shadowRadius: 0,
	        	borderBottomWidth:0,
	        	elevation: 1,
	        },
			headerRight: <View></View>
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
		return (
			<TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>
				<View style={{flex:1, justifyContent: 'space-between'}}>
				<View style={styles.Account.summaryContainer}>
					<View style={styles.Account.summaryLeftContainer}>
						<EditableView
							value={this.account.name}
							endInput={this.onChangeName.bind(this)}
							type={this.account.type}
						/>
						<Text style={{textAlign:'auto'}}>{new BigNumber(this.account.balance).toNotExString()} AION</Text>
					</View>
					<View>
						<QRCode
							value={this.account.address}
							size={100}
							color='purple'
							backgroundColor='white'
						/>
					</View>
				</View>
				<View style={styles.Account.addressView}>
					<Text style={{fontSize:10, textAlign:'auto',marginRight: 10}}>{ this.account.address }</Text>
					<TouchableOpacity onPress={()=>{
						Clipboard.setString(this.account.address);
						Toast.show(strings('toast_copy_success'));
					}}>
						<Image source={require("../../../assets/copy.png")} style={{width:20, height:20}}/>
					</TouchableOpacity>
				</View>

				<View style={{...styles.Account.buttonContainer}}>
					<TouchableOpacity
						onPress={()=>{
							navigation.navigate('signed_vault_send', {
								address: this.addr,
							});
						}}
					>
						<View style={{width:100,height:40,borderRadius:10,backgroundColor:'#3399ff',alignItems:'center',justifyContent:'center',elevation:2}}>
							<Text style={{color:'#fff'}}>{strings('account_view.send_button')}</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={()=>{
							navigation.navigate('signed_vault_receive', {
								address: this.addr,
							});
						}}
					>
						<View style={{width:100,height:40,borderRadius:10,backgroundColor:'#3399ff',alignItems:'center',justifyContent:'center',elevation:2}}>
						<Text style={{color:'#fff'}}>{strings('account_view.receive_button')}</Text>
						</View>
					</TouchableOpacity>
				</View>
				<View style={{alignItems:'center', backgroundColor:'#eee', marginRight:10, marginLeft: 10}}>
					<Text>{strings('account_view.transaction_history_label')}</Text>
				</View>
				<FlatList
					style={{marginLeft:10, marginRight:10}}
					data={Object.values(this.account.transactions).slice(0,3)}
					keyExtractor={(item,index)=>index + ''}
					renderItem={({item})=>this._renderTransaction(item)}
                    ItemSeparatorComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}
					ListEmptyComponent={()=>
						<View style={{alignItems:'center', backgroundColor:'#fff'}}>
							<Text>{strings('account_view.empty_label')}</Text>
						</View>
					}
					ListHeaderComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}
					ListFooterComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={()=>this.onRefresh(this.account.address)}
							title={'loading'}
						/>
					}
				/>
			</View>
			</TouchableOpacity>
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
