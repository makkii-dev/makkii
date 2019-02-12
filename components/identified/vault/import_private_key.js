import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { validatePrivateKey } from '../../../utils';
import {add_accounts} from "../../../actions/accounts";
import {AionAccount} from "../../../libs/aion-hd-wallet";
import {DEFAULT_ACCOUNT_NAME} from '../../constants.js';

class ImportPrivateKey extends Component {

	static navigationOptions = ({navigation})=> {
		return ({
			title: 'Private Key',
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
					navigation.state.params.ImportAccount();
				}}>
					<View style={{marginRight: 20}}>
						<Text style={{color: 'blue'}}>IMPORT</Text>
					</View>
				</TouchableOpacity>
			)
        });
	};

	ImportAccount= () => {
	    if (validatePrivateKey(this.state.private_key)) {
    		AionAccount.importAccount(this.state.private_key).then(address => {
				let acc = {};
				let account = {};
				account.address = address.address;
				account.private_key = this.state.private_key;
				account.name = DEFAULT_ACCOUNT_NAME;
				account.type = '[pk]';
				account.transactions = {};
				acc[account.address] = account;
				console.log('add account:');
				console.log(acc);

				this.props.navigation.state.params.dispatch(add_accounts(acc));
				this.props.navigation.navigate('VaultHome');
			}, error=> {
    			console.log("error: " + error);
				Alert.alert('Error', 'Invalid private key');
			});
		} else {
	    	Alert.alert('Error', 'Invalid private key.')
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
		});
	}

	render(){
		return (
			<View style={{
				height: '100%',
				backgroundColor: '#ffffff',
				padding: 20,
			}}>	
                <Text style={styles.instruction}>Enter private key</Text>
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

export default connect(state => { return ({ accounts: state.accounts, user: state.user, }); })(ImportPrivateKey);
