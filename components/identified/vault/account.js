import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import { Button } from '../../common.js';
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
			<View style={styles.container}>	
				<View style={{
					flex: 1,
				}}>
					<View></View>
					<View></View>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ account: state.account }); })(Account);