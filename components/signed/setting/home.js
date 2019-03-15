import React, {} from 'react';
import {connect} from 'react-redux';
import {Alert, View,DeviceEventEmitter,Dimensions} from 'react-native';
import AionCell from '../../cell.js';
import {user_signout} from '../../../actions/user.js';
import {strings} from '../../../locales/i18n';
import {ComponentTabBar} from '../../common.js';
import {HomeComponent} from "../HomeComponent";
import {fixedHeight, mainBgColor} from "../../style_util";

const {width,height} = Dimensions.get('window');

class Home extends HomeComponent {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
			title: navigation.getParam('title')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);

		this.update_locale();

		this.listener = DeviceEventEmitter.addListener('locale_change', () => {
		    console.log("locale changed");
		    this.update_locale();
		});
	}

	update_locale= () => {
		this.props.navigation.setParams({
			'title': strings('menuRef.title_settings'),
		});
	}

	componentWillUnmount() {
		this.listener.remove();
	}

	render(){
		return (
			<View style={{
				backgroundColor: mainBgColor,
				flex:1,
				alignItems: 'center'
			}}>
				<View style={{
					marginTop: 20,
					width: width - 40,
					borderRadius: 5,
					backgroundColor: 'white',
					elevation: 3,
					paddingLeft: 10,
					paddingRight: 10,
				}} >
                    <AionCell
                        title={strings('password.title')}
						topSeparator={false}
						leadIcon={require('../../../assets/icon_setting_password.png')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_password');
                        }}
                    />
                    <AionCell
                        title={strings('recovery_phrase.title')}
						leadIcon={require('../../../assets/icon_setting_recovery.png')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_recovery');
                        }}
                    />
                    <AionCell
                        title={strings('service_configuration.title')}
						leadIcon={require('../../../assets/icon_server.png')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_services');
                        }}
                    />
                    <AionCell
                        title={strings('language.title')}
						leadIcon={require('../../../assets/icon_setting_i18n.png')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_language');
                        }}
                        />
                    <AionCell
						leadIcon={require('../../../assets/icon_currency.png')}
                        title={strings('currency.title')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_currency');
                        }}
                        />
                    <AionCell
                        title={strings('advanced.title')}
						leadIcon={require('../../../assets/icon_advance.png')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_advanced');
                        }}
                        />
                    <AionCell
                        title={strings('about.title')}
						bottomSeparator={false}
						leadIcon={require('../../../assets/icon_setting_about.png')}
                        onClick={() => {
                            this.props.navigation.navigate('signed_setting_about');
                        }}
                    />
				</View>
				<View style={{
					marginTop: 20,
					width: width - 40,
					borderRadius: 10,
					backgroundColor: 'white',
					elevation: 3,
					paddingLeft: 10,
					paddingRight: 10,
				}} >
                    <AionCell
						bottomSeparator={false}
						topSeparator={false}
						leadIcon={require('../../../assets/icon_signout.png')}
                        title={strings('logout')}
                        onClick={() => {
                        	Alert.alert(
                        		'',
								strings('setting.confirm_logout'),
								[
									{text: strings('cancel_button'), onPress:()=>{}},
									{text: strings('alert_ok_button'), onPress:()=>{
											const { dispatch } = this.props;
											dispatch(user_signout());
											setTimeout(()=>{
												this.props.navigation.navigate('unsigned_login');
											},200);
										}},
								]
                            );
                        }}/>
				</View>
				<ComponentTabBar
					// TODO
					style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						height: fixedHeight(156),
						left: 0,
						backgroundColor: 'white',
						flexDirection: 'row',
						justifyContent: 'space-around',
						borderTopWidth: 0.3,
						borderTopColor: '#8c8a8a'
					}}
					active={'settings'}
					onPress={[
						()=>{this.props.navigation.navigate('signed_vault');},
						()=>{this.props.navigation.navigate('signed_dapps');},
						()=>{this.props.navigation.navigate('signed_setting');},
					]}
				/>
			</View>
		);
	}
}

export default connect(state => {
	return {
		setting: state.setting
	};
})(Home);
