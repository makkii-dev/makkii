import React from 'react';
import {
    View,
    TextInput,
    StyleSheet, Dimensions, Text, TouchableOpacity, Keyboard, DeviceEventEmitter
} from 'react-native';
import {RightActionButton} from "../../common";
import {strings} from "../../../locales/i18n";
import {update_account_name} from "../../../actions/accounts";
import {connect} from "react-redux";
import {mainBgColor, mainColor} from '../../style_util';
import Toast from "react-native-root-toast";
import {strLen} from "../../../utils";
const {width} = Dimensions.get('window');

class ChangeAccountNameScreen extends  React.Component {
    static navigationOptions = ({ navigation }) => {
        const updateAccountName =  navigation.getParam('updateAccountName', ()=>{});
        const isEdited = navigation.getParam('isEdited', false);
        return ({
            title: strings('change_account_name.title'),
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        updateAccountName();
                    }}
                    disabled={!isEdited}
                >
                </RightActionButton>
            )
        })
    };

    constructor(props){
        super(props);
        const {navigation} = this.props;
        this.addr=navigation.getParam('address');
        this.onUpdateFinish = navigation.getParam('onUpdateFinish',()=>{});
        this.account = this.props.accounts[this.addr];
        this.state={
            textValue: this.account.name
        };
        navigation.setParams({
            updateAccountName:this.updateAccountName,
        })
    }
    updateAccountName=()=>{
        Keyboard.dismiss();
        const {dispatch, navigation} = this.props;
        const {textValue} = this.state;
        const key = this.account.address;
        dispatch(update_account_name(key,textValue,this.props.user.hashed_password));
        AppToast.show(strings('toast_update_success'), {
            position: Toast.positions.CENTER,
            onHidden: () => {
                this.onUpdateFinish();
                navigation.goBack();
            }
        });
    };

    onChangeText = (text) => {
        const {navigation} = this.props;
        if (strLen(text) <= 15) {
            this.setState({
                textValue: text,
            }, () => {
                navigation.setParams({
                    isEdited: this.state.textValue !== this.account.name
                })
            })
        }else {
            AppToast.show(
                strings('account_name_hint'),
                {
                    position:Toast.positions.CENTER,
                });
        }
    };

    render(){
        const {textValue} = this.state;
        return(
            <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={()=>{Keyboard.dismiss()}}>
                <View style={styles.container}>
                    <TextInput
                        style={styles.textInputStyle}
                        value={textValue}
                        multiline={false}
                        autoFocus
                        onChangeText={this.onChangeText}
                    />
                    <Text style={styles.labelStyle}>{strings('account_name_hint')}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

export default connect(state => {
    return ({
        accounts: state.accounts,
        user: state.user,
    });
})(ChangeAccountNameScreen);

const styles=StyleSheet.create({
    container:{
        flex:1, paddingTop:20,
        paddingHorizontal:20,
        backgroundColor:mainBgColor
    },
    textInputStyle:{
        width:width-40,
        height:40,
        borderBottomWidth:1,
        borderColor:mainColor,
        paddingVertical:0,
        paddingHorizontal:5,
        color:'#000',
        fontSize: 16,
    },
    labelStyle:{
        marginTop:10,
        paddingHorizontal:5,
        color:'gray',
        fontSize:12,
    }
});
