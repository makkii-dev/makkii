import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, FlatList, Text } from 'react-native';
import { Logo, Button } from '../../common.js';
import styles from '../../styles.js';
import constants from '../../constants.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    console.log(state.params);
	    return {
	        title: state.params ? state.params.title : '',
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.accounts);
		this.props.navigation.setParams({
            title: '0 Aion'
        });
	}
	render(){
		return (
			<View style={styles.container}>	
				<ScrollView style={{
					width: '100%',
					height: '100%',
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
						  		<View style={{
						  			flex: 1,
							        flexDirection: 'row',
							        justifyContent: 'space-between',
						  		}}> 
						  			<Text>{ item.label }</Text>
							  		<Text>{ item.balance }</Text>
						  		</View>
						  		<View style={{
						  			flex: 1,
							        flexDirection: 'row',
							        justifyContent: 'space-between',
						  		}}> 
						  			<Text>{ item.address }</Text>
							  		<Text>{ item.type }</Text>
						  		</View>
					  		</View>
					  	}
					/>
				</ScrollView>
			</View>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(Home);