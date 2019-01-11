import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text } from 'react-native';

class Account extends Component {
	render(){
		return (
			<ScrollView style={{
				width: '100%',
				height: '100%',
				padding: 10
			}}>
				<Text>{this.props.toString()}</Text>
			</ScrollView>
		);
	}
}

export default connect()(Account);