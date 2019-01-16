import React,{Component} from 'react';
import {connect} from 'react-redux';
import {Button} from '../common.js';
import {ScrollView,View,Text,TextInput} from 'react-native';

class Setting extends Component {
	constructor(props){
		super(props)
	}
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		console.log(this.props.setting);
		let self = this;
		return (
			<ScrollView style={{
				width: '100%',
				height: '100%',
				padding: 10
			}}>
				<Text>
					{JSON.stringify(this.props.setting.keys)}
				</Text>
				<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.advance.tx_fee + ''}
		      	/>
				<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.advance.remote_kernel}
		      	/>
		      	<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.advance.remote_dapps}
		      	/>
		      	<TextInput
			        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
			        onChangeText={(text) => this.setState({text})}
			        value={this.props.setting.advance.remote_odex}
		      	/>
		      	<Button 
					text="Sign out" 
					onPress={()=>{
						this.props.navigation.navigate('Login')
					}}
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