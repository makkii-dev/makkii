import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,TouchableOpacity,Button} from 'react-native';
import {dbGet} from '../../../utils.js';
import {user_signin} from '../../../actions/user.js';
import {InputMultiLines} from '../../common.js';
import styles from '../../styles.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: navigation.getParam('title', 'Recovery'),
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
		console.log(this.props.user);
		this.props.navigation.setParams({
			title: 'Recovery',
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
						value={this.state.mnemonic}
						onChangeText={e=>{
							this.setState({
								mnemonic: e
							});
						}} 
			        />
		        </View>
		        <View>
			        <Button 
			        	title="Confirm" 
			        	onPress={e=>{
			        		dbGet('user').then(data=>{
			        			if(data.mnemonic === this.state.mnemonic){ 
			        				dispatch(user_signin(data.hashed_password, data.mnemonic));
			        				this.props.navigation.navigate('unsigned_recovery_password');
			        			} else {
			        				alert('Mnemonic not matched');
			        			}
			        		},err=>{
			        			alert(e);
			        		});
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