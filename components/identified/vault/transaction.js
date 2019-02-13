import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import styles from '../../styles.js';

class Transaction extends Component {
    static navigationOptions={
        title: 'TRANSACTION DETAIL'
    };
	constructor(props){
		super(props);
		this.addr = this.props.navigation.state.params.account;
		this.transactionHash = this.props.navigation.state.params.transactionHash;
	}

	render(){
		const transaction = this.props.accounts[this.addr][this.transactionHash];

		return (
			<View style={styles.container}>	

			</View>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(Transaction);