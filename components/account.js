import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text } from 'react-native';

class Account extends Component {
	render(){
		return (
			<Text>{this.props.toString()}</Text>
		);
	}
}

export default connect()(Account);