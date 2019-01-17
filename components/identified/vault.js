import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text, FlatList, View } from 'react-native';

class Vault extends Component {
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.accounts);
	}
	render(){
		return (
			<ScrollView style={{
				width: '100%',
				height: '100%',
				padding: 10
			}}>
				<FlatList
				    style={{
				    	flex: 1, 
				    	flexDirection: 'row'
				    }}
				  	data={this.props.accounts}
				  	keyExtractor={(item, index) => index.toString()}
				  	renderItem={({item}) =>
				  		<View> 
					  		<Text style={{
					    		alignItems: 'center',
					    		height: 40
					  		}}>{item.address}</Text>
				  		</View>
				  	}
				/>
			</ScrollView>
		);
	}
}

export default connect(state => { return { accounts: state.accounts }; })(Vault);