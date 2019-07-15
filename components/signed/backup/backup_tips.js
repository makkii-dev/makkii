import * as React from 'react';
import {Dimensions, Image, View, Text, ScrollView} from 'react-native';
import {mainBgColor} from '../../style_util';
import {strings} from "../../../locales/i18n";
import defaultStyles from "../../styles";
import {CheckBox} from "../../checkBox";
import {ComponentButton} from "../../common";

const {width} = Dimensions.get('window');
const TIPS = [
    {
        title: strings('backUp.title_backup_mnemonic'),
        details: strings('backUp.label_backup_mnemonic'),
    },
    {
        title: strings('backUp.title_offline_storage'),
        details: strings('backUp.label_offline_storage'),
    },
    {
        title: strings('backUp.title_dont_take_screenShot'),
        details: strings('backUp.label_dont_take_screenShot'),
    }
];


export default class BackUpTips extends React.Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: strings('backUp.title_backup_tips')
        })
    };
    state={
        understand: false
    };
    renderContent = ({title, details})=>{
        return (
            <View style={styles.contentContainer}>
                <Text style={{fontWeight: 'bold', color:'#000'}}>{"•\t\t\t"+title}</Text>
                <Text style={{marginLeft:20, color:'#000'}}>{details}</Text>
            </View>
        )
    };
    handleAgree = (v)=>{
        this.setState({
            understand:v,
        })
    };
    toNext =()=>{

    };

    render(){
        return(
            <View style={{
                flex:1,
                backgroundColor:mainBgColor,
                alignItems:'center'}}>
                    <View style={styles.container}>
                        <Text>{strings('backUp.label_warning_mnemonic')}</Text>
                        <Image source={require('../../../assets/icon_safety.png')} style={{width:50, height:50, marginVertical:20}} resizeMode={'contain'}/>
                        {this.renderContent(TIPS[0])}
                        {this.renderContent(TIPS[1])}
                        {this.renderContent(TIPS[2])}
                        <CheckBox
                            style={{marginLeft:30,width:'100%'}}
                            onCheck={()=>this.handleAgree(true)}
                            onUncheck={()=>this.handleAgree(false)}
                            imageStyle={{width:24,height:24}}
                            textRight={(
                                <Text>{strings('backUp.label_understand')}</Text>
                            )}
                        />
                    </View>
                <ComponentButton
                    style={{width:width-40}}
                    disabled={!this.state.understand}
                    onPress={this.toNext}
                    title={strings('backUp.button_next')}
                />
            </View>
        )
    }
}


const styles = {
    container:{
        ...defaultStyles.shadow,
        alignItems:'center',
        marginVertical:30,
        padding:10,
        width: width-40,
        borderRadius: 10,
        backgroundColor: 'white',

    },
    contentContainer:{
        marginVertical:5,
    },
};