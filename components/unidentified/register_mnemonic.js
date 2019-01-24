import React,{Component} from 'react';
import {connect} from 'react-redux';
import { View, Text, Button } from 'react-native';
import langs from '../langs.js';
import styles from '../styles.js';
import {generateMnemonic} from "../../libs/aion-hd-wallet";
import user from "../../reducers/user";

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
		const {dispatch}=this.props;
		console.log('[user] '+ JSON.stringify(this.props.user))
		if (this.props.user.hashed_mnemonic === "") {
			let mnemonic = generateMnemonic();
			console.log('[mnemonic] ' + mnemonic);
			this.props.user.hashed_mnemonic = mnemonic;
            dispatch(user(this.props.user))
		}
	}
	render(){
		return (
			<View style={styles.container}>
				<View style={styles.form}>
					<Text style={styles.label}>Your wallet mnemonic is, {this.props.user.hashed_mnemonic}</Text>
				</View>
				<View style={styles.form}>
					<Text style={styles.label}>please keep it safely</Text>
				</View>
				<View style={styles.form}>
					<Button
						title="COPY"
						onPress={()=>{
						}}
					/>
				</View>
				<View style={styles.form}>
					<Button
						title="QR"
						onPress={()=>{

						}}
					/>
				</View>
				<View style={styles.form}>
					<Button
						title="I'M DONE"
						onPress={()=>{
							this.props.navigation.navigate('Vault');
						}}
					/>
				</View>
			</View>
		);
	}
}

export default connect(state => {return {user: state.user};})(RegisterMnemonic);