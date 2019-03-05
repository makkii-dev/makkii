import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Alert} from 'react-native';
import {dbGet} from '../../utils.js';
import {ComponentButton,InputMultiLines} from '../common.js';
import {validateMnemonic} from '../../libs/aion-hd-wallet/index.js';
import {strings} from "../../locales/i18n";
import styles from '../styles.js';
import {delete_accounts} from "../../actions/accounts"

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
					<ComponentButton 
						title= {strings("recovery.button_scan")}
						onPress={e=>{
							this.props.navigation.navigate('scan',{
								success:'unsigned_recovery',
								validate:function(data){
									let pass = validateMnemonic(data.data);
									return {
										pass: pass,
										err: pass ? '' : strings('toast_invalid_mnemonic')
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
		        <ComponentButton 
		        	title={strings("recovery.button_confirm")}
					onPress={e=>{
						validateMnemonic(this.state.mnemonic)&&dbGet('user').then(data=>{
		        			try{
			        			let user = JSON.parse(data);
			        			if(user.mnemonic === this.state.mnemonic){ 
			        				this.props.navigation.navigate('unsigned_recovery_password', {
			        					mnemonic: this.state.mnemonic
			        				});
			        			} else {
			        				Alert.alert(
			        					strings('alert_title_warning'),
										strings('recovery.warning_mnemonic_not_match'),
										[
											{text: strings('cancel_button'),onPress:()=>{}},
											{text: strings('alert_ok_button'),onPress:()=>{
													this.props.dispatch(delete_accounts(user.hashed_password))
													this.props.navigation.navigate('unsigned_recovery_password', {
														mnemonic: this.state.mnemonic
													});

												}},
											]
										)
			        			}
		        			} catch(e){
		        				alert(e);
		        			}
		        		},err=>{
		        			console.log('db.user is null');
							this.props.navigation.navigate('unsigned_recovery_password', {
								mnemonic: this.state.mnemonic
							});
		        		});
						validateMnemonic(this.state.mnemonic)||Alert.alert(strings('recovery.error_invalid_mnemonic'))
					}}
				/>
			</View>
		); 
	}
}

export default connect()(Home);