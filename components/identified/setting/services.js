import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { Input } from '../../common.js';
import styles from '../../styles.js';

class Services extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : 'SERVICE CONFIGURATION',
	    };
    };
	constructor(props){
		super(props);
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'SERVICES',
		});
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={styles.container}>	
				<View style={styles.marginBottom10}>
					<Text style={styles.label}>Wallet Server</Text>
				</View>
				<View style={styles.marginBottom10}>
					<Input
						onClear={e => {

						}}
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Text style={styles.label}>Dapps Server</Text>
				</View>
				<View style={styles.marginBottom10}>
					<Input
						onClear={e => {

						}}
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Text style={styles.label}>Odex Server</Text>
				</View>
				<View style={styles.marginBottom40}>
					<Input
						onClear={e => {

						}}
					/>
				</View>
				<View>
					<Button 
						title="save"
						onPress={e => {
							console.log('on save');
						}}
					/>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Services);