import React,{ Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { Password } from '../../common.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: navigation.getParam('otherParam', 'Register'),
	       	headerStyle: styles.stack_header,
	       	headerTitleStyle: styles.stack_header_title,
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
			<View>
				<View style={ styles.form }>
					<Text style={styles.label}>Enter password</Text>
					<Password 
						onChange={e=>{

						}}
					/>
				</View>
				<View style={ styles.form }>
					<Text style={styles.label}>Confirm password</Text>
					<Password 
						onChange={e=>{

						}}
					/>
				</View>
				<View style={ styles.form }>
					<Button
						title="Register"
						onPress={()=>{
							this.props.navigation.navigate('RegisterMnemonic');
						}}
					/>
				</View>
			</View>
		);
	}
}

export default connect(state=>{return {user: state.user};})(Home);