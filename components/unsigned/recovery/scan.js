import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { user_register } from '../../../actions/user.js';

class RecoveryScan extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
	}
	render(){
		const { dispatch } = this.props;
		return (
			<TouchableOpacity 
				style={{wdith:'100%',height:'100%'}}
				onPress={(e)=>{
        			console.log(this.props.navigation.actions.goBack())
        		}}
		  	>
		  		<View style={{wdith:'100%',height:'100%'}}
		  			onPress={(e)=>{
	        			console.log()
	        		}}
		  		>
		  			<RNCamera 
		  			    style={{
				            flex: 1,
				        }} 
		  				captureAudio={false}
		  				onBarCodeRead={e=>{
		  					dispatch(user_register(
		  						'',
		        				e.data
		        			));
		        			setTimeout(()=>{
		        				this.props.navigation.navigate('unsigned_recovery');
		        			}, 100)
		        				
		  				}}
		  			/> 
	        	</View>
        	</TouchableOpacity>	
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(RecoveryScan);