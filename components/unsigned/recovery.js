import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button} from 'react-native';
import {dbGet} from '../../utils.js';
import {InputMultiLines} from '../common.js';
import {validateMnemonic} from '../../libs/aion-hd-wallet/index.js';
import styles from '../styles.js';
import {strings} from "../../locales/i18n";

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: strings("recovery.title"),
	    }; 
    }
	constructor(props){
		super(props);   
		this.state = { 
			mnemonic: ''
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	} 
	async componentWillReceiveProps(props){   
		this.setState({
			mnemonic: props.navigation.getParam('scanned', '')  
		});
	}
	render(){	
		return (
			<View style={styles.container}> 
				<View style={styles.marginBottom20}>
					<Button 
						title= {strings("recovery.button_scan")}
						onPress={e=>{
							this.props.navigation.navigate('scan',{
								success:'unsigned_recovery',
								validate:function(data){
									let pass = validateMnemonic(data.data);
									return {
										pass: pass,
										err: pass ? '' : 'Invalid mnemonic'
									};  
								}
							}); 
						}} 
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Text>{strings("recovery.label_prompt")}</Text>
				</View>
				<View style={styles.marginBottom20}>
					<InputMultiLines
						editable={true}
						style={styles.input_multi_lines} 
						value={this.state.mnemonic} 
						onChangeText={e=>{
							this.setState({
								mnemonic: e
							});
						}} 
			        />
		        </View>
		        <Button  
		        	title={strings("recovery.button_confirm")}
					onPress={e=>{
		        		dbGet('user').then(data=>{
		        			if(data.mnemonic === this.state.mnemonic){ 
		        				this.props.navigation.navigate('unsigned_recovery_password', {
		        					mnemonic: this.state.mnemonic
		        				});
		        			} else {
		        				alert('Mnemonic not matched');
		        			}
		        		},err=>{
		        			console.log('db.user is null');
		        			this.props.navigation.navigate('unsigned_register');
		        		});
					}} 
				/>
			</View>
		); 
	}
}

export default connect()(Home);