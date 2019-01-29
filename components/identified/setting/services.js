import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { Input } from '../../common.js';
import styles from '../../styles.js';

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
			kernel_server: this.props.setting.remote_kernel,
			dapps_server: this.props.setting.remote_dapps,
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
						onClear={e => {

						}}
					/>
				</View>
				<View>
					<Text style={styles.title_label}>DApps Server</Text>
				</View>
				<View style={styles.marginBottom40}>
					<Input
						value={this.state.dapps_server}
						onClear={e => {

						}}
					/>
				</View>
				<View>
					<Button 
						title="Save"
						onPress={ () => this.saveConfigurations() }
					/>
				</View>
			</View>
		)
	}

	saveConfigurations=() => {
		// const { dispatch } = this.props;
		// let newSettings = this.props.setting;
		// newSettings.remote_kernel = this.state.kernel_server;
		// newSettings.remote_dapps = tihs.state.dapps_server;
	}

}

export default connect(state => { return ({ setting: state.setting }); })(Services);