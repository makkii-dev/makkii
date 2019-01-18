import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { Button } from '../../common.js';
import QRCode from 'react-native-qrcode';
import styles from '../../styles.js';

class Account extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : '',
	        headerTitleStyle: {
	        	alignSelf: 'center',
				textAlign: 'center',
				width: '100%',
	        },
	        headerStyle: {
	        	shadowOpacity: 0,
	        	shadowOffset: { 
	        		height: 0, 
	        		width:0, 
	        	}, 
	        	shadowRadius: 0, 
	        	borderBottomWidth:0,
	        	elevation: 1,
	        },
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.account);
		this.props.navigation.setParams({
            title: this.props.account.name
        });
	}
	render(){
		return (
			<View>	
				<View style={{
					flex: 1,
			        flexDirection: 'row',
			        justifyContent: 'space-between',
			        padding: 20,
				}}>
					<View style={{
					}}>
						<View><Text>{ this.props.account.name }</Text></View>
						<View><Text>{ this.props.account.balance }</Text></View>
					</View>
					<View>
						<QRCode
							value={ this.props.account ? this.props.account.address : '0x00000000000000000000000000000000' }
							size={100}
							bgColor='purple'
							fgColor='white'
						/>
					</View>
				</View>
				<View><Text>{ this.props.account.address }</Text></View>
				<View><Text>{ this.props.account.type }</Text></View>
				<View style={{
					flex: 1,
			        flexDirection: 'row',
			        justifyContent: 'space-between',
			        padding: 20,
				}}>
					<Button 
						text="SEND"
					/>
					<Button 
						text="RECEIVE"
					/>
				</View>
				<ScrollView>
					{
						Object.keys(this.props.account.transactions).map(key => {
						    return (
						    	<TouchableOpacity
						    		key={ key }
						  			onPress={e => {
						  				//dispatch(account(this.props.accounts[key]));
						  				this.props.navigation.navigate('VaultTransaction');
						  			}}
					  			>
							  		<View 
							  			style={{
								  			backgroundColor: '#ffffff',
								  			padding: 20,
								  			marginBottom: 1,
								  		}}
							  		>
								  		<View style={{
								  			flex: 1,
									        flexDirection: 'row',
									        justifyContent: 'space-between',
								  		}}> 
								  			<Text style={{
								  				color: 'grey',
								  			}}>{ this.props.account.transactions[key].timestamp }</Text>
									  		<Text style={{
								  				color: 'grey',
								  			}}>{ this.props.account.transactions[key].status }</Text>
								  		</View>
								  		<View style={{
								  			flex: 1,
									        flexDirection: 'row',
									        justifyContent: 'space-between',
									        color: 'grey',
								  		}}> 
								  			<Text style={{
								  				color: 'grey',
								  			}}>{ this.props.account.transactions[key].hash.substring(0, 16) + ' ...' }</Text>
									  		<Text style={{
								  				color: 'grey',
								  			}}>{ this.props.account.transactions[key].value.toFixed(2) }</Text>
								  		</View>
							  		</View>
							  	</TouchableOpacity>	
					    	);
						})					
					}
				</ScrollView>
			</View>
		)
	}
}

export default connect(state => { return ({ account: state.account }); })(Account);