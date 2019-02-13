import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,Alert} from 'react-native';
import {Input} from '../../common.js';
import {setting} from '../../../actions/setting.js';
import {validateUrl} from '../../../utils.js';
import {strings} from "../../../locales/i18n";
import Toast from '../../toast.js';
import styles from '../../styles.js';

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
				<View style={styles.marginBottom40}>
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
					<Button 
						title={strings('save_button')}
						onPress={e => this.update() }
					/>
				</View>
				<Toast
					ref={"toast"}
					duration={Toast.Duration.short}
					onDismiss={() => this.props.navigation.goBack()}
				/>
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
			Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_dapp_server_url'));
			return;
		}

		// TODO: connectivity test
		const { dispatch } = this.props;
		let _setting = this.props.setting;
		_setting.endpoint_wallet = this.state.endpoint_wallet;
		_setting.endpoint_dapps = this.state.endpoint_dapps;
		_setting.endpoint_odex = this.state.endpoint_odex;
		dispatch(setting(_setting));
		this.refs.toast.show(strings('toast_update_success'));
	}

}

export default connect(state => { return ({ setting: state.setting }); })(Services);