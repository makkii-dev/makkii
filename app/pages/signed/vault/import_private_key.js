import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimensions, View, Text, Keyboard, TouchableOpacity, Image } from 'react-native';
import { validatePrivateKey } from '../../../../utils';
import { strings } from '../../../../locales/i18n';
import { RightActionButton, InputMultiLines, alertOk } from '../../../components/common';
import defaultStyles from '../../../styles';
import { mainBgColor } from '../../../style_util';
import { AppToast } from '../../../components/AppToast';
import { createAction, navigate } from '../../../../utils/dva';

const { width, height } = Dimensions.get('window');

class ImportPrivateKey extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('import_private_key.title'),
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.ImportAccount();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                    btnTitle={strings('import_button')}
                />
            ),
        };
    };

    // eslint-disable-next-line react/sort-comp
    ImportAccount = () => {
        Keyboard.dismiss();
        const { dispatch } = this.props;
        const { private_key: privateKey } = this.state;
        dispatch(createAction('accountImportModel/fromPrivateKey')({ private_key: privateKey })).then(r => {
            console.log(`r:${r}`);
            if (r === 2) {
                // already imported
                AppToast.show(strings('import_private_key.already_existed'), { position: 0 });
            } else if (r === 3) {
                // invalid  private key
                alertOk(strings('alert_title_error'), strings('import_private_key.error_invalid_private_key'));
            } else {
                navigate('signed_vault_set_account_name')({ dispatch });
            }
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            private_key: '',
        };
    }

    componentDidMount() {
        const { dispatch, navigation } = this.props;
        navigation.setParams({
            ImportAccount: this.ImportAccount,
            dispatch,
            isEdited: false,
        });
    }

    scan = () => {
        this.props.navigation.navigate('scan', {
            validate: (data, callback) => {
                const res = validatePrivateKey(data.data, this.props.symbol);

                if (res) {
                    this.setState(
                        {
                            private_key: data.data,
                        },
                        () => {
                            this.props.navigation.setParams({
                                isEdited: true,
                            });
                        },
                    );
                }
                callback(res ? data.data : null, res ? '' : strings('import_private_key.error_invalid_private_key'));
            },
        });
    };

    render() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                    Keyboard.dismiss();
                }}
                style={{
                    flex: 1,
                    width,
                    height,
                    alignItems: 'center',
                }}
                accessibilityLabel={this.props.navigation.state.routeName}
            >
                <View
                    style={{
                        flex: 1,
                        padding: 40,
                        backgroundColor: mainBgColor,
                    }}
                >
                    <View
                        style={{
                            height: 20,
                            width: width - 80,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                            }}
                        >
                            {strings('import_private_key.instruction_private_key')}
                        </Text>
                        <TouchableOpacity onPress={this.scan}>
                            <Image
                                source={require('../../../../assets/icon_scan.png')}
                                style={{
                                    tintColor: 'black',
                                    width: 20,
                                    height: 20,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            ...defaultStyles.shadow,
                            padding: 10,
                            borderRadius: 5,
                            backgroundColor: 'white',
                            width: width - 80,
                            marginBottom: 40,
                        }}
                    >
                        <InputMultiLines
                            editable
                            numberOfLines={10}
                            style={{
                                borderWidth: 0,
                                fontSize: 18,
                                fontWeight: 'normal',
                                height: 250,
                                textAlignVertical: 'top',
                            }}
                            value={this.state.private_key}
                            onChangeText={val => {
                                this.setState(
                                    {
                                        private_key: val,
                                    },
                                    () => {
                                        this.props.navigation.setParams({
                                            isEdited: val.length !== 0,
                                        });
                                    },
                                );
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const mapToState = ({ accountImportModel }) => ({
    symbol: accountImportModel.symbol,
});

export default connect(mapToState)(ImportPrivateKey);
