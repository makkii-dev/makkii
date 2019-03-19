import React, {} from 'react';
import {connect} from 'react-redux';
import {Alert, View,DeviceEventEmitter,Dimensions, FlatList, PixelRatio} from 'react-native';
import AionCell from '../../cell.js';
import {user_signout} from '../../../actions/user.js';
import {strings} from '../../../locales/i18n';
import {ComponentTabBar} from '../../common.js';
import {HomeComponent} from "../HomeComponent";
import {SETTINGS} from './constants';
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
					<FlatList
						data={SETTINGS}
						renderItem={({item})=>
							<AionCell
								title={strings(item.title)}
								leadIcon={item.icon}
								onClick={() => {
									this.props.navigation.navigate(item.route_url);
								}}
							/>
						}
						ItemSeparatorComponent={() =>
                            <View style={{ height: 1 / PixelRatio.get(), backgroundColor: 'lightgray' }} />
						}
                        keyExtractor={(item, index) => index.toString()}
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
						()=>{this.props.navigation.navigate('signed_dapps_launch');},
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
