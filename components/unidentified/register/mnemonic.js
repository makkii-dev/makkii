import React,{Component} from 'react';
import {connect} from 'react-redux';
import { View, Text, Button } from 'react-native';
import styles from '../../styles.js';
 
class Mnemonic extends Component {
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

export default connect(state=>{return {user: state.user};})(Mnemonic);