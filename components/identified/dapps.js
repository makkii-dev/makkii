import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text } from 'react-native';

class Dapps extends Component {
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.dapps);
	}
	render(){
		return (
			<ScrollView style={{
				width: '100%',
				height: '90%',
				padding: 10,
				paddingBottom: '10%'
			}}>
				<Text>{JSON.stringify(this.props.dapps)}</Text>
			</ScrollView>
		);
	}
}

const mapStateToProps = function(state){
	return ({
		dapps: state.dapps
	});
}

export default connect(mapStateToProps)(Dapps);