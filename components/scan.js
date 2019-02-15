import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Toast from './toast.js';

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
		this.state = {
			toast: Date.now()
		}
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
	  						let res = this.props.navigation.state.params['validate'](e);
	  						if (res.pass) {
	  							this.props.navigation.navigate(this.props.navigation.state.params['success'], { scanned: e.data });
	  						} else {
	  							// slow toast log 
	  							let now = Date.now();
	  							if(now - this.state.toast > 1000){
	  								this.refs.toast.show(res.err);
	  								this.setState({
	  									toast: now
	  								})
	  							}
	  						}
	  					} else {
	  						this.props.navigation.goBack();
	  					}
	  				}}
	  			/> 
	  			<Toast ref={"toast"}
				   duration={Toast.Duration.short}
				   onDismiss={() => this.props.navigation.goBack()}
				   />
        	</View>	
		);
	}
}

export default connect(state => {
	return state;
})(Scan); 