import React, { Component } from 'react';
import { connect } from 'react-redux';
import {View, Text, TouchableOpacity,TextInput, Clipboard} from 'react-native';
import { TextInputWithLabel } from '../../common.js';
import styles from '../../styles.js';
import QRCode from 'react-native-qrcode-svg';
import Toast from '../../toast.js';

class Receive extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: 'RECEIVE',
			headerTitleStyle: {
				alignItems: 'center',
				textAlign: 'center',
				flex:1,
			},
			headerRight: <View></View>
		};
	};

	constructor(props){
		super(props);
		this.state={
			amount: '0',
			qrCodeValue: this.props.account.address,
		}
	}
	onChangeAmount(amount){
		this.setState({
			amount
		})
	}
	onRefresh(){
		let obj ={};
		obj['receiver'] = this.props.account.address;
		obj['amount'] = this.state.amount;
		this.setState({
			qrCodeValue: JSON.stringify(obj),
		})
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={styles.container}>
				<TextInputWithLabel
					style={styles.SendView.labelView}
					leftView={<Text>Amount</Text>}
					placeholder={'0'}
					onChangeText={value=>this.onChangeAmount(value)}
					value={this.state.amount}
				/>
				<TouchableOpacity activeOption={1} onPress={()=>this.onRefresh()}>
					<View style={styles.SendView.SendBtn}>
						<Text style={{color:'#fff'}}>REFRESH</Text>
					</View>
				</TouchableOpacity>
				<View style={{alignItems: 'center', margin: 10}}>
					<QRCode
						value={this.state.qrCodeValue}
						size={150}
						color='purple'
						backgroundColor='white'
					/>
				</View>
				<View>
					<TextInput
						style={{borderWidth: 1, borderColor: '#000'}}
						numberOfLines={3}
						multiline={true}
						value={this.props.account.address}
						editable={false}
					/>
				</View>
				<TouchableOpacity activeOption={1} onPress={()=>{
					Clipboard.setString(this.props.account.address);
					this.refs.toast.show('Copied to clipboard successfully');
				}}>
					<View style={styles.SendView.SendBtn}>
						<Text style={{color:'#fff'}}>COPY TO CLIPBOARD</Text>
					</View>
				</TouchableOpacity>
				<Toast
					ref={"toast"}
					duration={Toast.Duration.short}
					onDismiss={() => {}}
				/>
			</View>
		)
	}
}

export default connect(state => { return ({ account: state.account }); })(Receive);