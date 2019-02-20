import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,DeviceEventEmitter} from 'react-native';
import AionCell from '../../cell.js'; 
import {user_signout} from '../../../actions/user.js';
import {strings} from '../../../locales/i18n';
import {ComponentTabBar} from '../../common.js';
import styles from '../../styles.js';
import {HomeComponent} from "../HomeComponent";

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
				backgroundColor: '#eeeeee',
				flex:1,
			}}>
				<View style={styles.marginTop60} />
                <AionCell
                    title={strings('password.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_password');
                    }}
                />
                <AionCell
                    title={strings('recovery_phrase.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_recovery');
                    }}
                />
                <AionCell
                    title={strings('service_configuration.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_services');
                    }}
                />
				<AionCell
					title={strings('language.title')}
					onClick={() => {
						this.props.navigation.navigate('signed_setting_language');
					}}
					/>
				<AionCell
					title={strings('currency.title')}
					onClick={() => {
						this.props.navigation.navigate('signed_setting_currency');
					}}
					/>
				<AionCell
					title={strings('advanced.title')}
					onClick={() => {
						this.props.navigation.navigate('signed_setting_advanced');
					}}
					/>
                <AionCell
                    title={strings('about.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_about');
                    }}
                />
				<View style={styles.marginTop60} />
                <AionCell
					title={strings('logout')}
					onClick={() => {
						const { dispatch } = this.props; 
						dispatch(user_signout());
						setTimeout(()=>{
							this.props.navigation.navigate('unsigned_login');
						},200);
					}}/>
				<ComponentTabBar 
					// TODO
					style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
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