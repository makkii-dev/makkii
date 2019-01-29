import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimensions, View, Button, StyleSheet } from 'react-native';
import styles from '../../styles.js';
import AionCell from '../../cell.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : 'Settings',
			headerStyle: {
				backgroundColor: '#eeeeee'
			},
			headerTitleStyle: {
	        	alignSelf: 'center',
				textAlign: 'center',
				flex: 1
			},
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'Settings',
		});
	}
	render(){
		return (
			<View style={{
				backgroundColor: '#eeeeee',
				height: Dimensions.get('window').height,
				paddingTop: 10
			}}>
				<View>
				<AionCell
					title='Password'
					onClick={() => {
						this.props.navigation.navigate('SettingUpdatePassword');	
					}}
				/>
				<AionCell
					title='Recovery Info'
				/>
				<AionCell
					title='Service Configuration'
					onClick={() => {
						this.props.navigation.navigate('SettingServices');
					}}
				/>				
				<AionCell
					title='About'
				/>
				</View>
				<View style={{
					marginTop: 10
				}
				}>
				<AionCell title='Sign Out' />
				</View>

				{/*<View style={styles.marginBottom10}>*/}
					{/*<Button */}
						{/*title="Update Password" */}
						{/*onPress={e => {*/}
							{/*this.props.navigation.navigate('SettingUpdatePassword');*/}
						{/*}}*/}
					{/*/>*/}
				{/*</View>*/}
				{/*<View style={styles.marginBottom10}>*/}
					{/*<Button */}
						{/*title="About" */}
						{/*onPress={e => {*/}
							{/*this.props.navigation.navigate('SettingAbout');*/}
						{/*}}*/}
					{/*/>*/}
				{/*</View>*/}
				{/*<View style={styles.marginBottom10}>*/}
					{/*<Button */}
						{/*title="Display Recovery Info" */}
						{/*onPress={e => {*/}
							{/*this.props.navigation.navigate('SettingRecovery');*/}
						{/*}}*/}
					{/*/>*/}
				{/*</View>*/}
				{/*<View style={styles.marginBottom40}>*/}
					{/*<Button */}
						{/*title="Service Configuration" */}
						{/*onPress={e => {*/}
							{/*this.props.navigation.navigate('SettingConfig');*/}
						{/*}}*/}
					{/*/>*/}
				{/*</View>*/}
				{/*<View>*/}
					{/*<Button */}
						{/*title="Sign Out" */}
						{/*onPress={e => {*/}
							{/*this.props.navigation.navigate('Unidentified');*/}
						{/*}}*/}
					{/*/>*/}
				{/*</View>*/}
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Home);