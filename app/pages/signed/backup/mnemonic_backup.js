import * as React from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    Platform,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import screenshotHelper from 'react-native-screenshot-helper';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { ComponentButton, MnemonicView } from '../../../components/common';
import { AppToast } from '../../../components/AppToast';

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const { width } = Dimensions.get('window');

class MnemonicBackUp extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('backup.title_backup_mnemonic'),
        };
    };

    componentDidMount() {
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

    nextStep = () => {
        const { navigation } = this.props;
        const mnemonic = navigation.getParam('mnemonic', '');
        const targetRoute = navigation.getParam('targetRoute');
        navigation.navigate('signed_confirm_mnemonic', { targetRoute, mnemonic });
    };

    renderMnemonic = () => {
        const mnemonic = this.props.navigation.getParam('mnemonic', '');
        return mnemonic.split(' ').map(str => {
            return (
                <MnemonicView
                    key={str}
                    canDelete={false}
                    disabled
                    onSelected={() => {}}
                    text={str}
                />
            );
        });
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
                    <Text>{strings('backup.label_header_backup_mnemonic')}</Text>
                    <Image
                        source={require('../../../../assets/icon_backup_mnemonic.png')}
                        style={{ width: 40, height: 40, marginVertical: 10 }}
                        resizeMode="contain"
                    />
                    <View style={styles.MnemonicContainer}>{this.renderMnemonic()}</View>
                    <Text>{strings('backup.label_footer_backup_mnemonic')}</Text>
                </View>
                <ComponentButton
                    style={{ width: width - 40 }}
                    onPress={this.nextStep}
                    title={strings('backup.button_next')}
                />
            </View>
        );
    }
}

export default connect()(MnemonicBackUp);

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
    MnemonicContainer: {
        margin: 10,
        width: width - 60,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: mainBgColor,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
};
