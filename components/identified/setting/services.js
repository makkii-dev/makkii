import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, Alert } from 'react-native';
import { Input } from '../../common.js';
import styles from '../../styles.js';
import { setting } from '../../../actions/setting.js';
import Toast from '../../toast.js';
import { validateUrl } from '../../../utils.js';

class Services extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: 'Service Configuration',
			headerStyle: {
				backgroundColor: '#eeeeee'
			},
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				flex: 1
			},
			headerRight: (<View></View>),
	    };
    };

	constructor(props){
		super(props);
		this.state = {
			kernel_server: this.props.setting.advance.remote_kernel,
			dapps_server: this.props.setting.advance.remote_dapps,
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
					<Text style={styles.title_label}>Wallet Server</Text>
				</View>
				<View style={styles.marginBottom20}>
					<Input
                        value={this.state.kernel_server}
						supportVisibility={false}
						onClear={e => {

						}}
						onChange={e => {
							this.setState({
								kernel_server: e,
							})
						}}
					/>
				</View>
				<View>
					<Text style={styles.title_label}>DApps Server</Text>
				</View>
				<View style={styles.marginBottom40}>
					<Input
						value={this.state.dapps_server}
						supportVisibility={false}
						onClear={e => {

						}}
						onChange={e => {
							this.setState({
								dapps_server: e,
							})
						}}
					/>
				</View>
				<View>
					<Button 
						title="Save"
						onPress={ () => this.saveConfigurations() }
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

	saveConfigurations=() => {
		if (!validateUrl(this.state.kernel_server)) {
			Alert.alert('Error', 'Wallet server url is invalid');
			return;
		}

		if (!validateUrl(this.state.dapps_server)) {
			Alert.alert('Error', 'DApps server url is invalid');
			return;
		}

		// TODO: connectivity test

		const { dispatch } = this.props;
		let newSettings = this.props.setting;
		newSettings.advance.remote_kernel = this.state.kernel_server;
		newSettings.advance.remote_dapps = this.state.dapps_server;
		dispatch(setting(newSettings));

		console.log("update service configuration successfully.");
		this.refs.toast.show("Update configuration successfully");
	}

}

export default connect(state => { return ({ setting: state.setting }); })(Services);