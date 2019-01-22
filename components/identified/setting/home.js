import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Button, StyleSheet } from 'react-native';
import styles from '../../styles.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : 'SETTINGS',
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'SETTINGS',
		});
	}
	render(){
		return (
			<View style={{
				paddingTop: 40,
				paddingLeft: 20,
				paddingRight: 20,
			}}>	
				<View style={styles.marginBottom10}>
					<Button 
						title="Update Password" 
						onPress={e => {
							this.props.navigation.navigate('SettingUpdatePassword');
						}}
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Button 
						title="About" 
						onPress={e => {
							this.props.navigation.navigate('SettingAbout');
						}}
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Button 
						title="Display Recovery Info" 
						onPress={e => {
							this.props.navigation.navigate('SettingRecovery');
						}}
					/>
				</View>
				<View style={styles.marginBottom40}>
					<Button 
						title="Service Configuration" 
						onPress={e => {
							this.props.navigation.navigate('SettingConfig');
						}}
					/>
				</View>
				<View>
					<Button 
						title="Sign Out" 
						onPress={e => {
							this.props.navigation.navigate('Unidentified');
						}}
					/>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Home);