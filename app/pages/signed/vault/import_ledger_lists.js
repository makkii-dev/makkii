import React from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import SelectList from '../../../components/SelectList';
import { ImportListFooter, RightActionButton } from '../../../components/common';
import { strings } from '../../../../locales/i18n';
import { createAction, navigate } from '../../../../utils/dva';
import { fixedWidthFont, mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';

const { width } = Dimensions.get('window');

function renderAddress66(address) {
    return (
        <View>
            <Text style={styles.addressFontStyle}>{`${address.substring(0, 4)} ${address.substring(4, 10)} ${address.substring(10, 16)} ${address.substring(16, 22)}`}</Text>
            <Text style={styles.addressFontStyle}>{`${address.substring(22, 26)} ${address.substring(26, 32)} ${address.substring(32, 38)} ${address.substring(38, 44)}`}</Text>
            <Text style={styles.addressFontStyle}>{`${address.substring(44, 48)} ${address.substring(48, 54)} ${address.substring(54, 60)} ${address.substring(60, 66)}`}</Text>
        </View>
    );
}

function renderAddress42(address) {
    return (
        <View>
            <Text style={styles.addressFontStyle}>{`${address.substring(0, 4)} ${address.substring(4, 8)} ${address.substring(8, 12)} ${address.substring(12, 16)} ${address.substring(16, 21)}`}</Text>
            <Text style={styles.addressFontStyle}>
                {`${address.substring(21, 25)} ${address.substring(25, 29)} ${address.substring(29, 33)} ${address.substring(33, 37)} ${address.substring(37, 42)}`}
            </Text>
        </View>
    );
}

class ImportHdWallet extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('import_ledger.title'),
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

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            currentPage: 0,
            footerState: 0,
        };
    }

    // eslint-disable-next-line react/sort-comp
    ImportAccount = () => {
        const { dispatch } = this.props;
        const select = this.refs.refSelectList.getSelect();
        dispatch(createAction('accountImportModel/fromLedger')({ index: Object.values(select)[0].index }));
        navigate('signed_vault_set_account_name')({ dispatch });
    };

    componentWillMount() {
        this.props.navigation.setParams({
            ImportAccount: this.ImportAccount,
            isEdited: false,
        });
        setTimeout(() => {
            this.fetchAccount(this.state.currentPage);
        }, 500);
        this.isMount = true;
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    fetchAccount = (page, size = 10) => {
        const { dispatch } = this.props;
        console.log(`fetchAccount page: ${page} size: ${size}`);
        dispatch(createAction('accountImportModel/getAccountsFromLedger')({ page, size })).then(() => {
            this.isMount &&
                this.setState({
                    currentPage: page,
                    isLoading: false,
                    footerState: 0,
                });
        });
    };

    _onEndReached() {
        // if not in fetching account
        if (this.state.footerState !== 0) {
            return;
        }
        // set footer state
        this.setState(
            {
                footerState: 2,
            },
            () => {
                setTimeout(() => this.fetchAccount(this.state.currentPage + 1), 500);
            },
        );
    }

    // loading page
    renderLoadingView() {
        return (
            <View style={styles.container}>
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    renderData() {
        const { accountLists } = this.props;
        return (
            <View style={styles.container}>
                <SelectList
                    isMultiSelect={false}
                    ref="refSelectList"
                    data={accountLists}
                    itemStyle={{ height: 80, margin: 10, ...defaultStyles.shadow, backgroundColor: '#fff', borderRadius: 5 }}
                    cellLeftView={item => {
                        const { address } = item;
                        return (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', position: 'absolute', left: 10 }}>
                                {address.length === 66 ? (
                                    renderAddress66(address)
                                ) : address.length === 42 ? (
                                    renderAddress42(address)
                                ) : (
                                    <Text style={{ ...styles.addressFontStyle, width: '70%' }} multiline>
                                        {address}
                                    </Text>
                                )}
                            </View>
                        );
                    }}
                    ListFooterComponent={() => <ImportListFooter footerState={this.state.footerState} />}
                    onEndReached={() => {
                        this._onEndReached();
                    }}
                    onEndReachedThreshold={0.1}
                    onItemSelected={() => {
                        this.props.navigation.setParams({
                            isEdited: Object.keys(this.refs.refSelectList.getSelect()).length > 0,
                        });
                    }}
                />
            </View>
        );
    }

    render() {
        // if first loading
        if (this.state.isLoading) {
            return this.renderLoadingView();
        }
        // show data
        return this.renderData();
    }
}

const mapToState = ({ accountImportModel }) => {
    const accountLists = Object.keys(accountImportModel.ledger_lists).reduce((map, el) => {
        map[el] = {
            address: accountImportModel.ledger_lists[el],
            index: el,
        };
        return map;
    }, {});
    return {
        accountLists,
    };
};
export default connect(mapToState)(ImportHdWallet);

const styles = StyleSheet.create({
    divider: {
        marginLeft: 80,
        height: 1 / PixelRatio.get(),
        backgroundColor: '#000',
    },
    container: {
        width,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: mainBgColor,
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
    },
    itemImage: {
        marginRight: 20,
        width: 50,
        height: 50,
    },
    itemText: {
        textAlign: 'right',
    },
    footer: {
        flexDirection: 'row',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    addressFontStyle: {
        fontSize: 12,
        color: '#000',
        includeFontPadding: false,
        fontFamily: fixedWidthFont,
    },
});
