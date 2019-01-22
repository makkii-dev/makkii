import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Button } from 'react-native';
import { InputMultiLines } from '../../common.js';
import QRCode from 'react-native-qrcode';
import styles from '../../styles.js';

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : 'RECOVERY INFO',
	    };
    };
	constructor(props){
		super(props);
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'RECOVERY INFO',
		});
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={styles.container}>	
				<View>
					<InputMultiLines 


					/>
				</View>
				<View>
					<Button 
						title="copy"
						onPress={e => {

						}}
					/>
				</View>
				<View style={styles.center}>
					<QRCode
						value={ this.props.account ? this.props.account.address : '0x00000000000000000000000000000000' }
						size={200}
						bgColor='black'
						fgColor='white'
					/>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Recovery);
