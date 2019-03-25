import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Dimensions, View, Text, Keyboard, TouchableOpacity, DeviceEventEmitter} from 'react-native';
import { validatePrivateKey } from '../../../utils';
import {strings} from '../../../locales/i18n';
import {AionAccount} from "../../../libs/aion-hd-wallet";
import {accounts_add} from "../../../actions/accounts";
import {RightActionButton, InputMultiLines, alert_ok} from "../../common";
import defaultStyles from '../../styles';
import {mainBgColor} from '../../style_util';

const {width, height} = Dimensions.get('window');

class ImportPrivateKey extends Component {

	static navigationOptions = ({navigation})=> {
		return ({
			title: strings('import_private_key.title'),
			headerRight: (
				<RightActionButton
					onPress={() => {
						navigation.state.params.ImportAccount(navigation.state.params.hashed_password);
					}}
					disabled={!navigation.state.params || !navigation.state.params.isEdited}
                    btnTitle={strings('import_button')}
				/>
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
				account.name = this.props.setting.default_account_name;
				account.type = '[pk]';
				account.transactions = {'mainnet':{}, 'mastery':{}};
				acc[account.address] = account;
				this.props.navigation.state.params.dispatch(accounts_add(acc, hashed_password));
				setTimeout(() => {
					DeviceEventEmitter.emit('updateAccountBalance');
				}, 500);
				// this.props.navigation.navigate('signed_vault');
                this.props.navigation.goBack();
			}, error=> {
    			console.log("error: " + error);
				alert_ok(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'));
			});
		} else {
	    	alert_ok(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'))
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
						numberOfLines={8}
						style={{
							borderWidth: 0,
							fontSize: 18,
							fontWeight: 'normal',
							height: 200,
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
