import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,TouchableOpacity} from 'react-native';
import {Button} from '../common.js';
import langs from '../langs.js';
import style from '../style.js';

class RegisterMnemonic extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       title: navigation.getParam('otherParam', 'Mnemonic'),
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		return (
			<View style={style.container}>
				<Text>Your wallet mnemonic is,</Text>
				<Text>please keep it safely</Text>
				<Button 
					text="COPY" 
					onPress={()=>{
					}}
				/>
				<Button 
					text="QR" 
					onPress={()=>{

					}}
				/>
				<Button 
					text="I'M DONE"  
					onPress={()=>{
						this.props.navigation.navigate('Vault');
					}}
				/>
			</View>
		);
	}
}

export default connect(state => {
	return {user: state.user};
})(RegisterMnemonic);