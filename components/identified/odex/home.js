import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';

class Home extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		return (
			<View>	
				<Text>odex</Text>
				<Button 
					title="sell"
					onPress={e =>{
						this.props.navigation.navigate('OdexSell')
					}}
				/>
				<Button 
					title="buy"
					onPress={e =>{
						this.props.navigation.navigate('OdexBuy')
					}}
				/>
			</View>
		)
	}
}

export default connect(state => { return ({ }); })(Home);