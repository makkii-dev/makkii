import * as React from 'react';
import { Dimensions, Image, View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { mainBgColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';
import defaultStyles from '../../../styles';
import CheckBox from '../../../components/CheckBox';
import { ComponentButton } from '../../../components/common';
import { createAction, popCustom } from '../../../../utils/dva';

const { width } = Dimensions.get('window');
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
    },
];

class BackUpTips extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const goBack = navigation.getParam('goBack', () => {});
        return {
            title: strings('backup.title_backup_tips'),
            headerLeft: (
                <TouchableOpacity
                    onPress={() => {
                        goBack();
                    }}
                    style={{
                        paddingLeft: 10,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: 'white' }}>{strings('cancel_button')}</Text>
                </TouchableOpacity>
            ),
        };
    };

    state = {
        understand: false,
    };

    componentWillMount(): void {
        this.props.navigation.setParams({
            goBack: this.onBack,
        });
        BackHandler.addEventListener('hardwareBackPress', this.onBack);
        this.props.dispatch(createAction('userModel/getMnemonic')()).then(mnemonic => (this.mnemonic = mnemonic));
    }

    componentWillUnmount(): void {
        BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    }

    onBack = () => {
        const { navigation, dispatch } = this.props;
        const targetRoute = navigation.getParam('targetRoute');
        const isFocused = this.props.navigation.isFocused();
        if (isFocused) {
            popCustom.show(strings('alert_title_warning'), strings('backup.label_give_up'), [
                {
                    text: strings('cancel_button'),
                    onPress: () => {},
                },
                {
                    text: strings('alert_ok_button'),
                    onPress: () => {
                        if (targetRoute) {
                            navigation.navigate(targetRoute);
                        } else {
                            dispatch(createAction('userModel/login')());
                        }
                    },
                },
            ]);
            return true;
        }
        return false;
    };

    renderContent = ({ title, details }) => {
        return (
            <View style={styles.contentContainer}>
                <Text style={{ marginLeft: 20, fontWeight: 'bold', color: '#000' }}>{`${strings(title)}`}</Text>
                <Text style={{ marginLeft: 20, color: '#000' }}>{strings(details)}</Text>
                <Text style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold', color: '#000' }}>•</Text>
            </View>
        );
    };

    handleAgree = v => {
        this.setState({
            understand: v,
        });
        return true;
    };

    nextStep = () => {
        const { navigation } = this.props;
        const targetRoute = navigation.getParam('targetRoute');
        navigation.navigate('signed_backup_mnemonic', { targetRoute, mnemonic: this.mnemonic });
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                }}
            >
                <View style={styles.container}>
                    <Text>{strings('backup.label_warning_mnemonic')}</Text>
                    <Image source={require('../../../../assets/icon_safety.png')} style={{ width: 40, height: 40, marginVertical: 10 }} resizeMode="contain" />
                    {this.renderContent(TIPS[0])}
                    {this.renderContent(TIPS[1])}
                    {this.renderContent(TIPS[2])}
                    <CheckBox
                        style={{ marginLeft: 30, width: '100%' }}
                        onCheck={() => this.handleAgree(true)}
                        onUncheck={() => this.handleAgree(false)}
                        imageStyle={{ width: 24, height: 24 }}
                        textRight={<Text>{strings('backup.label_understand')}</Text>}
                    />
                </View>
                <ComponentButton style={{ width: width - 40 }} disabled={!this.state.understand} onPress={this.nextStep} title={strings('backup.button_next')} />
            </View>
        );
    }
}
export default connect()(BackUpTips);

const styles = {
    container: {
        ...defaultStyles.shadow,
        alignItems: 'center',
        marginVertical: 30,
        padding: 10,
        width: width - 40,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    contentContainer: {
        marginVertical: 5,
    },
};
