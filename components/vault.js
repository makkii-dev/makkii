import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text, FlatList, View } from 'react-native';

class Vault extends Component {
	constructor(props){
		super(props);
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

const mapStateToProps = function(state){
	return ({
		accounts: state.accounts
	});
}

export default connect(mapStateToProps)(Vault);