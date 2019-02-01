import React, { Component } from 'react';
import { connect } from 'react-redux';
import {View, Text, Image, TouchableOpacity, ScrollView, Dimensions} from 'react-native';
import styles from '../../styles.js';
import {TextInputWithLabel} from "../../common";
import constants from '../../constants.js';

const {width, height} = Dimensions.get('window')
class Send extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: 'SEND',
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
			showAdvanced: false,
			amount: '',
			receiver: '',
			gasPrice: '',
			gasLimit: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	onSend(){
		console.log('send');
	}
	onChangeAmount(amount){
		this.setState({
			amount
		})
	}
	onChangeReceiver(receiver){
		this.setState({
			receiver
		})
	}
	onChangeGasPrice(gasPrice){
		this.setState({
			gasPrice
		})
	}
	onChangeGasLimit(gasLimit){
		this.setState({
			gasLimit
		})
	}
	render(){
		const arrowImage =  this.state.showAdvanced? require('../../../assets/arrow_up.png') :  require('../../../assets/arrow_down.png')
		return (
			<View style={{flex:1,justifyContent:'center'}}>
			<ScrollView style={{width,height}}  contentContainerStyle={{justifyContent: 'center',margin:10}}>
				<TextInputWithLabel
					style={styles.SendView.labelView}
					leftView={<Text>Amount</Text>}
					placeholder={'0'}
					onChangeText={value=>this.onChangeAmount(value)}
					value={this.state.amount}
				/>
				<TextInputWithLabel
					style={styles.SendView.labelView}
					leftView={<Text>Receiver</Text>}
					rightView={
						<TouchableOpacity >
							<Image source={require('../../../assets/qrcode.png')} style={styles.SendView.qrcode}/>
						</TouchableOpacity>}
					placeholder={'0'}
					onChangeText={value=>this.onChangeReceiver(value)}
					value={this.state.receiver}
					multiline = {true}
					numberOfLines = {5}
					textAlignVertical = 'top'
					keyboardType={'default'}
				/>
				<View style={{backgroundColor:'#000', height:0.1, margin: 10, width:width}}/>
				<TouchableOpacity activeOpacity={1} onPress={()=>{
					this.setState({
						showAdvanced: !this.state.showAdvanced,
					})
				}}>
					<View style={styles.SendView.AdvancedBtn} >
						<Text style={{color:'#fff'}}>Advanced</Text>
						<Image source={arrowImage} style={{marginLeft:10, width:30, height:30, tintColor: '#fff'}}/>

					</View>
				</TouchableOpacity>
				{
					this.state.showAdvanced ?
						<View>
							<TextInputWithLabel
								style={styles.SendView.labelView}
								leftView={<Text>gas Price</Text>}
								placeholder={'0'}
								onChangeText={value=>this.onChangeGasPrice(value)}
								value={this.state.gasPrice}
							/>
							<TextInputWithLabel
								style={styles.SendView.labelView}
								leftView={<Text>gas Limit</Text>}
								placeholder={'0'}
								onChangeText={value=>this.onChangeGasLimit(value)}
								value={this.state.gasLimit}
							/>
						</View>: null
				}
			</ScrollView>
				<TouchableOpacity activeOption={1} onPress={()=>this.onSend()}>
					<View style={styles.SendView.SendBtn}>
						<Text style={{color:'#fff'}}>SEND</Text>
						<Image source={require('../../../assets/send_arrow.png')} style={{width:20,height:20,marginLeft:10, tintColor:'#fff'}}/>
					</View>
				</TouchableOpacity>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(Send);