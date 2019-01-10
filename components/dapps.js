import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text } from 'react-native';

class Dapps extends Component {
	render(){
		return (
			<Text style={{marginTop:50}}>{JSON.stringify(this.props.dapps)}</Text>
		);
	}
}

const mapStateToProps = function(state){
	return ({
		dapps: state.dapps
	});
}

export default connect(mapStateToProps)(Dapps);