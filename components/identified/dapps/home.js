import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text, View, TouchableOpacity, Image, FlatList,  StyleSheet, Dimensions, PixelRatio} from 'react-native';

const {width} = Dimensions.get('window');
class Home extends Component {
	static navigationOptions = ({ navigation }) => ({
		title: navigation.getParam('title', 'Dapps'),
		headerTitleStyle:{
			alignSelf: 'center',
			textAlign: 'center',
			flex: 1,
		}
	});
	constructor(props){
		super(props);
	}

	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.dapps);
	}
	render(){
		return (
			<View style={{flex:1}}>
				<FlatList
					data={this.props.dapps}
					renderItem={this._renderItem}
					keyExtractor={this._keyExtractor}
				/>

			</View>
		);
	}

	_renderItem = (data)=>{
		return (
			<View>
				<TouchableOpacity
					onPress={()=>{
						this.props.navigation.navigate('DappsLaunch',{
							'title': data.item.name,
							'dapp': data.item,
						})
					}}
				>
					<View style={styles.listItemContainer}>
						<Image source={{uri: data.item.logo}} style={{width: 40, height: 40}}/>
						<View style={styles.listItemTextContainer}>
							<Text numberOfLines={1}>{data.item.name}</Text>
						</View>
					</View>
				</TouchableOpacity>
				<View style={styles.divider}/>
			</View>
		)
	};
	_keyExtractor=(item,index)=> index.toString();
}


export default connect(state => { return ({ dapps: state.dapps }); })(Home);

const styles = StyleSheet.create({
	divider: {
		width: width,
		height: 1 / PixelRatio.get(),
		backgroundColor: '#000000'
	},
	listItemContainer: {
		flexDirection: 'row',
		width: width,
		paddingLeft: 15,
		paddingRight: 15,
		paddingTop: 10,
		paddingBottom: 10,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
	},
	listItemTextContainer: {
		flexDirection: 'column',
		flex: 1,
		paddingLeft: 15,
	}
});