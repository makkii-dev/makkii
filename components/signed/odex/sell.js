import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';

class Sell extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		return (
			<View>	
				<Text>odex sell</Text>
			</View>
		)
	}
}

export default connect(state => { return ({ }); })(Sell);