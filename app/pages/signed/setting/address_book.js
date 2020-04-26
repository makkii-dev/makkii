import React, { Component } from 'react';
import { NativeModules, Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio } from 'react-native';
import { connect } from 'react-redux';
import SwipeCell from '../../../components/SwipeCell';
import { fixedHeight, mainBgColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';
import { RightActionButton } from '../../../components/common';
import { COINS } from '../../../../client/support_coin_list';
import { accountKey, formatAddress1Line } from '../../../../utils';
import { createAction, popCustom } from '../../../../utils/dva';

const BaiduMobStat = NativeModules.BaiduMobStat;
const { width } = Dimensions.get('window');

class AddressBook extends Component {
    static navigationOptions = ({ navigation }) => {
        const onAdd = navigation.getParam('onAdd', () => {});
        return {
            title: strings('address_book.title'),
            headerRight:
                navigation.getParam('type', 'edit') === 'edit' ? (
                    <RightActionButton btnTitle={strings('address_book.btn_add')} onPress={() => onAdd()} />
                ) : (
                    <RightActionButton btnTitle=" " onPresss={() => {}} />
                ),
        };
    };

    constructor(props) {
        super(props);
        this.type = props.navigation.getParam('type');
        this.filterSymbol = props.navigation.getParam('filterSymbol');
        this.state = {
            openRowKey: null,
        };
        props.navigation.setParams({
            onAdd: this.onAdd,
        });
    }

    componentDidMount() {
        BaiduMobStat.onPageStart('Address Book');
    }

    componentWillUnmount() {
        BaiduMobStat.onPageEnd('Address Book');
    }

    onSwipeOpen(Key: any) {
        this.setState({
            openRowKey: Key,
        });
    }

    onSwipeClose() {
        this.setState({
            openRowKey: null,
        });
    }

    onAdd = () => {
        const { navigation, dispatch } = this.props;
        dispatch(createAction('contactAddModel/reset')());
        navigation.navigate('signed_setting_add_address');
    };

    onDelete(key) {
        const { dispatch } = this.props;
        popCustom.show(
            strings('alert_title_warning'),
            strings('address_book.warning_delete_address'),
            [
                {
                    text: strings('cancel_button'),
                    onPress: () => this.setState({ openRowKey: null }),
                },
                {
                    text: strings('delete_button'),
                    onPress: () => {
                        this.setState(
                            {
                                openRowKey: null,
                            },
                            () =>
                                setTimeout(() => {
                                    // delete address locally
                                    dispatch(createAction('userModel/deleteContact')({ key }));
                                }),
                        );
                    },
                },
            ],
            { cancelable: false },
        );
    }

    onSelect(item) {
        const { dispatch, navigation } = this.props;
        if (this.state.openRowKey === null) {
            if (this.type === 'select') {
                dispatch(createAction('txSenderModel/updateState')({ to: item.address }));
                navigation.goBack();
            } else {
                dispatch(
                    createAction('contactAddModel/updateState')({
                        symbol: item.symbol,
                        name: item.name,
                        address: item.address,
                        editable: false,
                    }),
                );
                navigation.navigate('signed_setting_add_address');
            }
        } else {
            this.setState({ openRowKey: null });
        }
    }

    renderItem = ({ item }) => {
        const cellHeight = 80;
        return (
            <SwipeCell
                maxSwipeDistance={fixedHeight(186)}
                onOpen={() => this.onSwipeOpen(item.address)}
                onClose={() => this.onSwipeClose()}
                slideoutView={
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            backgroundColor: 'transparent',
                            height: cellHeight,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.onDelete(accountKey(item.symbol, item.address));
                            }}
                        >
                            <View
                                style={{
                                    width: fixedHeight(186),
                                    justifyContent: 'center',
                                    height: cellHeight,
                                    alignItems: 'center',
                                    backgroundColor: '#fe0000',
                                }}
                            >
                                <Text style={{ fontSize: 14, color: '#fff' }}>{strings('delete_button')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                }
                isOpen={item.address === this.state.openRowKey}
                swipeEnabled={this.state.openRowKey === null && this.type !== 'select'}
                preventSwipeRight
                shouldBounceOnMount
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: '#fff',
                        justifyContent: 'space-between',
                        height: cellHeight,
                    }}
                    onPress={() => this.onSelect(item)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={COINS[item.symbol].icon}
                            style={{
                                width: 30,
                                height: 30,
                            }}
                            resizeMode="contain"
                        />
                        <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
                            <Text numberOfLines={1} style={{ ...styles.nameStyle, marginBottom: 10 }}>
                                {item.name}
                            </Text>
                            <Text numberOfLines={1} style={styles.addressStyle}>
                                {formatAddress1Line(item.symbol, item.address)}
                            </Text>
                        </View>
                    </View>
                    <Image style={{ width: 24, height: 24 }} source={require('../../../../assets/arrow_right.png')} />
                </TouchableOpacity>
            </SwipeCell>
        );
    };

    renderEmpty() {
        return (
            <View
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                }}
                accessibilityLabel={this.props.navigation.state.routeName}
            >
                <View
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image source={require('../../../../assets/empty_transactions.png')} style={{ width: 80, height: 80, tintColor: 'gray', marginBottom: 20 }} resizeMode="contain" />
                    <Text>{strings('address_book.label_address_book_empty')}</Text>
                </View>
            </View>
        );
    }

    render() {
        const addressBookItems = Object.values(this.props.address_book);
        let itemsFiltered = [];
        if (this.filterSymbol !== undefined) {
            addressBookItems.forEach(addr => {
                if (addr.symbol === this.filterSymbol) {
                    itemsFiltered.push(addr);
                }
            });
        } else {
            itemsFiltered = addressBookItems;
        }

        return itemsFiltered.length > 0 ? (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                    paddingTop: 20,
                }}
                onPress={() => {
                    this.setState({ openRowKey: null });
                }}
                accessibilityLabel={this.props.navigation.state.routeName}
            >
                <FlatList style={{ width }} data={itemsFiltered} renderItem={this.renderItem} ItemSeparatorComponent={() => <View style={styles.divider} />} keyExtractor={item => item.address} />
            </TouchableOpacity>
        ) : (
            this.renderEmpty()
        );
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf',
    },
    nameStyle: {
        fontSize: 14,
        color: '#000',
    },
    addressStyle: {
        fontSize: 12,
        color: 'gray',
    },
});

const mapToState = ({ userModel }) => ({
    address_book: userModel.address_book,
});

export default connect(mapToState)(AddressBook);
