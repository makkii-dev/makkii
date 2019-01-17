import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import { Logo, Button } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';

class About extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={styles.container}>		
				<View style={{
					flex:1,
					justifyContent:'center',
					alignItems: 'center',
					marginTop: 80,
					marginBottom: 40,
				}}>
					<Logo />
				</View>
				<View style={ styles.center }>
					<Text>Version: {  }</Text>
				</View>
				<View style={ styles.center }>
					<Text>{ constants.BRAND }</Text>
				</View>
				<View style={styles.form}>
					<Button 
						text="Check New Version"
					/>
				</View>
				<View style={ styles.center }>
					<Text>license</Text>
				</View>
				<View style={ styles.center }>
					<Text>copyright</Text>
				</View>
			</View>
		);
	}
}

export default connect(state => { console.log(state); return ({ setting: state.setting }); })(About);