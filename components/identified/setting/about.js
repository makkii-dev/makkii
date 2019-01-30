import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { Logo } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';
import AionCell from '../../cell.js';
import Toast from '../../toast.js';

class About extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
			headerStyle: {
				backgroundColor: '#eeeeee'
			},
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				flex: 1
			},
			headerRight: (<View></View>),
			title: 'About'
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'ABOUT',
		});
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
					<Logo />
					<Text style={{
						marginTop: 10,
						fontWeight: 'bold',
						fontSize: 26,
                        color: 'black',
					}}>{ constants.BRAND }</Text>
					<Text style={{
						fontSize: 20,
						color: 'black',
					}}>Version 0.1.0</Text>
				</View>
				<View style={ styles.marginBottom80 }>
					<AionCell
						title='Version Update'
						onClick={() => {
							this.refs.toast.show('Your version is already the latest.');
						}}
					/>
				</View>
				<View style={{
					marginBottom: 10,
                    alignItems: 'center'
				}}>
					<Text style={{ color: 'blue', }}>
                        Chaion Terms of Service
					</Text>
					<Text style={{ color: 'blue', }}>
						Privacy Policy
					</Text>
					<Text style={styles.center_text}>
						Copyright ©2019 Chaion. All Rights Reserved.
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

export default connect(state => { console.log(state); return ({ setting: state.setting }); })(About);