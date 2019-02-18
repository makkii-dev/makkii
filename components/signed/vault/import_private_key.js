import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Alert, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, DeviceEventEmitter} from 'react-native';
import { validatePrivateKey } from '../../../utils';
import {strings} from '../../../locales/i18n';
import {AionAccount} from "../../../libs/aion-hd-wallet";

class ImportPrivateKey extends Component {

	static navigationOptions = ({navigation})=> {
		return ({
			title: strings('import_private_key.title'),
			headerStyle: {
				backgroundColor: '#eeeeee'
			},
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center', 
				flex: 1,
			},
			headerRight: (
				<TouchableOpacity onPress={() => {
					navigation.state.params.ImportAccount(navigation.state.params.hashed_password);
				}}>
					<View style={{marginRight: 20}}>
						<Text style={{color: 'blue'}}>{strings('import_button')}</Text>
					</View>
				</TouchableOpacity>
			) 
        });
	};

	ImportAccount= (hashed_password) => {
	    if (validatePrivateKey(this.state.private_key)) {
    		AionAccount.importAccount(this.state.private_key).then(address => {
				let acc = {};
				let account = {};
				account.address = address.address;
				account.private_key = this.state.private_key;
				account.name = strings('default_account_name');
				account.type = '[pk]';
				account.transactions = {};
				acc[account.address] = account;
				this.props.navigation.state.params.dispatch(accounts_add(acc, hashed_password));
				DeviceEventEmitter.emit('updateAccountBalance');
				this.props.navigation.navigate('signed_vault');
			}, error=> {
    			console.log("error: " + error);
				Alert.alert(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'));
			});
		} else {
	    	Alert.alert(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'))
		}
	};

	constructor(props){
		super(props);
		this.state = {
			private_key: ''
		};
	}
	componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(Object.keys(this.props.accounts).length); 
		const {dispatch} = this.props;	
		this.props.navigation.setParams({
			ImportAccount: this.ImportAccount,
			dispatch: dispatch,
			hashed_password: this.props.user.hashed_password,
		});
	}

	render(){
		return (
			<View style={{
				height: '100%',
				backgroundColor: '#ffffff',
				padding: 20,
			}}>	
                <Text style={styles.instruction}>{strings('import_private_key.instruction_private_key')}</Text>
				<View style={ styles.marginTop20 }>
					<TextInput
                        value={this.state.private_key}
						multiline = {true}
						numberOfLines = {5}
						textAlignVertical = 'top'
						onChangeText={ val => {
						    this.setState({
								private_key: val,
							});
						}}
						style = {{
							marginBottom: 20,
							borderColor: 'grey',
							borderRadius: 5,
							borderWidth: 1,
							padding: 10,
							backgroundColor: '#E9F8FF',
                            fontSize: 16
						}}
					/>
				</View>
			</View>
		)
	}
}

export default connect(state => { 
	return ({ 
		accounts: state.accounts, 
		user: state.user, 
	}); 
})(ImportPrivateKey);