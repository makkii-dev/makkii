import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import langs from '../langs.js';
import style from '../style.js';
import Icon from 'react-native-vector-icons/AntDesign';
import {Button} from '../common.js';

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: 'Recovery',
	       	headerStyle: style.header_stack
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View style={style.container}>
				<View style={style.label}>
					<Icon type="scan" size={30} />
					<Button text="Scan" style={style.button} onPress={()=>{
						this.props.navigation.navigate('RecoveryScan');
					}} />
				</View>
				<Text style={style.label}>Enter 24 characters mnemonic</Text>
				<TextInput
					style={style.input}
					value={this.props.user.mnemonic}
			    	multiline = {true}   
			    	editable = {true} 
			        numberOfLines = {4}
		        />
		        <Button text="Confirm" style={style.button} onPress={()=>{
					this.props.navigation.navigate('RecoveryPassword');
				}} />		        
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Recovery);