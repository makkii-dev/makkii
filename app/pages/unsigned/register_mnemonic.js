import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Dimensions, NativeModules, Platform, NativeEventEmitter, TouchableOpacity } from 'react-native';
import screenshotHelper from 'react-native-screenshot-helper';
import { ComponentButton, MnemonicView } from '../../components/common';
import { strings } from '../../../locales/i18n';
import defaultStyles from '../../styles';
import { mainBgColor } from '../../style_util';
import { AppToast } from '../../components/AppToast';
import { createAction } from '../../../utils/dva';

const { width } = Dimensions.get('window');

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);

class Mnemonic extends Component {
    static navigationOptions = ({ navigation }) => {
        const backUpLater = navigation.getParam('backupLater', () => {});
        return {
            title: strings('unsigned_register_mnemonic.title'),
            headerLeft: <View />,
            headerRight: (
                <TouchableOpacity
                    onPress={() => {
                        backUpLater();
                    }}
                    style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: 'white' }}>{strings('backup.button_backup_later')}</Text>
                </TouchableOpacity>
            ),
        };
    };

    async componentDidMount() {
        this.props.navigation.setParams({
            backupLater: this.backupLater,
        });
        if (Platform.OS === 'android') {
            screenshotHelper.disableTakeScreenshot();
        } else {
            this.subscription = NativeModule.addListener('screenshot_taken', () => {
                AppToast.show(strings('toast_mnemonic_share_warning'), {
                    duration: AppToast.durations.LONG,
                    position: AppToast.positions.CENTER,
                });
            });
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            screenshotHelper.enableTakeScreenshot();
        } else {
            this.subscription.remove();
        }
    }

    renderMnemonic = () => {
        const mnemonic = this.props.navigation.getParam('mnemonic', '');
        return mnemonic.split(' ').map(str => {
            return <MnemonicView key={str} canDelete={false} disabled onSelected={() => {}} text={str} />;
        });
    };

    toBackup = () => {
        const { navigation } = this.props;
        navigation.navigate('signed_backup_tips');
    };

    backupLater = () => {
        this.props.dispatch(createAction('userModel/login')());
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    padding: 40,
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 16,
                        marginBottom: 20,
                    }}
                >
                    {strings('unsigned_register_mnemonic.hint')}
                </Text>
                <View
                    style={{
                        ...defaultStyles.shadow,
                        padding: 10,
                        borderRadius: 5,
                        height: 130,
                        backgroundColor: 'white',
                        width: width - 80,
                        marginBottom: 100,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                    }}
                >
                    {this.renderMnemonic()}
                </View>
                <ComponentButton style={{ width: width - 80 }} title={strings('backup.button_backup_now')} onPress={this.toBackup} />
            </View>
        );
    }
}

const mapToState = ({ userModel }) => ({
    mnemonic: userModel.mnemonic,
});

export default connect(mapToState)(Mnemonic);
