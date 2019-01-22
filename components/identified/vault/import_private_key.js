import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

class ImportPrivateKey extends Component {
	constructor(props){
		super(props);
		this.state = {
			private_key: ''
		};
	}
	import(){
    	console.log(this.state.private_key);
    }
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(Object.keys(this.props.accounts).length);
	}
	render(){
		return (
			<View style={{
				height: '100%',
				backgroundColor: '#ffffff',
				padding: 20,
			}}>	
				<View
					style={{
						marginBottom: 20,
					}}
				>
					<Button
						style={{
							marginBottom: 20,
						}}
						title="SCAN PRIVATE KEY"
						onPress={e => {

						}}
					/>
				</View>
				<View
					style={{
						marginBottom: 20,
					}}
				>
					<Text 
						style={{
							textAlign: 'center',
							color: 'grey',
						}}
					> 
						───────   or   ───────
					</Text>
				</View>
				<View>
					<Text
						style={{
							marginBottom: 10,
							textAlign: 'center',
							color: 'grey',
						}}
					>
						Enter private key
					</Text>
				</View>
				<View
					style={{
						marginBottom: 20,
					}}
				>
					<TextInput 
						multiline = {true}
						numberOfLines = {4}
						textAlignVertical = 'top'
						style = {{
							marginBottom: 20,
							borderColor: 'grey',
							borderRadius: 5,
							borderWidth: 1,
							padding: 10,
							backgroundColor: '#E9F8FF',
						}}
					/>
				</View>
				<View>
					<Button
						title="IMPORT"
						onPress={e => {

						}}
					/>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(ImportPrivateKey);

const styles = StyleSheet.create({

});