import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, TouchableOpacity,Button } from 'react-native';
import { InputMultiLines } from '../common.js';
import langs from '../langs.js';
import styles from '../styles.js';

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: 'Recovery',
	       	headerStyle: styles.header_stack
	    };
    };
	constructor(props){
		super(props);
		this.state ={
			mnemonic: this.props.user.mnemonic,
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View style={styles.container}>
				<View style={styles.form}>
					<Button title="Scan" style={styles.button} onPress={()=>{
						this.props.navigation.navigate('RecoveryScan');
					}} />
				</View>
				<View style={styles.form}>
					<Text style={styles.label}>Enter 24 characters mnemonic</Text>
				</View>
				<View style={styles.form}>
					<InputMultiLines
						style={styles.input}
						value={this.props.user.mnemonic}
						onChangeText={(e)=>{
							this.setState({

							})
						}}
			        />
		        </View>
		        <View style={styles.form}>
			        <Button title="Confirm" style={styles._button} onPress={()=>{
						this.props.navigation.navigate('RecoveryPassword');
					}} />
				</View>
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Recovery);