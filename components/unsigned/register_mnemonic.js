import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Clipboard } from 'react-native';
import { ComponentButton, InputMultiLines } from '../common.js';
import Toast from 'react-native-root-toast';
import {strings} from "../../locales/i18n";
import styles from '../styles.js';
  
class Mnemonic extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       title: strings('unsigned_register_mnemonic.title')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
		if(this.props.user.mnemonic !== ''){

		} 
	}
	render(){
		return (
			<View style={styles.container}>
				<View style={styles.marginBottom10}>
					<Text>{strings('unsigned_register_mnemonic.hint')}</Text>
				</View>
				<View style={styles.marginBottom10}>
					<InputMultiLines
						editable={false}
						value={this.props.user.mnemonic}
						style={styles.input_multi_lines} 
					/>
				</View>
				<View style={styles.marginBottom80}>
					<ComponentButton
						title={strings('unsigned_register_mnemonic.btn_copy')} 
						onPress={e=>{
							Clipboard.setString(this.props.user.mnemonic);
							Toast.show(strings('unsigned_register_mnemonic.toast_copy_mnemonic'));
						}}
					/>
				</View>
				<View>
					<ComponentButton
						title={strings('unsigned_register_mnemonic.btn_done')}
						onPress={e=>{   
							this.props.navigation.navigate('signed_vault');
						}}
					/>
				</View>
			</View>
		);
	}
}

export default connect(state=>{return {user: state.user};})(Mnemonic);