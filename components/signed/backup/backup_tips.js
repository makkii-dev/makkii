import * as React from 'react';
import {Dimensions, Image, View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {mainBgColor} from '../../style_util';
import {strings} from "../../../locales/i18n";
import defaultStyles from "../../styles";
import {CheckBox} from "../../checkBox";
import {ComponentButton} from "../../common";
import {createAction} from "../../../utils/dva";
import {connect} from "react-redux";

const {width} = Dimensions.get('window');
const TIPS = [
    {
        title: 'backup.title_backup_mnemonic',
        details: 'backup.label_backup_mnemonic',
    },
    {
        title: 'backup.title_offline_storage',
        details: 'backup.label_offline_storage',
    },
    {
        title: 'backup.title_dont_take_screenShot',
        details: 'backup.label_dont_take_screenShot',
    }
];

class BackUpTips extends React.Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: strings('backup.title_backup_tips'),
        })
    };
    state={
        understand: false
    };

    componentWillMount(): void {
        this.props.dispatch(createAction('userModel/getMnemonic')())
            .then(mnemonic=>this.mnemonic = mnemonic)
    }

    renderContent = ({title, details})=>{
        return (
            <View style={styles.contentContainer}>
                <Text style={{fontWeight: 'bold', color:'#000'}}>{"•\t\t\t"+strings(title)}</Text>
                <Text style={{marginLeft:20, color:'#000'}}>{strings(details)}</Text>
            </View>
        )
    };
    handleAgree = (v)=>{
        this.setState({
            understand:v,
        })
    };
    nextStep =()=>{
        const {navigation} = this.props;
        const targetRoute = navigation.getParam('targetRoute');
        navigation.navigate('signed_backup_mnemonic', {targetRoute, mnemonic:this.mnemonic});
    };

    render(){
        return(
            <View style={{
                flex:1,
                backgroundColor:mainBgColor,
                alignItems:'center'}}>
                    <View style={styles.container}>
                        <Text>{strings('backup.label_warning_mnemonic')}</Text>
                        <Image source={require('../../../assets/icon_safety.png')} style={{width:40, height:40, marginVertical:10}} resizeMode={'contain'}/>
                        {this.renderContent(TIPS[0])}
                        {this.renderContent(TIPS[1])}
                        {this.renderContent(TIPS[2])}
                        <CheckBox
                            style={{marginLeft:30,width:'100%'}}
                            onCheck={()=>this.handleAgree(true)}
                            onUncheck={()=>this.handleAgree(false)}
                            imageStyle={{width:24,height:24}}
                            textRight={(
                                <Text>{strings('backup.label_understand')}</Text>
                            )}
                        />
                    </View>
                <ComponentButton
                    style={{width:width-40}}
                    disabled={!this.state.understand}
                    onPress={this.nextStep}
                    title={strings('backup.button_next')}
                />
            </View>
        )
    }
}
export default connect()(BackUpTips);


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