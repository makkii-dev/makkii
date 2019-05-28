import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Dimensions, View, Text, Keyboard, TouchableOpacity, DeviceEventEmitter} from 'react-native';
import { validatePrivateKey, accountKey } from '../../../utils';
import {strings} from '../../../locales/i18n';
import {accounts_add} from "../../../actions/accounts";
import {RightActionButton, InputMultiLines, alert_ok} from "../../common";
import defaultStyles from '../../styles';
import {mainBgColor} from '../../style_util';
import keyStore from 'react-native-makkii-core';

const {width, height} = Dimensions.get('window');

class ImportPrivateKey extends Component {

	static navigationOptions = ({navigation})=> {
		return ({
			title: strings('import_private_key.title'),
			headerRight: (
				<RightActionButton
					onPress={() => {
						navigation.state.params.ImportAccount();
					}}
					disabled={!navigation.state.params || !navigation.state.params.isEdited}
                    btnTitle={strings('import_button')}
				/>
			)
        });
	};

	setAccountName=(newName)=> {
	    console.log("set account name=>", newName);

		let acc = {};
		acc.address = this.getAcc.address;
		acc.private_key = this.getAcc.private_key;
		acc.balance = 0;
		acc.name = newName;
		acc.type = '[pk]';
		acc.transactions = {};
		acc.symbol = this.symbol;

		let key = accountKey(this.symbol, acc.address);
		if(this.props.accounts[key]!==undefined){
			AppToast.show(strings('import_private_key.already_existed',),{position:0})
		}else {
			this.props.navigation.state.params.dispatch(accounts_add({
				[key]: acc
			}, this.props.user.hashed_password));
			setTimeout(() => {
				DeviceEventEmitter.emit('updateAccountBalance');
			}, 500);

		}
	}

	ImportAccount= () => {
		Keyboard.dismiss();
	    if (validatePrivateKey(this.state.private_key, this.symbol)) {
	    	let coinType = keyStore.CoinType.fromCoinSymbol(this.symbol);
	    	console.log('coinType:' + coinType);
	        keyStore.recoverKeyPairByPrivateKey(this.state.private_key, coinType, false).then(address => {
                console.log("recover keypair from private key: ", address);
                this.getAcc = address;

                this.props.navigation.navigate('signed_vault_change_account_name', {
                	oldName: '',
					onUpdate: this.setAccountName,
					targetUri: 'signed_vault',
				});

			}, error=> {
    			console.log("error: " + error);
				alert_ok(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'));
			});
		} else {
	    	alert_ok(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'));
		}
	};

	constructor(props){
		super(props);

		this.symbol = this.props.navigation.getParam('symbol');
		this.state = {
			private_key: ''
		};
	}

	componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);

		const {dispatch} = this.props;
		this.props.navigation.setParams({
			ImportAccount: this.ImportAccount,
			dispatch: dispatch,
            isEdited: false
		});
	}

	render(){
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={()=> {Keyboard.dismiss()}}
				style={{
					flex: 1,
					width: width,
					height: height,
					alignItems: 'center',
				}}
			>
			<View style={{
			    flex: 1,
				padding: 40,
                backgroundColor: mainBgColor,
			}}>
                <Text style={{
                	marginBottom: 20,
                    fontSize: 16,
				}}>{strings('import_private_key.instruction_private_key')}</Text>

				<View style={{
				    ...defaultStyles.shadow,
					padding: 10,
					borderRadius: 5,
					backgroundColor: 'white',
					width: width - 80,
					marginBottom: 40,
				}}>
					<InputMultiLines
						editable={true}
						numberOfLines={10}
						style={{
							borderWidth: 0,
							fontSize: 18,
							fontWeight: 'normal',
							height: 250,
							textAlignVertical: 'top'
						}}
						value={this.state.private_key}
						onChangeText={val=>{
							this.setState({
								private_key: val
							});
							this.props.navigation.setParams({
								isEdited: val.length != 0
							});
						}}
					/>
				</View>
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
})(ImportPrivateKey);
