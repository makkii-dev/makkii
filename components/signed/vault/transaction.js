import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	View,
	Text,
	Image,
	Clipboard,
	StyleSheet,
	TouchableOpacity,
	Linking,
	ScrollView,
	Dimensions,
} from 'react-native';
import {TransactionItemCell,PendingComponent} from '../../common'
import {strings} from "../../../locales/i18n";
import {sameAddress, getTransactionExplorerUrl} from "../../../coins/api";
import {linkButtonColor,mainBgColor} from "../../style_util";
const {width, height} = Dimensions.get('window');
import defaultStyles from '../../styles';
import {AppToast} from "../../../utils/AppToast";

class Transaction extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			title: strings('transaction_detail.title')
		};
	};

	constructor(props){
		super(props);
		this.account = this.props.navigation.state.params.account;
		this.additional_data =this.props.navigation.state.params.additional_data;
		this.transaction = this.props.navigation.state.params.transaction;
	}
	onViewInExplorer=()=>{
		const url = getTransactionExplorerUrl(this.account.symbol, this.transaction.hash);
		Linking.openURL(url).catch(err => console.error('An error occurred', err));
	};

	renderAdditionData = ()=>{
		if(this.additional_data){
			const {type, data} = this.additional_data;
			if(type==='exchange'){
				const {srcToken, srcQty, destToken, destQty} = data;
				let content = [];
				content.push(
					<TransactionItemCell
						key={'payment'}
						style={{height:80}}
						title={strings('transaction_detail.label_payment')}
						value={ srcQty + ' ' +srcToken}
						valueTextAlign={'left'}
					/>
				);
				content.push(
					<TransactionItemCell
						key={'exchanged'}
						style={{height:80}}
						title={strings('transaction_detail.label_exchanged')}
						value={ destQty + ' ' +destToken}
						valueTextAlign={'left'}
					/>
				);
				return content;
			}
		}else{
			const {coinSymbol} = this.account;
			return (
				<TransactionItemCell
					style={{height:80}}
					title={strings('transaction_detail.amount_label')}
					value={new BigNumber(this.transaction.value).toNotExString()+' ' + coinSymbol}
					valueTextAlign={'left'}

				/>
			);
		}
	};

	render(){
		const transaction = this.transaction;
		const timestamp = transaction.timestamp === undefined? '': new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
		const ifSender = sameAddress(this.account.symbol, this.account.address, transaction.from);
		const title1 = ifSender? strings('transaction_detail.receiver_label'): strings('transaction_detail.sender_label');
		const value1 = ifSender? transaction.to: transaction.from;
		let inAddressBook, addressName, unit;
		if (Object.keys(this.props.user.address_book).indexOf(value1) >= 0) {
			inAddressBook = true;
			addressName = this.props.user.address_book[value1].name;
		} else {
			inAddressBook = false;
		}


		return (
			<ScrollView style={{backgroundColor:mainBgColor,height,width}}>
				<View style={{flex:1,width:width,paddingHorizontal:20}}>
					<View style={{...defaultStyles.shadow, flex:1,marginVertical:20,paddingVertical:10,paddingHorizontal:10, borderRadius: 10, backgroundColor: 'white'}}>
						<TransactionItemCell
							style={{height:100}}
							title={title1}
							value={inAddressBook?addressName+"("+value1+")":value1}
							valueTextAlign={'left'}
							rightView={() =>
                                <View style={{flexDirection: 'row'}}>
                                    <TouchableOpacity onPress={() => {
                                        Clipboard.setString(value1);
                                        AppToast.show(strings('toast_copy_success'));
                                    }}>
                                        <Image source={require('../../../assets/copy.png')}
                                               style={{width: 20, height: 20, tintColor: '#000'}} resizeMode={'contain'}/>
                                    </TouchableOpacity>
									{
										inAddressBook?null:
											<TouchableOpacity onPress={() => {
												this.props.navigation.navigate('signed_setting_add_address', {
													address: value1,
													symbol: this.account.symbol,
												});
											}} style={{marginLeft: 10}}>
												<Image source={require('../../../assets/icon_add_address.png')}
													   style={{width: 20, height: 20, tintColor: '#000'}} resizeMode={'contain'}/>
											</TouchableOpacity>
									}
								</View>
							}
						/>
						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.timestamp_label')}
							value={timestamp}
							valueTextAlign={'left'}
						/>
						<TransactionItemCell
							style={{height:100}}
							title={strings('transaction_detail.transactionHash_label')}
							value={transaction.hash}
							valueTextAlign={'left'}
							rightView={()=><TouchableOpacity onPress={()=>{
								Clipboard.setString(transaction.hash);
								AppToast.show(strings('toast_copy_success'));
							}}>
								<Image source={require('../../../assets/copy.png')} style={{width:20,height:20,tintColor:'#000'}} resizeMode={'contain'}/>
							</TouchableOpacity>}
						/>
						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.blockNumber_label')}
							value={transaction.blockNumber}
							valueTextAlign={'left'}
						/>

						{this.renderAdditionData()}

						<TransactionItemCell
							style={{height:80}}
							title={strings('transaction_detail.status_label')}
							value={<PendingComponent status={transaction.status}/>}
							valueTextAlign={'left'}
						/>

					</View>
					<View style={{marginTop:10, flexDirection: 'row', justifyContent: 'flex-end', width:'100%', padding:10}}>
						<TouchableOpacity
							onPress={this.onViewInExplorer}
						>
							<Text style={{color: linkButtonColor}}>{strings('transaction_detail.viewInExplorer_button')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		)
	}
}

export default connect(state => {
	return ({
		user: state.user,
	}); })(Transaction);

const style =  StyleSheet.create({

});
