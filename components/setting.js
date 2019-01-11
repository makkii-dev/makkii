import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, Text, TextInput } from 'react-native';

class Setting extends Component {
	render(){
		return (
			<ScrollView style={{
				width: '100%',
				height: '100%',
				padding: 10
			}}>
				<Text>
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
		      	<Text>
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
		      	<Text>
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
			</ScrollView>
		);
	}
}

const mapStateToProps = function(state){
	return ({
		setting: state.setting
	});
}

export default connect(mapStateToProps)(Setting);