import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles.js';
import { account } from '../../../actions/account.js';

class Home extends Component {
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
	        }
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.accounts);
		this.props.navigation.setParams({
            title: 'Total: 0'
        });
	}
	render(){
		const { dispatch } = this.props;
		return (
			<ScrollView>
				{
					Object.keys(this.props.accounts).map(key => {
					    return (
					    	<TouchableOpacity
					    		key={ key }
					  			onPress={e => {
					  				dispatch(account(this.props.accounts[key]));
					  				this.props.navigation.navigate('VaultAccount');
					  			}}
				  			>
						  		<View 
						  			style={{
							  			backgroundColor: '#ffffff',
							  			padding: 10,
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
							  			}}>{ this.props.accounts[key].name }</Text>
								  		<Text style={{
							  				color: 'grey',
							  			}}>{ this.props.accounts[key].balance }</Text>
							  		</View>
							  		<View style={{
							  			flex: 1,
								        flexDirection: 'row',
								        justifyContent: 'space-between',
								        color: 'grey',
							  		}}> 
							  			<Text style={{
							  				color: 'grey',
							  			}}>{ this.props.accounts[key].address.substring(0, 16) + ' ...' }</Text>
								  		<Text style={{
							  				color: 'grey',
							  			}}>{ this.props.accounts[key].type }</Text>
							  		</View>
						  		</View>
						  	</TouchableOpacity>	
				    	);
					})					
				}
			</ScrollView>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(Home);