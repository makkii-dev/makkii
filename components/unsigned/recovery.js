import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Image, View,Text,Keyboard, TouchableOpacity, Dimensions} from 'react-native';
import {strings} from "../../locales/i18n";
import {InputMultiLines, ComponentButton, alert_ok} from '../common';
import {validateMnemonic} from "../../libs/aion-hd-wallet";
import defaultStyles from '../styles';
import {mainBgColor} from '../style_util';

const {width,height} = Dimensions.get('window');

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: strings("recovery.title"),
			headerRight: (
				<TouchableOpacity
					onPress={()=>{
						navigation.state.params.scan()
					}}
					style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
				>
					<Image source={require('../../assets/icon_scan.png')} style={{
						tintColor: 'white',
						width: 20,
						height: 20,
					}} />
				</TouchableOpacity>
			)
	    };
    }

	constructor(props){
		super(props);
		this.state = {
			mnemonic: ''
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	async componentWillReceiveProps(props){
		let scannedData = props.navigation.getParam('scanned', '');
		if(scannedData!=='scanned'&& scannedData!== this.oldScannedData){
			this.oldScannedData = scannedData;
			this.setState({
				mnemonic: scannedData
			});
		}
	}
	componentWillMount() {
	    	this.props.navigation.setParams({
				scan: this.scan,
			});
	}

	scan=()=> {
		this.props.navigation.navigate('scan',{
			success:'unsigned_recovery',
			validate:function(data, callback){
				let pass = validateMnemonic(data.data);
				callback(pass, pass ? '' : strings('toast_invalid_mnemonic'));
			}
		});
	}

	render(){
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={()=>{Keyboard.dismiss()}}
                style={{
                	flex:1,
					width: width,
					height: height,
					alignItems: 'center',
				}}
			>
				<View style={{
					flex: 1,
					padding: 40,
					backgroundColor: mainBgColor,
				}}
				>
                    <Text style={{
                    	marginBottom: 20,
						fontSize: 16,
                    }}>{strings("recovery.label_prompt")}</Text>
					<View style={{
					    ...defaultStyles.shadow,
						padding: 10,
						borderRadius: 5,
						height: 130,
						backgroundColor: 'white',
						width: width - 80,
						marginBottom: 40,
					}}>
                        <InputMultiLines
                            editable={true}
                            numberOfLines={8}
                            style={{
								borderWidth: 0,
								fontSize: 18,
								height: 200,
								fontWeight: 'normal',
								textAlignVertical: 'top'
							}}
                            value={this.state.mnemonic}
                            onChangeText={e=>{
                                this.setState({
                                    mnemonic: e
                                });
                            }}
                        />
					</View>
					<ComponentButton
						title={strings('recovery.button_confirm')}
                        onPress={e=> {
                            if (!validateMnemonic(this.state.mnemonic)) {
								alert_ok(strings('alert_title_error'), strings('recovery.error_invalid_mnemonic'))
                                return;
							}
							this.props.navigation.navigate('unsigned_recovery_password', {
								mnemonic: this.state.mnemonic
							});
						}}
					/>
				</View>
			</TouchableOpacity>
		);
	}
}

export default connect()(Home);
