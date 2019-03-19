import React, { Component } from 'react';
import { connect } from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Dimensions, PixelRatio} from 'react-native';
import {TransactionItemCell, ComponentButton} from '../../common'
import {strings} from "../../../locales/i18n";
const {width, height} = Dimensions.get('window');

class Transaction extends Component {
    static navigationOptions={
        title: strings('transaction_detail.title')
    };
	constructor(props){
		super(props);
		this.addr = this.props.navigation.state.params.account;
		this.transaction = this.props.navigation.state.params.transaction;
	}
	onViewInExplorer(){
		const url = `https://${this.props.setting.explorer_server}.aion.network/#/transaction/${this.transaction.hash}`;
		Linking.openURL(url).catch(err => console.error('An error occurred', err));
	}
	sendAgain(){
		const {navigation} = this.props;
		const transaction = this.transaction;
		navigation.navigate('signed_vault_send',{
			address: transaction.from,
			value: transaction.value + '',
			recipient: transaction.to,
		})
	}
	render(){
		const transaction = this.transaction;
		console.log('tx ',this.transaction)
		const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
		const ifSender = this.addr === transaction.from;
		const title1 = ifSender? strings('transaction_detail.receiver_label'): strings('transaction_detail.sender_label');
		const value1 = ifSender? transaction.to: transaction.from;
		return (
			<ScrollView style={{backgroundColor:'#fff',height,width}}>
				<View style={{flex:1,width:width,paddingHorizontal:10}}>
					<View style={{flex:1,marginVertical:20,paddingVertical:10,paddingHorizontal:10,shadowColor:'#eee',shadowOffset:{width:10,height:10},
						elevation:5, borderWidth:1/PixelRatio.get(),borderColor:'#eee', borderRadius: 10}}>
						<TransactionItemCell
							style={{height:120, marginTop:20}}
							title={title1}
							value={value1}
							valueTextAlign={'left'}
						/>
						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.timestamp_label')}
							value={<Text>{timestamp.substring(0,timestamp.length-2)+' '}<Text style={{fontWeight: 'bold'}}>{timestamp.substring(timestamp.length-2)}</Text></Text>}
							valueTextAlign={'left'}
						/>
						<TransactionItemCell
							style={{height:100}}
							title={strings('transaction_detail.transactionHash_label')}
							value={transaction.hash}
							valueTextAlign={'left'}
						/>
						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.blockNumber_label')}
							value={transaction.blockNumber}
							valueTextAlign={'left'}
						/>
						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.amount_label')}
							value={new BigNumber(transaction.value).toNotExString()+' AION'}
							valueTextAlign={'left'}

						/>
						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.status_label')}
							value={transaction.status}
							valueTextAlign={'left'}
						/>
					</View>
					{
						ifSender? <ComponentButton
							title={strings('transaction_detail.sendAgain_button')}
							onPress={()=>this.sendAgain()}
						/>: null
					}
					<View style={{marginTop:10, flexDirection: 'row', justifyContent: 'flex-end', width:'100%', padding:10}}>
						<TouchableOpacity
							onPress={()=>this.onViewInExplorer()}
						>
							<Text style={{color:'blue'}}>{strings('transaction_detail.viewInExplorer_button')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
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
