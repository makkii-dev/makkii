import React,{Component} from 'react';
import {View} from 'react-native';
import {strings} from '../../../locales/i18n';
import {WebView} from "react-native-webview";
import {connect} from 'react-redux';


class PrivacyPolicy extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
			title: strings('privacy_policy.title')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={{flex: 1}}>
				<WebView
					source={{uri: 'http://45.118.132.89/privacy_policy.html'}}
					cacheEnabled={true}
				/>
			</View>
		)
	}
}
export default connect(state => { return ({ setting: state.setting }); })(PrivacyPolicy);
