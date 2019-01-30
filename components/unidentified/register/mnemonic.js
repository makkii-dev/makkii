import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, Clipboard } from 'react-native';
import { InputMultiLines } from '../../common.js';
import styles from '../../styles.js';
 
class Mnemonic extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       title: navigation.getParam('title', ''),
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
		this.props.navigation.setParams({
			title: 'Mnemonic',
		});
	}
	render(){
		return (
			<View style={styles.container}>
				<View style={styles.marginBottom10}>
					<Text>Please keep your mnemonic safely !</Text>
				</View>
				<View style={styles.marginBottom10}>
					<InputMultiLines
						editable={false}
						value={this.props.user.mnemonic}
						style={styles.input_multi_lines} 
					/>
				</View>
				<View style={styles.marginBottom80}>
					<Button
						title="COPY" 
						onPress={e=>{
							Clipboard.setString(this.props.user.mnemonic);
						}}
					/>
				</View>
				<View>
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

export default connect(state=>{return {user: state.user};})(Mnemonic);