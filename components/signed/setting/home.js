
import React, {} from 'react';
import {connect} from 'react-redux';
import {View,DeviceEventEmitter,Dimensions, FlatList, PixelRatio, ScrollView} from 'react-native';
import AionCell from '../../cell.js';
import {strings} from '../../../locales/i18n';
import {ComponentTabBar} from '../../common.js';
import {HomeComponent} from "../HomeComponent";
import {SETTINGS} from './constants';
import {fixedHeight, mainBgColor} from "../../style_util";
import defaultStyles from '../../styles';
import {navigateUnlock} from '../../../utils';

const {width} = Dimensions.get('window');

class Home extends HomeComponent {
	static navigationOptions = ({ navigation }) => {
	    return {
			title: navigation.getParam('title')
	    };
    };
	constructor(props){
		super(props);
	}
	shouldComponentUpdate(nextProps) {
		return nextProps.setting!==this.props.setting;
	}

	componentWillMount(){
		super.componentWillMount();
		this.update_locale();

		this.listener = DeviceEventEmitter.addListener('locale_change', () => {
		    this.update_locale();
		});
	}

	update_locale= () => {
		this.props.navigation.setParams({
			'title': strings('menuRef.title_settings'),
		});
	};

	componentWillUnmount() {
		super.componentWillUnmount();
		this.listener.remove();
	}

	render(){
		console.log('render setting');
		const {navigate} = this.props.navigation;
		const navigate2=(route_url)=>{
			navigateUnlock(
				route_url,
				this.props.setting.pinCodeEnabled,
				navigate
			)
		};
		return (
			<View style={{
				backgroundColor: mainBgColor,
				flex:1,
				alignItems: 'center'
			}}>
				<ScrollView
					style={{width:width,marginBottom: fixedHeight(180)}}
					contentContainerStyle={{alignItems: 'center'}}
				>
					<View style={{
						...defaultStyles.shadow,
						marginTop: 20,
						width: width - 40,
						borderRadius: 5,
						backgroundColor: 'white',
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
										if(item.title==='recovery_phrase.title'){
											navigate2(item.route_url);
										}else {
											navigate(item.route_url);
										}
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
						...defaultStyles.shadow,
						marginTop: 20,
						marginBottom:10,
						width: width - 40,
						borderRadius: 5,
						backgroundColor: 'white',
						paddingLeft: 10,
						paddingRight: 10,
					}} >
						<AionCell
							bottomSeparator={false}
							topSeparator={false}
							leadIcon={require('../../../assets/icon_signout.png')}
							title={strings('logout')}
							onClick={() => {
								popCustom.show(
									strings('alert_title_warning'),
									strings('setting.confirm_logout'),
									[
										{text: strings('cancel_button'), onPress:()=>{}},
										{text: strings('alert_ok_button'), onPress:()=>{
												setTimeout(()=>{
													this.props.navigation.navigate('unsigned_login');
												},200);
											}},
									]
								);
							}}/>
					</View>
				</ScrollView>
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
						()=>{},
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
