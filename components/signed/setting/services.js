import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,Alert} from 'react-native';
import {Input} from '../../common.js';
import {setting} from '../../../actions/setting.js';
import {validateUrl} from '../../../utils.js';
import {strings} from "../../../locales/i18n";
import styles from '../../styles.js';
import Toast from 'react-native-root-toast';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';

class Services extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	        title: strings('service_configuration.title'),
	    };
    };

	constructor(props){
		super(props);
		console.log(props);
		this.state = {
			endpoint_wallet: props.setting.endpoint_wallet,
			endpoint_dapps: props.setting.endpoint_dapps,
			endpoint_odex: props.setting.endpoint_odex,
            explorer_server: props.setting.explorer_server,
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={styles.container}>	
				<View>
					<Text>{strings('service_configuration.endpoint_wallet')}</Text>
				</View>
				<View style={styles.marginBottom20}>
					<Input
						supportVisibility={false}
                        value={this.state.endpoint_wallet}
						onClear={e => {
							this.setState({
								endpoint_wallet:''
							});
						}}
						onChange={e => {
							this.setState({
								endpoint_wallet:e
							});
						}}
					/>
				</View>
				<View>
					<Text>{strings('service_configuration.endpoint_dapps')}</Text>
				</View>
				<View style={styles.marginBottom20}>
					<Input
						supportVisibility={false}
                        value={this.state.endpoint_dapps}
						onClear={e => {
							this.setState({
								endpoint_dapps: ''
							});
						}}
						onChange={e => {
							this.setState({
								endpoint_dapps: e
							});
						}}
					/>
				</View>
				<View>
					<Text>{strings('service_configuration.endpoint_odex')}</Text>
				</View>
				<View style={styles.marginBottom20}>
					<Input
						supportVisibility={false}
                        value={this.state.endpoint_odex}
						onClear={e => {
							this.setState({
								endpoint_odex: ''
							});
						}}
						onChange={e => {
							this.setState({
								endpoint_odex: e
							});
						}}
					/>
				</View>
				<View>
					<Text>{strings('service_configuration.explorer_server')}</Text>
				</View>
				<View style={styles.marginBottom40}>
					<RadioGroup
						selectedIndex={this.state.explorer_server == 'https://mainnet-api.aion.network'? 0: 1}
						onSelect={(index, value) => {
						this.setState({
							explorer_server: value,
						});
					} }>
						<RadioButton value={'https://mainnet-api.aion.network'}>
							<Text>Mainnet</Text>
						</RadioButton>
						<RadioButton value={'https://mastery-api.aion.network'}>
							<Text>Mastery</Text>
						</RadioButton>
					</RadioGroup>
				</View>
				<View>
					<Button 
						title={strings('save_button')}
						onPress={e => this.update() }
					/>
				</View>
			</View>
		)
	}

	update(){
		if (!validateUrl(this.state.endpoint_wallet)) {
			Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_wallet_server_url'));
			return;
		}

		if (!validateUrl(this.state.endpoint_dapps)) {
			Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_dapp_server_url'));
			return;
		}

		if (!validateUrl(this.state.endpoint_odex)) {
			Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_odex_server_url'));
			return;
		}

		// TODO: connectivity test
		const { dispatch } = this.props;
		let _setting = this.props.setting;
		_setting.endpoint_wallet = this.state.endpoint_wallet;
		_setting.endpoint_dapps = this.state.endpoint_dapps;
		_setting.endpoint_odex = this.state.endpoint_odex;
		_setting.explorer_server = this.state.explorer_server;
		dispatch(setting(_setting));

        Toast.show(strings('toast_update_success'), {
			onHidden: () => {
        		this.props.navigation.goBack();
			}
		});
	}

}

export default connect(state => { return ({ setting: state.setting }); })(Services);