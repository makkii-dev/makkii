import React,{Component} from 'react';
import {connect} from 'react-redux';
import { Image, View,Text,Dimensions, TouchableOpacity} from 'react-native';
import Toast from 'react-native-root-toast';

import AionCell from '../../cell.js';
import {strings} from '../../../locales/i18n';
import defaultStyles from '../../styles.js';
import {linkButtonColor, mainBgColor} from '../../style_util';

const {width,height} = Dimensions.get('window');

class About extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
			title: strings('about.title')
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
			<View style={{
				backgroundColor: mainBgColor,
                width: width,
				height: height,
				alignItems:'center',
				flex: 1,
			}}>
				<View style={{
					marginBottom:40,
					marginTop:40,
					justifyContent:'center',
					alignItems:'center',
				}}>
					<Image
						style={{
							width:50,
							height:50,
						}}
						resizeMode={'contain'}
						source={require('../../../assets/icon_app_logo.png')}
					/>
					<Text style={{
						marginTop: 15,
						fontSize: 22,
                        color: 'black',
					}}>{ strings('app_name') }</Text>
					<Text style={{
						marginTop: 15,
						fontSize: 14,
						color: 'black',
					}}>{strings('about.version_label')} {this.props.setting.version}</Text>
				</View>
				<View style={{
				    ...defaultStyles.shadow,
				    marginBottom: 150,
					width: width - 40,
					borderRadius: 5,
					backgroundColor: 'white',
					paddingLeft: 10,
					paddingRight: 10,
				}} >
					<AionCell
						title={strings('about.version_update_button')}
						onClick={() => {
						    Toast.show(strings('about.version_latest'));
						}}
					/>
				</View>
                <View style={{
                	position: 'absolute',
					bottom: 40,
					alignItems: 'center'
				}}>
					<Text style={{marginBottom: 40}}>
						Powered by Chaion
					</Text>
                    <View style={{
                    	flexDirection: 'row',
						justifyContent: 'space-between',
						marginBottom: 10,
					}}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('simple_webview', {
                                title: strings('terms_service.title'),
                                initialUrl: 'http://45.118.132.89/terms_services.html',
                            });
                        }}>
                            <Text style={{...defaultStyles.center_text, color: linkButtonColor}}> {strings('about.terms_label')} </Text>
                        </TouchableOpacity>
                        <Text style={defaultStyles.center_text}>
                            {strings('about.label_and')}
                        </Text>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("simple_webview", {
                                title: strings('privacy_policy.title'),
                                initialUrl: 'http://45.118.132.89/privacy_policy.html',
                            });
                        }}>
                            <Text style={{...defaultStyles.center_text, color: linkButtonColor}}> {strings('about.policy_label')} </Text>
                        </TouchableOpacity>
                    </View>
					<Text style={defaultStyles.center_text}>
						{strings('about.copyright_label')}
					</Text>
				</View>
			</View>
		);
	}
}

export default connect(state => { return ({ setting: state.setting }); })(About);
