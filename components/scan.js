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
		// setTimeout(()=>{
		// 	this.props.navigation.navigate('unsigned_register');
		// },3000);
	}
	render(){

		return (
	  		<View style={{wdith:'100%',height:'100%'}}>		
  				<RNCamera 
	  			    style={{
			            flex: 1, 
			            flexDirection: 'column',
    					justifyContent: 'center',
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
	  				<View style={{
	  					flex: 1,
						backgroundColor: 'rgba(0,0,0,0.8)',
						width: '100%',
  					}}></View>
  					<View style={{
  						height: 300,
  						flexDirection: 'row',
  						justifyContent: 'center', 
  					}}>
  						<View style={{
  							flex: 1,
  							backgroundColor: 'rgba(0,0,0,0.8)',
  						}}></View>
  						<View style={{
  							width: 300,
  							justifyContent: 'center', 
  							alignItems: 'center',
  							borderWidth: 2,
  							borderColor: 'rgba(255,255,255,0.9)'
   						}}>
   							{/*
  							<Image style={{
	  							width: 450,
	  							height: 450,
	  						}} source={require('../assets/qr_border.png')} />
	  						*/}
  						</View>
  						<View style={{
  							flex: 1,
  							backgroundColor: 'rgba(0,0,0,0.8)',
  						}}></View>
  					</View>
  					<View style={{
  						flex: 1,
  						width: '100%',
						backgroundColor: 'rgba(0,0,0,0.8)',
					}}></View>
	  			</RNCamera>	
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
		  				<Back />
	  				</TouchableOpacity>
  					<TouchableOpacity
	  					onPress={e=>{
	  						this.setState({
	  							torch: !this.state.torch
	  						});
	  					}}
		  				>	
		  				{
		  					this.state.torch ? <FlashOff /> : <FlashOn /> 
		  				}
  					</TouchableOpacity>
	  			</View>
	  			<View style={{
	  				position: 'absolute',
	  			}}></View>
        	</View>
		);
	}
}

const Back = ()=>{
	return (
		<Image 
			style={{
				width: 20,
				height: 20,
				marginTop: 14,
				marginLeft: 8,
			}} 
			source={require('../assets/arrow_back_white_32x32.png')} />
	);
}

const FlashOff = ()=>{
	return (
		<Image 
			style={{
				width: 25,
				height: 25,
				marginTop: 11,
				marginRight: 5,
			}} 
			source={require('../assets/flash_off_white_36x36.png')} />
	);
}

const FlashOn = ()=>{
	return (
		<Image 
			style={{
				width: 25,
				height: 25,
				marginTop: 11,
				marginRight: 5,
			}} 
			source={require('../assets/flash_on_white_36x36.png')} />
	);
}

export default connect(state => {
	return state;
})(Scan); 