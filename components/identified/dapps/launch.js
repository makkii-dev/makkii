import * as React from 'react';
import {View, Text, Image, StyleSheet, Button} from 'react-native'
import {connect} from "react-redux";
class Launch extends React.Component{
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('title', 'Dapps'),
        headerTitleStyle: {
            alignSelf: "center",
            textAlign: "center",
            flex:1
        },
        headerRight: (<View></View>)

    });
    constructor(props) {
        super(props);
        this.dapp = this.props.navigation.state.params.dapp;
        console.log('title: '+this.dapp.name);
        console.log('logo uri: '+this.dapp.logo);
        console.log('description: '+ this.dapp.description);
    };
    _onPress(){
        console.log('launch ');
        this.props.navigation.navigate('DappsSingle',{
            uri: this.dapp.uri,
        });
    }
    render(){
        return (
            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <View style={styles.ImgContainer}>
                        <Image source={{uri: this.dapp.logo}} style={{flex:1}}/>
                    </View>
                    <View style={styles.dappContainer}>
                        <Text style={styles.dappName}>{this.dapp.name}</Text>
                        <Button
                            title='Launch'
                            onPress={this._onPress.bind(this)}
                            color='green'
                            raised='true'
                        />
                    </View>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>{this.dapp.description}</Text>
                </View>
            </View>
        )
    }
}

export default connect(state => { return ({ dapps: state.dapps }); })(Launch);

const styles = StyleSheet.create({
   container: {
       flex: 1,
       flexDirection: 'column',
    },
    subContainer: {
        flex:1,
        flexDirection: 'row',
        padding: 10,
    },
    ImgContainer:{
        flex: 2,
        padding:10,
        aspectRatio:1,
    },
    dappContainer:{
        flex: 3,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
    },
    dappName:{
      flex:1,
      fontSize:20,
    },
    descriptionContainer: {
        flex: 2,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
    },
    description:{
        flex:1,
        borderColor: 'gold',
        borderWidth: 1,
        padding: 20,
        fontSize:15,
    }
});