import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';

class Password extends Component {
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		console.log(this.props.user);
		return (
			<View>
				<Text>Input Password {JSON.stringify(this.props)}</Text>

			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Password);