import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput } from 'react-native';

class Setting extends Component {
	render(){
		return (
			<View>
				<Text style={{marginTop:50}}>
					{JSON.stringify(this.props.setting)}
				</Text>
				<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.remote_kernel}
		      	/>
		      	<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.remote_dapps}
		      	/>
		      	<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.remote_odex}
		      	/>
		      	<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.tx_fee + ''}
		      	/>
			</View>
		);
	}
}

const mapStateToProps = function(state){
	return ({
		setting: state.setting
	});
}

export default connect(mapStateToProps)(Setting);