import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Dimensions, View,Text,DeviceEventEmitter, TouchableOpacity} from 'react-native';
import {setting} from '../../../actions/setting.js';
import {strings} from "../../../locales/i18n";
import Toast from 'react-native-root-toast';
import {mainnet_url, mastery_url} from '../../../utils';
import SelectList from '../../selectList.js';

const {width,height} = Dimensions.get('window');

class Services extends Component {
	static navigationOptions = ({ navigation }) => {
		let textColor;
		if (navigation.state.params && navigation.state.params.isEdited) {
			textColor = 'rgba(255, 255, 255, 1.0)';
		} else {
			textColor = 'rgba(255, 255, 255, 0.3)';
		}
	    return {
	        title: strings('service_configuration.title'),
			headerTitleStyle: {
				fontSize: 20,
				alignSelf: 'center',
				textAlign: 'center',
				flex: 1,
			},
			headerRight: (
				<TouchableOpacity
					onPress={() => {
                        navigation.state.params.updateServiceConfiguration();
                    }}
					disabled={!navigation.state.params || !navigation.state.params.isEdited}
				>
					<View style={{marginRight: 20}}>
						<Text style={{
							color: textColor,
							fontWeight: 'bold'
						}}>{strings('save_button')}</Text>
					</View>
				</TouchableOpacity>
			)
	    };
    };

	constructor(props){
		super(props);
		console.log(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	componentWillMount() {
		this.props.navigation.setParams({
			updateServiceConfiguration: this.updateServiceConfiguration,
			isEdited: false
		});
	}

	render(){
		return (
			<View style={{
				backgroundColor: '#eeeeee',
				alignItems: 'center',
				flex: 1,
				paddingTop: 40
			}}>
				<View style={{
					width: width - 40,
					borderRadius: 5,
					backgroundColor: 'white',
					elevation: 3,
					paddingLeft: 20,
					paddingRight: 20,
				}} >
					<SelectList
						ref={ref=>this.selectList=ref}
						itemHeight={55}
						data={{
							'mainnet': 'Main Net',
							'mastery': 'Test Net',
							}}
						cellLeftView={item=>{
							return (
								<Text style={{flex: 1}}>{item}</Text>
							)
						}}
						defaultKey={this.props.setting.explorer_server}
						onItemSelected={() => {
							this.props.navigation.setParams({
								isEdited: this.props.setting.explorer_server != Object.keys(this.selectList.getSelect())[0],
							});
						}}
					/>
				</View>
			</View>
		)
	}

	updateServiceConfiguration=() => {
		// if (!validateUrl(this.state.endpoint_wallet)) {
		// 	Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_wallet_server_url'));
		// 	return;
		// }

		// if (!validateUrl(this.state.endpoint_dapps)) {
		// 	Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_dapp_server_url'));
		// 	return;
		// }
		//
		// if (!validateUrl(this.state.endpoint_odex)) {
		// 	Alert.alert(strings('alert_title_error'), strings('service_configuration.invalid_odex_server_url'));
		// 	return;
		// }


		// TODO: connectivity test
		const { dispatch } = this.props;
		let _setting = this.props.setting;
		_setting.explorer_server = Object.keys(this.selectList.getSelect())[0];
		if (_setting.explorer_server === 'mainnet') {
			_setting.endpoint_wallet = mainnet_url;
		} else {
			_setting.endpoint_wallet = mastery_url;
		}
		// _setting.endpoint_dapps = this.state.endpoint_dapps;
		// _setting.endpoint_odex = this.state.endpoint_odex;
		dispatch(setting(_setting));

        Toast.show(strings('toast_update_success'), {
			position: Toast.positions.CENTER,
			onHidden: () => {
				DeviceEventEmitter.emit('updateAccountBalance');
        		this.props.navigation.goBack();
			}
		});
	}

}

export default connect(state => { return ({ setting: state.setting }); })(Services);