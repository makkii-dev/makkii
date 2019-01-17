import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import { Logo, Button } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';

class Password extends Component {
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

			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Password);
