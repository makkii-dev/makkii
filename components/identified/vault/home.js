import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, Button, Text, TouchableOpacity, StyleSheet, } from 'react-native';
import { account } from '../../../actions/account.js';
import { ui } from '../../../actions/ui.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : '',
	        headerRight: 
	        	<TouchableOpacity
	        		onPress={e => {
	        			state.params.toggle();
	        		}}
	        	>
					<Text style={{
						fontSize: 20,
						lineHeight: 22,
						textAlign: 'center',
						color: 'grey',
						top: 0,
						right: 10,
						borderWidth: 1,
						borderColor: 'grey',
						width: 20,
						height: 20,
						borderRadius: 30,
					}}>+</Text>
				</TouchableOpacity>
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(Object.keys(this.props.accounts).length);
		const { dispatch } = this.props;
		let parent = this;
		this.props.navigation.setParams({
            title: 'Total: 0',
            toggle: function(){
            	dispatch(ui({
            		vault_home_sub_navi: !parent.props.ui.vault_home_sub_navi
            	}));
            }
        });
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View>
				{
					this.props.ui.vault_home_sub_navi ? 
					<View>
						<Button
							title="Import from private key" 
							onPress={e => {
								dispatch(ui({ vault_home_sub_navi: false }));
								this.props.navigation.navigate('VaultImportPrivateKey');
							}} />
						<Button
							title="Import from ledger"
							onPress={e => {
								dispatch(ui({ vault_home_sub_navi: false }));
								this.props.navigation.navigate('VaultImportLedger');
							}} />
						<Button
							title="Close" 
							onPress={e => {
								dispatch(ui({ vault_home_sub_navi: false }));
							}} />
			        </View> : <View></View>
				}
				<ScrollView 
					onScrollBeginDrag={e => {
						dispatch(ui({ vault_home_sub_navi: false }));
					}}
				>
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
							  		<View style={ styles.listItem }>	
								  		<View style={styles.listItemLeft}> 
								  			<Text style={styles.listItemText}>{ this.props.accounts[key].name }</Text>
									  		<Text style={styles.listItemText}>{ this.props.accounts[key].address.substring(0, 16) + ' ...' }</Text>
								  		</View>
								  		<View style={styles.listItemRight}> 
								  			<Text style={styles.listItemText}>{ this.props.accounts[key].balance }</Text>
								  			<Text style={styles.listItemText}>{ this.props.accounts[key].type }</Text>
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

export default connect(state => { return ({ accounts: state.accounts, ui: state.ui }); })(Home);

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
	}
});