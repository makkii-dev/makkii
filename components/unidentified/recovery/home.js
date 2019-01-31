import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, TouchableOpacity, Button } from 'react-native';
import { InputMultiLines } from '../../common.js';
import styles from '../../styles.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: navigation.getParam('title', ''),
	    }; 
    }
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
		this.props.navigation.setParams({
			title: 'Recovery/Home',
		});
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View style={styles.container}>
				<View style={styles.marginBottom20}>
					<Button 
						title="Scan"  
						onPress={e=>{
							this.props.navigation.navigate('RecoveryScan');
						}} 
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Text>Enter 24 characters mnemonic</Text>
				</View>
				<View style={styles.marginBottom20}>
					<InputMultiLines
						editable={true}
						style={styles.input_multi_lines} 
						value={this.props.user.mnemonic}
						onChangeText={e=>{
							this.setState({

							})
						}} 
			        />
		        </View>
		        <View>
			        <Button 
			        	title="Confirm" 
			        	onPress={e=>{
							this.props.navigation.navigate('RecoveryPassword');
						}} 
					/>
				</View>
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Home);