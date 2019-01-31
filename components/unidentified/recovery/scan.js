import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity } from 'react-native';
//import { Camera, Permissions } from 'expo';
import { user } from '../../../actions/user.js';

class RecoveryScan extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
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
		  	{/*
				<Camera type={Camera.Constants.Type.back}
	        	    style={{
	        	    	flex: 1,
					    justifyContent: 'flex-end',
					    alignItems: 'center',
	        	    }}
	        		onBarCodeScanned={(e)=>{
	        			// { data: "http://en.m.wikipedia.org",target:15,type:256 }
	        			console.log('[onBarCodeScanned] ' + JSON.stringify(e));
	        			dispatch(user({
	        				mnemonic: e.data
	        			}));
	        			this.props.navigation.navigate('Recovery');	
	        		}}
	        	>
	        	</Camera>*/}
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