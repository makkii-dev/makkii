import React, { Component } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { connect } from 'react-redux';
import { strings } from '../../../locales/i18n';

class VaultSendScan extends Component {
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
		  			<RNCamera
						ref={ref => {
							this.camera = ref;
						}}
		  			    style={{
				            flex: 1,
				        }} 
		  				captureAudio={false}
		  				onBarCodeRead={e=>{
							this.camera.pausePreview();
		        			setTimeout(()=>{
		        			    if (this.props.navigation.state.params.onScanResult(e.data)) {
									this.props.navigation.goBack();
								} else {
		        			    	Alert.alert(strings('alert_title_error'),
										strings('send.error_invalid_qrcode'),
										[
											{text: strings('alert_ok_button'), onPress: () => { this.camera.resumePreview() }}
										],
										{cancelable: false});
								}
		        			}, 100)
		        				
		  				}}
		  			/> 
	        	</View>
        	</TouchableOpacity>	
		);
	}
}

export default connect(state => {
	return state;
})(VaultSendScan);
