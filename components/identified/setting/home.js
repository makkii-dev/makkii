import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimensions, View, Button, StyleSheet } from 'react-native';
import styles from '../../styles.js';
import AionCell from '../../cell.js';
import { user_signout } from '../../../actions/user.js';
import { strings } from '../../../locales/i18n';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : 'Settings',
			headerStyle: {
				backgroundColor: '#eeeeee'
			},
			headerTitleStyle: {
	        	alignSelf: 'center',
				textAlign: 'center',
				flex: 1
			},
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'Settings',
		});
	}
	render(){
		return (
			<View style={{
				backgroundColor: '#eeeeee',
				height: Dimensions.get('window').height,
				paddingTop: 10
			}}>
				<View>
                    <AionCell
                        title={strings('password.title')}
                        onClick={() => {
                            this.props.navigation.navigate('SettingUpdatePassword');
                        }}
                    />
                    <AionCell
                        title={strings('recovery_phrase.title')}
                        onClick={() => {
                            this.props.navigation.navigate('SettingRecovery');
                        }}
                    />
                    <AionCell
                        title={strings('service_configuration.title')}
                        onClick={() => {
                            this.props.navigation.navigate('SettingServices');
                        }}
                    />
                    <AionCell
                        title={strings('about.title')}
                        onClick={() => {
                            this.props.navigation.navigate('SettingAbout');
                        }}
                    />
					<View style={{
						marginTop: 20
					}}/>
                    <AionCell
						title={strings('logout')}
						onClick={() => {
							const { dispatch } = this.props;
							dispatch(user_signout());
							this.props.navigation.navigate('Unidentified');
						}}/>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Home);