
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,DeviceEventEmitter,Dimensions, FlatList, PixelRatio, ScrollView} from 'react-native';
import AionCell from '../../cell.js';
import {strings} from '../../../locales/i18n';
import {SETTINGS} from './constants';
import {fixedHeight, mainBgColor} from "../../style_util";
import defaultStyles from '../../styles';
import {navigationSafely} from '../../../utils';
import {popCustom} from "../../../utils/dva";

const {width} = Dimensions.get('window');

class Home extends Component {
	static navigationOptions = ({ navigation,screenProps:{t,lan} }) => {
	    return {
			title: t('menuRef.title_settings',{locale:lan})
	    };
    };
	constructor(props){
		super(props);
	}

	render(){
		const {navigation} = this.props;
		const {pinCodeEnabled} = this.props.setting;
		const {hashed_password} = this.props.user;
		return (
			<View style={{
				backgroundColor: mainBgColor,
				flex:1,
				alignItems: 'center'
			}}>
				<ScrollView
					style={{width:width}}
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
											navigationSafely(
												pinCodeEnabled,
												hashed_password,
												navigation,
												{
													url:item.route_url,
												}
											);
										}else {
											navigation.navigate(item.route_url);
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
													listenApp.stop();
													this.props.navigation.navigate('unsigned_login');
												},200);
											}},
									]
								);
							}}/>
					</View>
				</ScrollView>
				{/*<ComponentTabBar*/}
				{/*	// TODO*/}
				{/*	style={{*/}
				{/*		position: 'absolute',*/}
				{/*		bottom: 0,*/}
				{/*		right: 0,*/}
				{/*		height: fixedHeight(156),*/}
				{/*		left: 0,*/}
				{/*		backgroundColor: 'white',*/}
				{/*		flexDirection: 'row',*/}
				{/*		justifyContent: 'space-around',*/}
				{/*		borderTopWidth: 0.3,*/}
				{/*		borderTopColor: '#8c8a8a'*/}
				{/*	}}*/}
				{/*	active={'settings'}*/}
				{/*	onPress={[*/}
				{/*		()=>{this.props.navigation.navigate('signed_vault');},*/}
				{/*		()=>{this.props.navigation.navigate('signed_dapps_launch');},*/}
				{/*		()=>{},*/}
				{/*	]}*/}
				{/*/>*/}
			</View>
		);
	}
}

export default connect(state => {
	return {
		setting: state.setting,
		user: state.user,
	};
})(Home);
