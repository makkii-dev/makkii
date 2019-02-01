import React, { Component } from 'react';
import { connect } from 'react-redux';
import {FlatList, View, TouchableOpacity, Text, Button, PixelRatio, Image,Clipboard} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../../styles.js';
import {EditableView} from "../../common";
import {parseDate} from "../../../utils";
import {update_account_name} from "../../../actions/accounts";
import Toast from '../../toast.js';

Date.prototype.Format = function (fmt) {
	let o = {
		"M+": this.getMonth() + 1, //month 
		"d+": this.getDate(), //day 
		"h+": this.getHours() % 12, //hour 
		"m+": this.getMinutes(), //minute 
		"s+": this.getSeconds(), //seconds 
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
		"S": this.getMilliseconds() //milliseconds 
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substring(4 - RegExp.$1.length));
	for (let k in o){
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substring(("" + o[k]).length)));
		}
	}
	fmt = this.getHours() > 12 ? fmt + 'PM' : fmt + 'AM';
	return fmt;
};

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
	}
	async componentDidMount(){

	}
	componentWillMount(): void {
		console.log('[route] ' + this.props.navigation.state.routeName);
		this.props.navigation.setParams({
			title: this.props.account.name
		});
	}

	_renderTransaction(transaction){
		const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd/ hh:mm");
		return (
			<TouchableOpacity
				onPress={e => {
					//dispatch(account(this.props.accounts[key]));
					this.props.navigation.navigate('VaultTransaction');
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
						}}>{ transaction.value.toFixed(2) } Aion</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}
	onChangeName = (newName) =>{
		const {dispatch} = this.props;
		const key = this.props.account.address;
		dispatch(update_account_name(key,newName));
		this.props.navigation.setParams({
			title: newName
		});
	};

	render(){

		return (
			<View style={{flex:1, justifyContent: 'space-between'}}>
				<View style={styles.Account.summaryContainer}>
					<View style={styles.Account.summaryLeftContainer}>
						<EditableView
							value={this.props.account.name}
							endInput={this.onChangeName.bind(this)}
							type={this.props.account.type}
						/>
						<Text>{ this.props.account.balance } AION</Text>
					</View>
					<View>
						<QRCode
							value={this.props.account.address}
							size={100}
							color='purple'
							backgroundColor='white'
						/>
					</View>
				</View>
				<View style={styles.Account.addressView}>
					<Text style={{fontSize:10, textAlign:'auto',marginRight: 10}}>{ this.props.account.address }</Text>
					<TouchableOpacity onPress={()=>{
						Clipboard.setString(this.props.account.address);
						this.refs.toast.show('Copied to clipboard successfully');
					}}>
						<Image source={require("../../../assets/copy.png")} style={{width:20, height:20}}/>
					</TouchableOpacity>
				</View>

				<View style={{
					flex: 1,
			        flexDirection: 'row',
			        justifyContent: 'space-between',
					alignItems: 'center',
			        padding: 20,
				}}>
					<Button
						title="SEND"
						onPress={()=>console.log('SEND')}
					/>
					<Button
						title="RECEIVE"
						onPress={()=>console.log('RECEIVE')}
					/>
				</View>
				<FlatList
					data={Object.values(this.props.account.transactions)}
					keyExtractor={(item,index)=>index + ''}
					renderItem={({item})=>this._renderTransaction(item)}
                    ItemSeparatorComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}
					ListEmptyComponent={()=>
						<View style={{alignItems:'center', backgroundColor:'#fff'}}>
						<Text>No Transaction</Text>
						</View>}
				/>
				<Toast
					ref={"toast"}
					duration={Toast.Duration.short}
					onDismiss={() => {}}
				/>
			</View>
		)
	}
}

export default connect(state => {
	return ({
		account: state.account,
	});
})(Account);