import React from 'react';
import { View, TextInput, StyleSheet, Dimensions, Text, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { RightActionButton } from '../../../components/common';
import { strings } from '../../../../locales/i18n';
import { mainBgColor, mainColor } from '../../../style_util';
import { strLen } from '../../../../utils';
import { createAction } from '../../../../utils/dva';
import { AppToast } from '../../../components/AppToast';

const { width } = Dimensions.get('window');

class SetAccountNameScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const updateAccountName = navigation.getParam('updateAccountName', () => {});
        const isEdited = navigation.getParam('isEdited', false);
        return {
            title: strings('change_account_name.title'),
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        updateAccountName();
                    }}
                    disabled={!isEdited}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        const { navigation, oldName } = this.props;
        this.state = {
            textValue: oldName,
            editable: true,
        };
        navigation.setParams({
            updateAccountName: this.updateAccountName,
        });
    }

    updateAccountName = () => {
        const { dispatch, navigation, usage } = this.props;
        const { textValue } = this.state;
        this.setState({ editable: false }, () => {
            if (usage === 'import_account') {
                dispatch(createAction('accountImportModel/importAccount')({ name: textValue })).then(() => navigation.navigate('signed_vault'));
            } else if (usage === 'change_account_name') {
                dispatch(createAction('accountsModel/changeCurrentAccountName')({ name: textValue })).then(() => navigation.goBack());
            }
        });
    };

    onChangeText = text => {
        const { navigation, oldName } = this.props;
        if (strLen(text) <= 15) {
            this.setState(
                {
                    textValue: text,
                },
                () => {
                    navigation.setParams({
                        isEdited: this.state.textValue !== oldName && text.trim() !== '',
                    });
                },
            );
        } else {
            AppToast.show(strings('account_name_hint'), {
                position: AppToast.positions.CENTER,
            });
        }
    };

    render() {
        const { textValue, editable } = this.state;
        return (
            <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={() => {
                    Keyboard.dismiss();
                }}
            >
                <View style={styles.container}>
                    <TextInput style={styles.textInputStyle} value={textValue} editable={editable} multiline={false} autoFocus onChangeText={this.onChangeText} />
                    <Text style={styles.labelStyle}>{strings('account_name_hint')}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}
const mapToState = ({ accountImportModel, accountsModel }) => {
    const { readyToImport } = accountImportModel;
    const { currentAccount: key, accountsMap } = accountsModel;
    let oldName = '';
    if (!readyToImport && accountsMap[key]) {
        oldName = accountsMap[key].name;
    }
    return {
        oldName,
        usage: readyToImport ? 'import_account' : 'change_account_name',
    };
};

export default connect(mapToState)(SetAccountNameScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: mainBgColor,
    },
    textInputStyle: {
        width: width - 40,
        height: 40,
        borderBottomWidth: 1,
        borderColor: mainColor,
        paddingVertical: 0,
        paddingHorizontal: 5,
        color: '#000',
        fontSize: 16,
    },
    labelStyle: {
        marginTop: 10,
        paddingHorizontal: 5,
        color: 'gray',
        fontSize: 12,
    },
});
