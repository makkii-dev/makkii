import React from 'react';
import {
    View,
    Dimensions,
    Text,
    Switch,
    TouchableOpacity,
    Image
} from 'react-native';
import {connect} from "react-redux";
import {strings} from "../../../locales/i18n";
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';

const {width} = Dimensions.get('window');


class PinCode extends React.Component {

    static navigationOptions=({navigation})=>{
          return({
              title:  strings('pinCode.title'),
          })
    };
    constructor(props){
        super(props);
        const {pinCodeEnabled}  = this.props.setting;
        this.state={
            pinCodeDisabled:pinCodeEnabled||false
        }
    }
    handleToggleSwitch(){
        this.setState({
            pinCodeEnabled: !this.state.pinCodeEnabled
        },()=>{

        })
    }

    render(){
        const {navigate} = this.props.navigation;
        return (
            <View style={{flex:1, backgroundColor:mainBgColor,alignItems:'center'}}>
                <View style={{...defaultStyles.shadow,width: width-40,  height:50,backgroundColor:'#fff',
                    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                    paddingHorizontal: 20, marginTop: 20, borderRadius:5,
                }}>
                    <Text>{strings('pinCode.switch_button')}</Text>
                    <Switch
                        value={this.state.pinCodeEnabled}
                        onValueChange={()=>this.handleToggleSwitch()}
                    />
                </View>
                <TouchableOpacity
                    onPress={()=>{
                        navigate('unlock',{
                            isModifyPinCode:true,
                            onUnlockSuccess:()=>{
                                navigate('signed_setting_pinCode');
                            }
                        })
                    }}
                >
                    <View style={{...defaultStyles.shadow,width: width-40,  height:50,backgroundColor:'#fff',
                        flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                        paddingHorizontal: 20, marginTop: 20, borderRadius:5,
                    }}>
                        <Text>{strings('pinCode.modify_button')}</Text>
                        <Image source={require('../../../assets/arrow_right.png')} style={{width:20,height:20}} resizeMode={'contain'}/>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

export default connect( state => {
    return {
        setting: state.setting,
    };
})(PinCode);
