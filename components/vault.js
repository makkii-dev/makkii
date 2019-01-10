import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text } from 'react-native';

class Vault extends Component {
	constructor(props){
		super(props);
	}
	render(){
		return (
			<Text style={{marginTop:50}}>{JSON.stringify(this.props.accounts)}</Text>
		);
	}
}

const mapStateToProps = function(state){
	return ({
		accounts: state.accounts
	});
}

export default connect(mapStateToProps)(Vault);