import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';

class ImportLedger extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : '',
	        headerRight: 
	        	<TouchableOpacity
	        		onPress={e => {
	        			state.params.import();
	        		}}
	        	>
					<Text>IMPORT</Text>
				</TouchableOpacity>
	    };
    };
	constructor(props){
		super(props);

		const { navigation } = this.props;
		console.log(navigation.state.params.accounts);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(Object.keys(this.props.accounts_ledger).length);
		let parent = this;
		this.props.navigation.setParams({
            title: 'SELECT ACCOUNTS',
            import: function(){
            	console.log('import')
            }
        });
	}
	render(){
		return (
			<ScrollView 
				onScrollBeginDrag={e => {
					console.log('on scrolling');
				}}
			>
				{
					Object.keys(this.props.accounts_ledger).map(key => {
					    return (
					  		<View key={key} style={styles.listItem}>	
						  		<View style={styles.listItemLeft}> 
						  			<Text style={styles.listItemText}>{ this.props.accounts_ledger[key].address.substring(0, 32) }</Text>
						  		</View>
						  		<View style={styles.listItemRight}> 
						  			<Switch />
						  		</View>
					  		</View>
				    	);
					})					
				}
			</ScrollView>	
		)
	}
}

export default connect(state => { return ({ accounts_ledger: state.accounts_ledger }); })(ImportLedger);

const styles = StyleSheet.create({
	listItem: {
		flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
        padding: 10,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
	},
	listItemLeft: {
	},
	listItemRight: {
	    width: 60,
	},
	listItemText: {
		color: 'grey',
		lineHeight: 25,
	},
});