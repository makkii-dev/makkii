import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Dimensions, TouchableOpacity} from 'react-native';
import {ComponentLogo} from '../../common.js';
import AionCell from '../../cell.js';
import {strings} from '../../../locales/i18n';
import styles from '../../styles.js';
import Toast from 'react-native-root-toast';

class About extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
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
				backgroundColor: '#eeeeee',
				height: Dimensions.get('window').height, 
			}}>
				<View style={{
					justifyContent:'center',
    				alignItems:'center',					
					marginBottom:60,
					marginTop:80,
				}}>
					<ComponentLogo />
					<Text style={{
						marginTop: 10,
						fontSize: 22,
                        color: 'black',
					}}>{ strings('app_name') }</Text>
					<Text style={{
						fontSize: 14,
						color: 'black',
					}}>{strings('about.version_label')} {this.props.setting.version}</Text>
				</View>
				<View style={ styles.marginBottom80 }>
					<AionCell
						title={strings('about.version_update_button')}
						onClick={() => {
						    Toast.show(strings('about.version_latest'));
						}}
					/>
				</View>
				<View style={styles.marginBottom40}>
					<Text style={styles.center_text}>
						Powered by Chaion
					</Text>
				</View>
				<View>
					<TouchableOpacity onPress={() => {
						this.props.navigation.navigate('simple_webview', {
							title: strings('terms_service.title'),
							initialUrl: 'http://45.118.132.89/terms_services.html',
						});
					}}>
                        <Text style={{...styles.center_text, color: 'blue'}}> {strings('about.terms_label')} </Text>
					</TouchableOpacity>
					<Text style={styles.center_text}>
						{strings('about.label_and')}
					</Text>
					<TouchableOpacity onPress={() => {
						this.props.navigation.navigate("simple_webview", {
                            title: strings('privacy_policy.title'),
							initialUrl: 'http://45.118.132.89/privacy_policy.html',
						});
					}}>
                        <Text style={{...styles.center_text, color: 'blue'}}>
                             {strings('about.policy_label')}
                        </Text>
                    </TouchableOpacity>
					<Text style={styles.center_text}>
						{strings('about.copyright_label')}
					</Text>	
				</View>
			</View>
		);
	}
}

export default connect(state => { return ({ setting: state.setting }); })(About);