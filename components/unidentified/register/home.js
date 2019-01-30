import React,{ Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { ComponentPassword } from '../../common.js';
import styles from '../../styles.js';
import { validatePassword, hashPassword } from '../../../utils.js';
import { user_register } from '../../../actions/user.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: navigation.getParam('title', ''),
	    }; 
    };
	constructor(props){ 
		super(props);
		this.state = {
			password: '',
			password_confirm: '',
		};
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		this.props.navigation.setParams({
			title: 'Register',
		});
		console.log(hashPassword.toString());
	}
	async componentWillUnmount(){
		this.state({
			password: '',
			password_confirm: '',
		})
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View style={styles.container}>
				<View>
					<Text style={styles.label}>Enter password</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword 
						value={this.state.password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<View>
					<Text>Confirm password</Text>
				</View>
				<View style={styles.marginBottom20}>
					<ComponentPassword
						value={this.state.password_confirm} 
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
					/>
				</View>
				<View>
					<Button
						title="Register"
						onPress={e=>{
							if (!validatePassword(this.state.password))
								alert("Invalid password!");
							else if (!validatePassword(this.state.password_confirm))
								alert('Invalid confirm password!');
							else if (this.state.password !== this.state.password_confirm)
								alert('Confirm password does not match password!') 
							else {
								dispatch(user_register(hashPassword(this.state.password)));
								this.props.navigation.navigate('RegisterMnemonic');
							}
						}}
					/>
				</View>
			</View>
		);
	}
}

export default connect(state=>{return {user: state.user};})(Home);