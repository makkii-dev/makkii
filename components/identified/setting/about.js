import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { ComponentLogo } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';
import AionCell from '../../cell.js';
import Toast from '../../toast.js';
import { strings } from '../../../locales/i18n';

class About extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {			
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				flex: 1
			},
			headerRight: (<View></View>),
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
				paddingTop: 40,
				paddingBottom: 40,
				justifyContent:'space-between',
				flex:1,
				backgroundColor: '#eeeeee',
			}}>
				<View style={{
					justifyContent: 'center',
    				alignItems: 'center',					
					marginBottom: 20,
				}}>
					<ComponentLogo />
					<Text style={{
						marginTop: 10,
						fontWeight: 'bold',
						fontSize: 26,
                        color: 'black',
					}}>{ strings('app_name') }</Text>
					<Text style={{
						fontSize: 20,
						color: 'black',
					}}>{strings('about.version_label')} 0.1.0</Text>
				</View>
				<View style={ styles.marginBottom80 }>
					<AionCell
						title={strings('about.version_update_button')}
						onClick={() => {
							this.refs.toast.show(strings('about.version_latest'));
						}}
					/>
				</View>
				<View style={{
					marginBottom: 10,
                    alignItems: 'center'
				}}>
					<Text style={{ color: 'blue', }}>
						{strings('about.terms_label')}
					</Text>
					<Text style={{ color: 'blue', }}>
						{strings('about.policy_label')}
					</Text>
					<Text style={styles.center_text}>
						{strings('about.copyright_label')}
					</Text>
				</View>
                <Toast
					ref={"toast"}
					duration={Toast.Duration.short}
					onDismiss={() => {}}
				/>
			</View>
		);
	}
}

export default connect(state => { return ({ setting: state.setting }); })(About);