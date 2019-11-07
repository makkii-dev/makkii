import React, { Component } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, ActivityIndicator, PixelRatio, Dimensions, Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import styles from '../styles';
import { strings } from '../../locales/i18n';
import { mainColor, mainColorAlpha, fontColor, rightBtnColorDisable, rightBtnColorEnable, linkButtonColor } from '../style_util';
import { formatAddress1Line } from '../../client/api';
import { AppToast } from './AppToast';
import { popCustom } from '../../utils/dva';

const { width } = Dimensions.get('window');

class ComponentTabBar extends Component {
    static defaultProps = {
        activeTintColor: mainColor,
        inactiveTintColor: '#adb0b5',
    };

    static propTypes = {
        activeTintColor: PropTypes.string,
        inactiveTintColor: PropTypes.string,
        active: PropTypes.string.isRequired,
    };

    render() {
        const walletTintColor = this.props.active === 'wallet' ? this.props.activeTintColor : this.props.inactiveTintColor;
        const dappTintColor = this.props.active === 'dapp' ? this.props.activeTintColor : this.props.inactiveTintColor;
        const settingsTintColor = this.props.active === 'settings' ? this.props.activeTintColor : this.props.inactiveTintColor;
        return (
            <View style={{ ...this.props.style }}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        width: 80,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this.props.onPress[0]();
                    }}
                >
                    <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/tab_wallet.png')}
                            style={{
                                width: 24,
                                height: 24,
                                marginTop: 2,
                                opacity: 0.6,
                                tintColor: walletTintColor,
                            }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 8, color: walletTintColor }}>{strings('menuRef.title_wallet')}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        width: 60,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this.props.onPress[1]();
                    }}
                >
                    <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/tab_app.png')}
                            style={{
                                width: 24,
                                height: 24,
                                marginTop: 2,
                                opacity: 0.6,
                                tintColor: dappTintColor,
                            }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 8, color: dappTintColor }}>{strings('menuRef.title_dapps')}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        width: 80,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this.props.onPress[2]();
                    }}
                >
                    <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/tab_settings.png')}
                            style={{
                                width: 24,
                                height: 24,
                                marginTop: 2,
                                opacity: 0.6,
                                tintColor: settingsTintColor,
                            }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 8, color: settingsTintColor }}>{strings('menuRef.title_settings')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

class OptionButton extends Component {
    static defaultProps = {
        selected: false,
    };

    render() {
        const borderColor = this.props.selected ? mainColor : 'gray';
        const fontColor = this.props.selected ? mainColor : 'black';
        const backgroundColor = this.props.selected ? mainColorAlpha : 'transparent';
        return (
            <TouchableOpacity
                style={{
                    ...this.props.style,
                    borderWidth: 1 / PixelRatio.get(),
                    borderColor,
                    backgroundColor,
                    borderRadius: 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={this.props.onPress}
            >
                <Text style={{ textAlign: 'center', color: fontColor }} numberOfLines={1}>
                    {this.props.title}
                </Text>
            </TouchableOpacity>
        );
    }
}

class ComponentLogo extends Component {
    render() {
        return (
            <Image
                style={{
                    ...this.props.style,
                    width: 50,
                    height: 50,
                }}
                resizeMode="contain"
                source={require('../../assets/logo_app.png')}
            />
        );
    }
}

class Input extends Component {
    static defaultProps = {
        supportVisibility: true,
    };

    render() {
        return (
            <View>
                <TextInput
                    style={styles.input.text_input}
                    onChangeText={val => {
                        this.props.onChange(val);
                    }}
                    value={this.props.value}
                />
                {this.props.supportVisibility && (
                    <Text
                        style={styles.input.text}
                        onPress={e => {
                            this.props.onClear(e);
                        }}
                    >
                        CLR
                    </Text>
                )}
            </View>
        );
    }
}

class InputMultiLines extends Component {
    static defaultProps = {
        numberOfLines: 4,
        borderRadius: 0,
        value: '',
        editable: true,
    };

    render() {
        return (
            <TextInput
                style={{
                    ...this.props.style,
                }}
                editable={this.props.editable}
                numberOfLines={this.props.numberOfLines}
                multiline
                value={this.props.value}
                onChangeText={this.props.onChangeText}
            />
        );
    }
}

class ImportListFooter extends React.PureComponent {
    static defaultProps = {
        hasSeparator: true,
    };

    render() {
        if (this.props.footerState === 1) {
            return (
                <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-start' }}>
                    {this.props.hasSeparator ? <View style={{ backgroundColor: 'lightgray', height: 1 / PixelRatio.get() }} /> : null}
                    <Text style={{ color: '#000', fontSize: 14, marginVertical: 5 }}>{strings('no_more_data_label')}</Text>
                </View>
            );
        }
        if (this.props.footerState === 2) {
            return (
                <View>
                    {this.props.hasSeparator ? <View style={{ backgroundColor: 'lightgray', height: 1 / PixelRatio.get() }} /> : null}
                    <View style={styles.ImportList.footer}>
                        <ActivityIndicator style={{ paddingRight: 10 }} />
                        <Text style={{ color: '#000', fontSize: 14 }}>{strings('fetch_data_label')}</Text>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.ImportList.footer}>
                <Text />
            </View>
        );
    }
}

class SubTextInput extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        rightView: PropTypes.func,
        unit: PropTypes.string,
        changeUnit: PropTypes.func,
    };

    render() {
        return (
            <View
                style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: width - 100,
                    flex: 1,
                    marginVertical: 10,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        height: 20,
                        flex: 1,
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', flex: 1 }}>{this.props.title}</Text>
                    {this.props.rightView && this.props.rightView()}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                        flex: 1,
                    }}
                >
                    <TextInput {...this.props} />
                    {this.props.unit !== undefined && this.props.changeUnit === undefined && <Text style={{ fontSize: 12, marginLeft: 10 }}>{this.props.unit}</Text>}
                    {this.props.unit !== undefined && this.props.changeUnit !== undefined && (
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={this.props.changeUnit}
                        >
                            <Text style={{ fontSize: 12, marginLeft: 10, color: linkButtonColor }}>{this.props.unit}</Text>
                            <Image source={require('../../assets/icon_expand.png')} style={{ width: 20, height: 20, tintColor: linkButtonColor }} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}

class TransactionItemCell extends React.PureComponent {
    static propTypes = {
        rightView: PropTypes.func,
        valueTextAlign: PropTypes.string.isRequired,
        titleStyle: PropTypes.object,
    };

    static defaultProps = {
        valueTextAlign: 'right',
    };

    render() {
        return (
            <View
                style={{
                    backgroundColor: '#fff',
                    padding: 10,
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    ...this.props.style,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        width: '100%',
                        height: 20,
                    }}
                >
                    <Text style={this.props.titleStyle || { fontSize: 16, fontWeight: 'bold', color: '#000' }}>{this.props.title}</Text>
                    {this.props.rightView && this.props.rightView()}
                </View>
                {this.props.children}
                {this.props.children ? null : (
                    <TextInput
                        style={{
                            width: '100%',
                            borderBottomColor: '#000',
                            borderBottomWidth: 1 / PixelRatio.get(),
                            textAlign: this.props.valueTextAlign,
                            paddingBottom: 5,
                            color: 'gray',
                        }}
                        editable={false}
                        multiline
                    >
                        {this.props.value}
                    </TextInput>
                )}
            </View>
        );
    }
}

// ======================== v2 ========================================
const Visible = () => <Image style={{ width: 20, height: 20, tintColor: mainColor }} source={require('../../assets/icon_visible.png')} />;
const Invisible = () => <Image style={{ width: 20, height: 20, tintColor: mainColor }} source={require('../../assets/icon_invisible.png')} />;

class RightActionButton extends Component {
    render() {
        const textColor = this.props.disabled ? rightBtnColorDisable : rightBtnColorEnable;
        return (
            <TouchableOpacity onPress={this.props.onPress} disabled={this.props.disabled}>
                <View style={{ marginRight: 20 }}>
                    <Text
                        style={{
                            color: textColor,
                            fontWeight: 'bold',
                        }}
                    >
                        {this.props.btnTitle ? this.props.btnTitle : strings('save_button')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}

class ComponentButton extends Component {
    static propTypes = {
        disabled: PropTypes.bool,
        title: PropTypes.string.isRequired,
        onPress: PropTypes.func.isRequired,
    };

    render() {
        return (
            <TouchableOpacity
                onPress={this.props.onPress}
                disabled={this.props.disabled || false}
                style={{
                    ...this.props.style,
                    backgroundColor: this.props.disabled ? 'lightgray' : mainColor,
                    borderRadius: 5,
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        paddingTop: 10,
                        paddingBottom: 10,
                        width: '100%',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: 18,
                    }}
                >
                    {this.props.title}
                </Text>
            </TouchableOpacity>
        );
    }
}

class PasswordInputWithTitle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            secure: true,
        };
    }

    render() {
        return (
            <View>
                <Text
                    style={{
                        marginBottom: 5,
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}
                >
                    {this.props.title}
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center',
                    }}
                >
                    <TextInput
                        style={{
                            fontSize: 16,
                            color: fontColor,
                            fontWeight: 'normal',
                            lineHeight: 20,
                            height: 50,
                            paddingRight: 45,
                            borderColor: 'lightgray',
                            borderBottomWidth: 1,
                            flex: 1,
                        }}
                        placeholder={this.props.placeholder}
                        onChangeText={e => {
                            this.props.onChange(e);
                        }}
                        onBlur={() => {
                            this.setState({
                                secure: true,
                            });
                        }}
                        secureTextEntry={this.state.secure}
                        value={this.props.value}
                    />
                    <TouchableOpacity
                        style={styles.password.display}
                        onPress={() => {
                            this.setState({
                                secure: !this.state.secure,
                            });
                        }}
                    >
                        {this.state.secure ? <Invisible /> : <Visible />}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

class PasswordInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            secure: true,
        };
    }

    render() {
        return (
            <View style={styles.password.view}>
                <Image
                    style={{
                        width: 20,
                        height: 20,
                        position: 'absolute',
                        left: 0,
                    }}
                    resizeMode="contain"
                    source={require('../../assets/icon_password.png')}
                />
                <TextInput
                    style={styles.password.text_input}
                    placeholder={this.props.placeholder}
                    onChangeText={e => {
                        this.props.onChange(e);
                    }}
                    onBlur={() => {
                        this.setState({
                            secure: true,
                        });
                    }}
                    secureTextEntry={this.state.secure}
                    value={this.props.value}
                />
                <TouchableOpacity
                    style={styles.password.display}
                    onPress={() => {
                        this.setState({
                            secure: !this.state.secure,
                        });
                    }}
                >
                    {this.state.secure ? <Invisible /> : <Visible />}
                </TouchableOpacity>
            </View>
        );
    }
}

class TextInputWithTitle extends Component {
    static defaultProps = {
        onFocus: () => {},
    };

    render() {
        return (
            <View>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                    <Text
                        style={{
                            marginBottom: 5,
                            fontSize: 16,
                            fontWeight: 'bold',
                        }}
                    >
                        {this.props.title}
                    </Text>
                    {this.props.rightView ? this.props.rightView() : null}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        height: this.props.height || 50,
                        alignItems: 'center',
                    }}
                >
                    <TextInput
                        multiline
                        style={{
                            fontSize: 16,
                            color: fontColor,
                            fontWeight: 'normal',
                            paddingRight: this.props.trailingText ? 45 : 0,
                            borderColor: 'lightgray',
                            borderBottomWidth: 1,
                            flex: 1,
                            paddingVertical: 10,
                        }}
                        placeholder={this.props.placeholder}
                        keyboardType={this.props.keyboardType}
                        onChangeText={e => {
                            this.props.onChange(e);
                        }}
                        onFocus={() => this.props.onFocus()}
                        value={this.props.value}
                    />
                    {this.props.trailingText ? <Text style={{ color: fontColor, fontSize: 16 }}>{this.props.trailingText}</Text> : null}
                </View>
            </View>
        );
    }
}

// eslint-disable-next-line camelcase
function alertOk(title, msg) {
    popCustom.show(title, msg, [
        {
            text: strings('alert_ok_button'),
            onPress: () => {},
        },
    ]);
}

class PendingComponent extends React.Component {
    static propTypes = {
        status: PropTypes.string.isRequired,
    };

    state = {
        waiting: 0,
    };

    componentWillMount() {
        this.mount = true;
        if (this.props.status === 'PENDING') {
            this.interval = setInterval(() => {
                const { waiting } = this.state;
                this.mount && this.setState({ waiting: (waiting + 1) % 5 });
            }, 500);
        }
    }

    componentWillUpdate(nextProps) {
        if (this.props.status !== nextProps.status) {
            if (nextProps.status === 'PENDING') {
                this.interval = setInterval(() => {
                    const { waiting } = this.state;
                    this.mount && this.setState({ waiting: (waiting + 1) % 5 });
                }, 500);
            }
        }
    }

    componentWillUnmount() {
        this.mount = false;
        this.interval && clearInterval(this.interval);
    }

    render() {
        if (this.props.status === 'FAILED' || this.props.status === 'CONFIRMED' || this.props.status === 'UNCONFIRMED') {
            return <Text style={{ textAlign: 'left' }}>{strings(`transaction_detail.${this.props.status}`)}</Text>;
        }
        const tail = '.'.repeat(this.state.waiting);
        return <Text style={{ textAlign: 'left' }}>{strings(`transaction_detail.${this.props.status}`) + tail}</Text>;
    }
}

class TransactionItem extends React.PureComponent {
    static propTypes = {
        transaction: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
        symbol: PropTypes.string.isRequired,
        isSender: PropTypes.bool.isRequired,
    };

    render() {
        const { transaction, onPress, isSender, symbol } = this.props;
        const timestamp = transaction.timestamp === undefined ? '' : new Date(transaction.timestamp).Format('yyyy/MM/dd hh:mm');
        let value;
        let valueColor;
        if (symbol !== 'BTC' && symbol !== 'LTC') {
            const m = new BigNumber(transaction.value).toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
            const fixed = Math.min(8, Math.max(0, (m[1] || '').length - m[2]));
            value = isSender ? `-${new BigNumber(transaction.value).toFixed(fixed)}` : `+${new BigNumber(transaction.value).toFixed(fixed)}`;
            valueColor = isSender ? 'red' : 'green';
        }

        return (
            <TouchableOpacity
                style={{
                    ...styles.shadow,
                    marginHorizontal: 20,
                    marginVertical: 10,
                    borderRadius: 10,
                    width: width - 40,
                    height: 80,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    padding: 10,
                }}
                onPress={onPress}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <Text>{timestamp}</Text>
                    <PendingComponent status={transaction.status} />
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                    }}
                >
                    <Text>{`${transaction.hash.substring(0, 16)}...`}</Text>
                    {value ? (
                        <Text style={{ color: valueColor }}>
                            {value} <Text>{symbol}</Text>
                        </Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    }
}

class AddressComponent extends Component {
    state = {
        showAllAddress: false,
    };

    static renderAddress66(address) {
        return (
            <View>
                <Text style={styles.addressFontStyle}>{`${address.substring(0, 4)} ${address.substring(4, 10)} ${address.substring(10, 16)} ${address.substring(16, 22)}`}</Text>
                <Text style={styles.addressFontStyle}>{`${address.substring(22, 26)} ${address.substring(26, 32)} ${address.substring(32, 38)} ${address.substring(38, 44)}`}</Text>
                <Text style={styles.addressFontStyle}>{`${address.substring(44, 48)} ${address.substring(48, 54)} ${address.substring(54, 60)} ${address.substring(60, 66)}`}</Text>
            </View>
        );
    }

    static renderAddress42(address) {
        return (
            <View>
                <Text style={styles.addressFontStyle}>
                    {`${address.substring(0, 4)} ${address.substring(4, 8)} ${address.substring(8, 12)} ${address.substring(12, 16)} ${address.substring(16, 21)}`}
                </Text>
                <Text style={styles.addressFontStyle}>
                    {`${address.substring(21, 25)} ${address.substring(25, 29)} ${address.substring(29, 33)} ${address.substring(33, 37)} ${address.substring(37, 42)}`}
                </Text>
            </View>
        );
    }

    render() {
        const { address, symbol } = this.props;
        let address1Line = address;
        try {
            address1Line = formatAddress1Line(symbol, address);
        } catch (err) {
            //
        }
        if (this.state.showAllAddress) {
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width,
                    }}
                >
                    {address.length === 66 ? (
                        AddressComponent.renderAddress66(address)
                    ) : address.length === 42 ? (
                        AddressComponent.renderAddress42(address)
                    ) : (
                        <Text style={styles.addressFontStyle}>{address}</Text>
                    )}
                    <View
                        style={{
                            marginHorizontal: 10,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                Clipboard.setString(address);
                                AppToast.show(strings('toast_copy_success'));
                            }}
                        >
                            <Image source={require('../../assets/icon_copy.png')} style={{ width: 20, height: 20 }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({ showAllAddress: false });
                            }}
                        >
                            <View
                                style={{
                                    height: 20,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 10,
                                    paddingHorizontal: 10,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={styles.addressFontStyle}>{strings('account_view.collapse_button')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width,
                }}
            >
                <Text style={styles.addressFontStyle}>{address1Line}</Text>
                <TouchableOpacity
                    onPress={() => {
                        Clipboard.setString(address);
                        AppToast.show(strings('toast_copy_success'));
                    }}
                >
                    <Image source={require('../../assets/icon_copy.png')} style={{ marginHorizontal: 10, width: 20, height: 20 }} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ showAllAddress: true });
                    }}
                >
                    <View
                        style={{
                            height: 24,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            paddingHorizontal: 5,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={styles.addressFontStyle}>{strings('account_view.show_all_button')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

class MnemonicView extends Component {
    static propTypes = {
        canDelete: PropTypes.bool.isRequired,
        disabled: PropTypes.bool.isRequired,
        onSelected: PropTypes.func.isRequired,
        text: PropTypes.string.isRequired,
        color: PropTypes.string,
    };

    render() {
        const { text, onSelected, color, canDelete, disabled } = this.props;
        return (
            <TouchableOpacity
                disabled={disabled}
                onPress={onSelected}
                activeOpacity={1}
                style={{
                    backgroundColor: color || 'lightgray',
                    marginHorizontal: 5,
                    marginVertical: 2,
                    padding: 5,
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 5,
                    height: 30,
                }}
            >
                <Text style={{ fontSize: 12 }}>{text}</Text>
                {canDelete ? (
                    <Image
                        source={require('../../assets/icon_popCustom_clear.png')}
                        style={{
                            position: 'absolute',
                            right: -5,
                            top: -5,
                            width: 10,
                            height: 10,
                            tintColor: 'gray',
                        }}
                    />
                ) : null}
            </TouchableOpacity>
        );
    }
}
const SortButton = ({ title, desc, ...props }) => {
    const imageSource = desc ? require('../../assets/arrow_desc.png') : require('../../assets/arrow_asc.png');
    return (
        <TouchableOpacity {...props} style={{ ...props.style, flexDirection: 'row' }}>
            <Text>{title}</Text>
            <Image style={{ marginLeft: 10, width: 20, height: 20, tintColor: mainColor }} source={imageSource} />
        </TouchableOpacity>
    );
};



const renderNoNetWork = reload => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
                style={{
                    ...styles.shadow,
                    borderRadius: 10,
                    backgroundColor: 'white',
                    flex: 1,
                    width: width - 20,
                    marginVertical: 20,
                    marginHorizontal: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onPress={reload}
            >
                <Image source={require('../.././assets/empty_under_construction.png')} style={{ width: 80, height: 80, tintColor: 'gray' }} resizeMode="contain" />
                <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20 }}>{strings('error_connect_remote_server')}</Text>
            </TouchableOpacity>
        </View>
    );
};
module.exports = {
    SortButton,
    ComponentButton,
    ComponentTabBar,
    ComponentLogo,
    Input,
    InputMultiLines,
    TextInputWithTitle,
    PasswordInput,
    PasswordInputWithTitle,
    ImportListFooter,
    TransactionItemCell,
    RightActionButton,
    SubTextInput,
    alertOk,
    TransactionItem,
    PendingComponent,
    AddressComponent,
    OptionButton,
    MnemonicView,
    renderNoNetWork
};
