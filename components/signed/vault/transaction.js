import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity,Linking } from 'react-native';
import {TransactionItemCell} from '../../common'
import {strings} from "../../../locales/i18n";
class Transaction extends Component {
    static navigationOptions={
        title: strings('transaction_detail.title')
    };
	constructor(props){
		super(props);
		this.addr = this.props.navigation.state.params.account;
		this.transactionHash = this.props.navigation.state.params.transactionHash;
	}
	onViewInExplorer(){
		const url = `https://${this.props.setting.explorer_server}.aion.network/#/transaction/${this.transactionHash}`;
		Linking.openURL(url).catch(err => console.error('An error occurred', err));
	}
	sendAgain(){
		const {navigation} = this.props;
		const transaction = this.props.accounts[this.addr].transactions[this.transactionHash];
		navigation.navigate('signed_vault_send',{
			address: transaction.from,
			value: transaction.value + '',
			recipient: transaction.to,
		})
	}
	render(){
		const transaction = this.props.accounts[this.addr].transactions[this.transactionHash];
		const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
		const ifSender = this.addr === transaction.from;
		const title1 = ifSender? strings('transaction_detail.receiver_label'): strings('transaction_detail.sender_label');
		const value1 = ifSender? transaction.to: transaction.from;
		return (
			<View style={{flex:1,backgroundColor:'#eee',alignItems:'center'}}>
				<TransactionItemCell
					style={{height:80, marginTop:20}}
					title={title1}
					value={value1}
					valueTextAlign={'left'}
				/>
				<TransactionItemCell
					style={{height:50}}
					title={strings('transaction_detail.timestamp_label')}
					value={timestamp}
				/>
				<TransactionItemCell
					style={{height:80}}
					title={strings('transaction_detail.transactionHash_label')}
					value={transaction.hash}
					valueTextAlign={'left'}
				/>
				<TransactionItemCell
					style={{height:50}}
					title={strings('transaction_detail.blockNumber_label')}
					value={transaction.blockNumber}
				/>
				<TransactionItemCell
					style={{height:50}}
					title={strings('transaction_detail.amount_label')}
					value={new BigNumber(transaction.value).toNotExString()+' AION'}
				/>
				<TransactionItemCell
					style={{height:50}}
					title={strings('transaction_detail.status_label')}
					value={transaction.status}
				/>
				{
					ifSender? <TouchableOpacity
						onPress={()=>this.sendAgain()}
					>
						<View style={{
							marginTop: 20,
							width: 200,
							backgroundColor: 'blue',
							borderRadius: 100,
							alignItems: 'center',
							height: 50,
							justifyContent: 'center'
						}}>
							<Text style={{color: '#fff'}}>{strings('transaction_detail.sendAgain_button')}</Text>
						</View>
					</TouchableOpacity>: null
				}
				<View style={{marginTop:20, flexDirection: 'row', justifyContent: 'flex-end', width:'100%', padding:10}}>
					<TouchableOpacity
						onPress={()=>this.onViewInExplorer()}
					>
						<Text style={{color:'blue'}}>{strings('transaction_detail.viewInExplorer_button')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
}

export default connect(state => {
	return ({
		accounts: state.accounts,
		setting: state.setting
	}); })(Transaction);

const style =  StyleSheet.create({

});
