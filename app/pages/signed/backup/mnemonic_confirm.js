import * as React from 'react';
import { connect } from 'react-redux';
import { Dimensions, Image, NativeEventEmitter, NativeModules, Platform, Text, View } from 'react-native';
import screenshotHelper from 'react-native-screenshot-helper';
import defaultStyles from '../../../styles';
import { mainBgColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';
import { ComponentButton, MnemonicView } from '../../../components/common';
import { AppToast } from '../../../components/AppToast';
import { createAction } from '../../../../utils/dva';
import { range } from '../../../../utils';

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const { width } = Dimensions.get('window');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
}

class MnemonicConfirm extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('backup.title_confirm_mnemonic'),
        };
    };

    state = {
        toBeSelected: shuffle(range(0, 12, 1)),
        selected: [],
        error: false,
        confirmed: false,
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

    renderSelected = () => {
        const { selected } = this.state;
        const mnemonic = this.props.navigation.getParam('mnemonic', '').split(/\s+/);
        const mnemonicView = selected.map(index => {
            return <MnemonicView key={`${index}`} canDelete disabled={false} onSelected={() => this.onDelete(index)} text={mnemonic[index]} />;
        });
        const height = Math.max(2, Math.max(2, Math.ceil(selected.length / 4))) * 35 + 20;

        return <View style={{ ...styles.MnemonicContainerWithBorder, height }}>{mnemonicView}</View>;
    };

    renderToBeSelected = () => {
        const { toBeSelected } = this.state;
        const mnemonic = this.props.navigation.getParam('mnemonic', '').split(/\s+/);
        const mnemonicView = toBeSelected.map(index => {
            return <MnemonicView key={`${index}`} color="white" canDelete={false} disabled={false} onSelected={() => this.onSelected(index)} text={mnemonic[index]} />;
        });
        const height = Math.max(2, Math.max(2, Math.ceil(toBeSelected.length / 4))) * 35 + 20;
        return <View style={{ ...styles.MnemonicContainer, height }}>{mnemonicView}</View>;
    };

    onSelected = item => {
        const { toBeSelected, selected } = { ...this.state };
        toBeSelected.remove(item);
        selected.push(item);
        const res = this.checkSelected(selected);
        this.setState({
            toBeSelected,
            selected,
            error: !res,
            confirmed: res && selected.length === 12,
        });
    };

    onDelete = item => {
        const { toBeSelected, selected } = { ...this.state };
        selected.remove(item);
        toBeSelected.push(item);
        const res = this.checkSelected(selected);
        this.setState({
            toBeSelected,
            selected,
            error: !res,
            confirmed: res && selected.length === 12,
        });
    };

    onFinish = () => {
        const { navigation, dispatch } = this.props;
        const targetRoute = navigation.getParam('targetRoute');
        dispatch(createAction('userModel/backupFinish')());
        AppToast.show(strings('backup.toast_backup_succeed'), {
            onHidden: () => {
                if (targetRoute) {
                    navigation.navigate(targetRoute);
                } else {
                    dispatch(createAction('userModel/login')());
                }
            },
        });
    };

    checkSelected = selected => {
        const mnemonic = this.props.navigation.getParam('mnemonic', '');
        const selectedStr = selected.map(index => mnemonic.split(/\s+/)[index]).join(' ');
        return selectedStr === mnemonic.substr(0, selectedStr.length);
    };

    render() {
        const { confirmed, error } = this.state;
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                }}
            >
                <View style={styles.container}>
                    <Text>{strings('backup.label_header_confirm_mnemonic')}</Text>
                    <Image source={require('../../../../assets/icon_confirm_mnemonic.png')} style={{ width: 40, height: 40, marginVertical: 10 }} resizeMode="contain" />
                    <Text
                        style={{
                            ...styles.WarningText,
                            backgroundColor: error ? '#FFCC33' : 'transparent',
                        }}
                    >
                        {error ? strings('backup.label_warning_incorrect_mnemonic') : null}
                    </Text>
                    {this.renderSelected()}
                    {this.renderToBeSelected()}
                </View>
                <ComponentButton disabled={!confirmed} style={{ width: width - 40 }} onPress={this.onFinish} title={strings('backup.button_finish')} />
            </View>
        );
    }
}

export default connect()(MnemonicConfirm);

const styles = {
    container: {
        ...defaultStyles.shadow,
        alignItems: 'center',
        marginVertical: 30,
        padding: 10,
        width: width - 40,
        height: 350,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    MnemonicContainerWithBorder: {
        marginTop: 10,
        width: width - 60,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: mainBgColor,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    MnemonicContainer: {
        marginTop: 10,
        width: width - 60,
        paddingVertical: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    WarningText: {
        backgroundColor: '#FFCC33',
        color: 'black',
        padding: 2,
        fontSize: 12,
        borderRadius: 5,
    },
};
