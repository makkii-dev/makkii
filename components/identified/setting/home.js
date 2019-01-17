import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { Button } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';

class Home extends Component {
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
				<View style={ styles.center }>
					<Button text="Update Password" />
				</View>
				<View style={ styles.center }>
					<Button text="About" />
				</View>
				<View style={ styles.center }>
					<Button text="Recovery Info" />
				</View>
				<View style={ styles.center }>
					<Button text="Config" />
				</View>
				<View style={ styles.center }>
					<Button text="Sign Out" />
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Home);