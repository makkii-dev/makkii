import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, Button, Text, TouchableOpacity, TouchableHighlight, StyleSheet, Modal, } from 'react-native';
import { account } from '../../../actions/account.js';
import { ui } from '../../../actions/ui.js';

const styles = StyleSheet.create({
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

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    console.log(state);
	    return {
	        title: state.params ? state.params.title : '',
	        headerStyle: styles.headerStyle,
	        headerRight: 
	        	<TouchableOpacity
	        		onPress={e => {
	        			state.params.toggle();
	        		}}
	        	>
		        	<View style={{
							top: 0,
							right: 10,
							borderWidth: 1,
							borderColor: 'grey',
							width: 20,
							height: 20,
							borderRadius: 30,
						}}
					>
						<Text style={{
							fontSize: 20,
							lineHeight: 21,
							textAlign: 'center',
							color: 'grey',
						}}>+</Text>
					</View>
				</TouchableOpacity>
	    };
    };
	constructor(props){
		super(props);
		this.state = {
			show: false
		};
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(Object.keys(this.props.accounts).length);
		const { dispatch } = this.props;
		let parent = this;
		this.props.navigation.setParams({
            title: 'Total: 0',
            toggle: function(){
            	console.log('wocaocao');
            	console.log(parent.props.ui);
            	dispatch(ui({
            		show: !parent.props.ui.show
            	}));
            }
        });
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View>
				<Modal
					animationType="slide"
					transparent={ false }
					visible={ this.props.ui.show }
					style={{
						flex: 1, 
						justifyContent: "center", 
						alignItems: "center",
						height: '100%',
					    bottom: 0,
					    left: 0,
					    right: 0,
					    top: 0
					}}
					onRequestClose={() => {
						console.log('modal close');
					}}
				>

					<View style={{
						//backgroundColor: 'grey',
					}}>
						<Button
							title="Import from private key" 
							onPress={e => {
									
							}} />
						<Button
							title="Import from ledger" 
							onPress={e => {

							}} />
						<Button
							title="Close" 
							onPress={e => {
								dispatch(ui({
									show: false
								}))
							}} />
					</View>
		        </Modal>
				<ScrollView 
					onScrollBeginDrag={e => {
						this.props.navigation.setParams({
							show: false
						});
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

// headerRight: 
// 	<View>
// 	{
// 		state.params && state.params.show ? 
// 		(
// 			<View style={{
// 				borderWidth: 1,
// 				borderColor: 'grey',
// 				position: 'absolute',
// 				right: 0,
// 				top: 0,
// 				backgroundColor: '#ffffff',
// 				zIndex: 100,
// 			}}>	
// 				<View>
//     				<Text style={{
//     					paddingTop: 10,
//     					paddingLeft: 20,
//     					paddingRight: 20,
//     					paddingBottom: 10,
//     					borderBottomWidth: 1,
//     					borderColor: 'grey',
//     				}}>Import from: </Text>
// 				</View>
//   				<Button 
//   					title="test" 
//   					onPress={e => {
//   						console.log('here')
//   					}}
//   				/>
//   				<Button 
//   					title="test" 
//   					onPress={e => {
//   						console.log('here')
//   					}}
//   				/>
// 			</View>	
// 		) :
// 		(
// 			<TouchableOpacity
// 				onPress={e => {
// 					if (!state.params.show)
//         				navigation.setParams({
// 				            show: true
// 				        });
//     			}}
// 			>
// 				<Text style={{
//     				fontSize: 30,
//     				fontWeight: 'normal',
//     				width: 40,
//     				height: 40,
//     			}}>+</Text>
// 			</TouchableOpacity>	
// 		)
// 	}     
// 	</View>  