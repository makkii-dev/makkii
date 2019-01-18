import * as React from 'react';
import {View, Text, Image, StyleSheet, Button} from 'react-native'
import {connect} from "react-redux";
class Launch extends React.Component{
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('name', 'Dapps'),
        headerTitleStyle: {
            alignSelf: "center",
            textAlign: "center",
        },

    });
    constructor(props) {
        super(props);
        this.title = this.props.navigation.state.params.name;
        this.logoUri = this.props.navigation.state.params.logo;
        this.description = this.props.navigation.state.params.description;
        console.log('title: '+this.title);
        console.log('logo uri: '+this.logoUri);
        console.log('description: '+ this.description);
    };
    _onPress(){
        console.log('launch ');
    }
    render(){
        return (
            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <View style={styles.ImgContainer}>
                        <Image source={{uri: this.logoUri}} style={{width: 100, height: 100,}}/>
                    </View>
                    <View style={styles.dappContainer}>
                        <Text style={styles.dappName}>{this.title}</Text>
                        <Button title='Launch' onPress={this._onPress} color='green'/>
                    </View>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>{this.description}</Text>
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
    },
    ImgContainer:{
        flex: 2,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
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
        borderColor: 'black',
        borderWidth: 1,
        padding: 20,
        fontSize:15,
    }
});