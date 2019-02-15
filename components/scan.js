import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { RNCamera } from 'react-native-camera';

/*
    require from parent: 
    	navigation.state.params['validate'] 
    	navigation.state.params['success'] 
    return to child:
        navigation.state.params['scanned']
 */
class Scan extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){ 
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){

		return (
	  		<View style={{wdith:'100%',height:'100%'}}>	  			
	  			<RNCamera 
	  			    style={{
			            flex: 1,
			        }} 
	  				captureAudio={false} 
	  				onBarCodeRead={e=>{
	  					if(this.props.navigation.state.params['validate'] && this.props.navigation.state.params['success']){
	  						if(this.props.navigation.state.params['validate'](e)){
	  							this.props.navigation.navigate(this.props.navigation.state.params['success'], { scanned: e.data });
	  						}  
	  					} else {
	  						this.props.navigation.goBack();
	  					}
	  				}}
	  			/> 
        	</View>	
		);
	}
}

export default connect(state => {
	return state;
})(Scan); 