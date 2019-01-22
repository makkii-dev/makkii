import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button } from 'react-native';
import { Logo } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';

class About extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : 'ABOUT',
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
			<View style={styles.container}>		
				<View style={{
					justifyContent: 'center',
    				alignItems: 'center',					
					marginBottom: 20,
				}}>
					<Logo />
				</View>
				<View style={ styles.marginBottom10 }>
					<Text style={ styles.center_text }>{ constants.BRAND }</Text>
				</View>
				<View style={ styles.marginBottom20 }>
					<Text style={ styles.center_text }>Version: 0.1.0</Text>
				</View>
				<View style={ styles.marginBottom80 }>
					<Button 
						title="Check New Version"
						onPress={e => {
							console.log('check new version');
						}}
					/>
				</View>
				<View style={ styles.marginBottom10 }>
					<Text 
						style={ styles.center_text }
						onPress={e => {
							console.log('license');
						}}
					>
						license
					</Text>
				</View>
				<View>
					<Text 
						style={ styles.center_text }
						onPress={e => {
							console.log('copyright');
						}}
					>
						copyright
					</Text>
				</View>
			</View>
		);
	}
}

export default connect(state => { console.log(state); return ({ setting: state.setting }); })(About);