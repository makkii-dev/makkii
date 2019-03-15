import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Image,TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Toast from 'react-native-root-toast';
import {strings} from "../locales/i18n";

class Scan extends Component {
    static navigationOptions = ({navigation}) => {
    	return {
    		title: strings('scan.title'),
            headerRight: (
                <TouchableOpacity
                    onPress={()=>{
                        navigation.state.params.switchFlash()
                    }}
                    style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {navigation.state.params.torch ?
                        <Image source={require('../assets/flash_off.png')} style={{
                            tintColor: 'white',
                            width: 20,
                            height: 20,
                        }}/> :
                        <Image source={require('../assets/flash_on.png')} style={{
                            tintColor: 'white',
                            width: 20,
                            height: 20,
                        }}/>
                    }

                </TouchableOpacity>
			)
		};
	}

	constructor(props){
		super(props);
		this.state = {
			toast: Date.now(), 
			torch: false,
		}
	}

	componentWillMount() {
        this.props.navigation.setParams({
            switchFlash: this.switchFlash,
            torch: false
        });
	}

	switchFlash=() => {
        let currentTorch = this.state.torch;
		this.setState({
			torch: !currentTorch,
		});
		this.props.navigation.setParams({
			torch: !currentTorch,
		})
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
  						height: 250,
  						flexDirection: 'row',
  						justifyContent: 'center', 
  					}}>
  						<View style={{
  							flex: 1,
  							backgroundColor: 'rgba(0,0,0,0.8)',
  						}}></View>
  						<View style={{
  							width: 250,
  							justifyContent: 'center', 
  							alignItems: 'center',
  							// borderWidth: 2,
  							// borderColor: 'rgba(255,255,255,0.9)'
   						}}>
  							<Image style={{
	  							width: 250,
	  							height: 250,
	  						}} source={require('../assets/scan_border.png')} />
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
	  			}}></View>
        	</View>
		);
	}
}

export default connect(state => {
	return state;
})(Scan); 