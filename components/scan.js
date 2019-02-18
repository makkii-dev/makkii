import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Image,Text,TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Toast from 'react-native-root-toast';

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
			toast: Date.now(),
			torch: false,
		}
	}
	async componentDidMount(){ 
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){

		return (
	  		<View style={{wdith:'100%',height:'100%'}}>		
	  			<View style={{
	  				backgroundColor:'black',
	  				width: '100%',
	  				height: '100%'
	  			}}>  
	  				<RNCamera 
		  			    style={{
				            flex: 1, 
				        }} 
				       	flashMode={this.state.torch ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
		  				captureAudio={false}  
		  				onBarCodeRead={e=>{
		  					if(
		  						this.props.navigation.state.params &&
		  						this.props.navigation.state.params['validate'] && 
		  						this.props.navigation.state.params['success']
	  						){
		  						let res = this.props.navigation.state.params['validate'](e);
		  						if (res.pass) {
		  							this.props.navigation.navigate(this.props.navigation.state.params['success'], { scanned: e.data });
		  						} else {
		  							// slow down toast log 
		  							let now = Date.now();
		  							if(now - this.state.toast > 1000){
		  								Toast.show(res.err);
		  								this.setState({
		  									toast: now
		  								})
		  							}
		  						}
		  					} else {
		  						this.props.navigation.goBack();
		  					}
		  				}}
		  			>
		  			</RNCamera>
	  			</View> 	
	  			<View style={{
	  				position: 'absolute',
	  				backgroundColor:'transparent',
	  				left: 0,
	  				top: 0,
	  				width: '100%',
	  				height: 50,	
	  				flex: 1,
	  				flexDirection: 'row',
	  				justifyContent: 'space-between',
	  				alignItems: 'stretch',
	  			}}>
	  				<TouchableOpacity
	  					onPress={e=>{
	  						this.props.navigation.goBack();
	  					}}
	  				>	
		  				<Image 
	  						style={{
	  							width: 20,
	  							height: 20,
	  							marginTop: 14,
	  							marginLeft: 8,
	  						}} 
	  						source={require('../assets/arrow_back_white_32x32.png')} />
	  				</TouchableOpacity>
  					<TouchableOpacity
	  					onPress={e=>{
	  						this.setState({
	  							torch: !this.state.torch
	  						});
	  					}}
		  				>	
		  				{
		  					this.state.torch ? 
		  					<Image 
		  						style={{
		  							width: 25,
		  							height: 25,
		  							marginTop: 10,
		  							marginRight: 5,
		  						}} 
		  						source={require('../assets/flash_off_white_36x36.png')} /> : 
		  					<Image 
		  						style={{
		  							width: 25,
		  							height: 25,
		  							marginTop: 10,
		  							marginRight: 5,
		  						}} 
		  						source={require('../assets/flash_on_white_36x36.png')} />
		  				}
  					</TouchableOpacity>
	  			</View>
        	</View>
		);
	}
}

export default connect(state => {
	return state;
})(Scan); 