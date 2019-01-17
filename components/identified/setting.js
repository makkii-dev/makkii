import React,{ Component} from 'react';
import { connect } from 'react-redux';
import { Button, Input } from '../common.js';
import { ScrollView, View, Text } from 'react-native';
import styles from '../styles.js';

class Setting extends Component {
	constructor(props){
		super(props)
		console.log(props)
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<ScrollView style={ styles.container }>
				<View style={ styles.form }>
					<Text style={ styles.label }>Lang</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.lang } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Theme</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.theme } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Version</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.version } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Tx Fee</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.tx_fee } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Tx Confirm</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.tx_confirm } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Dapps Server</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.remote_dapps } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Api Server</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.remote_kernel } />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Odex Server</Text>
				</View>
				<View style={styles.form}>
					<Input value={ this.props.setting.basic.remote_odex } />
				</View>
				<View style={styles.form}>
			      	<Button 
						text="Sign out" 
						onPress={()=>{
							this.props.navigation.navigate('Login')
						}}
					/>
				</View>
			</ScrollView>
		);
	}
}

const mapStateToProps = function(state){
	return ({
		setting: state.setting
	});
}

export default connect(mapStateToProps)(Setting);