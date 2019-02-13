import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View,Button,TextInput,Clipboard} from 'react-native';
import {InputMultiLines} from '../../common.js';
import QRCode from 'react-native-qrcode-svg';
import Toast from '../../toast.js';
import styles from '../../styles.js';

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
			title: 'Recovery Phrase'
	    };
    };
	constructor(props){
		super(props);
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		return (
			<View style={styles.container}>
				<View style={styles.marginBottom40}>
                    <InputMultiLines
						style={{
							color: 'black',
							borderWidth: 1,
							borderColor: 'black',
							borderRadius: 5,
							fontSize: 18,
						}}
						editable={false}
						borderRadius={5}
						numberOfLines={3}
						value={this.props.user.mnemonic}
					/>
				</View>
				<View style={styles.marginBottom80}>
					<Button
						title="copy"
						onPress={e => {
							Clipboard.setString(this.props.user.mnemonic);
							this.refs.toast.show('Copied to clipboard successfully');
						}}
					/>
				</View>
                <View style={{
                	justifyContent: 'center',
					alignItems: 'center',
				}}>
                	<QRCode
                		size={200}
				      	value={this.props.user.mnemonic}
				    />	   
				</View>
				<Toast
					ref={"toast"}
					duration={Toast.Duration.short}
                    onDismiss={() => {}}
				/>
			</View>
		)
	}
}

export default connect(state => { 
	return ({ 
		user: state.user 
	}); 
})(Recovery);