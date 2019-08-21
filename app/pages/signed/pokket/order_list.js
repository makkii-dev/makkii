import * as React from 'react';
import { Dimensions, FlatList, View, Text, PixelRatio, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import ProgressCircle from 'react-native-progress-circle';
import BigNumber from 'bignumber.js';
import CommonStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';
import { connect, createAction } from '../../../../utils/dva';
import { mainBgColor, mainColor } from '../../../style_util';
import { ImportListFooter } from '../../../components/common';

const { width } = Dimensions.get('window');
const SimpleCell = ({ title, value }) => (
    <View style={{ width: '100%' }}>
        <Text style={{ fontWeight: 'bold' }}>{`${title}:`}</Text>
        <Text style={{ marginLeft: 5 }}>{value}</Text>
    </View>
);
class OrderList extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('pokket.title_myOrder'),
        };
    };

    state = {
        currentPage: 0,
        footerState: 0,
        isLoading: true,
    };

    componentWillMount(): void {
        this.isMount = true;
        setTimeout(() => {
            this.fetchOrders(this.state.currentPage);
        }, 500);
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    toOrderDetail = item => {
        const { dispatch, navigation } = this.props;
        dispatch(createAction('pokketModel/updateState')({ currentOrder: item.orderId }));
        navigation.navigate('signed_pokket_order_detail');
    };

    fetchOrders = (page, size = 25) => {
        const { dispatch } = this.props;
        console.log(`fetchOrders page: ${page} size: ${size}`);
        dispatch(createAction('pokketModel/getOrders')({ page, size })).then(r => {
            this.isMount &&
                this.setState({
                    currentPage: page,
                    isLoading: false,
                    footerState: r === size ? 0 : 1,
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
                setTimeout(() => this.fetchOrders(this.state.currentPage + 1), 500);
            },
        );
    }

    renderItem = ({ item }) => {
        const { token, tokenFullName, amount, orderId, startTime, weeklyInterestRate, yearlyInterestRate, status = '' } = item;
        const endDate = startTime + 24 * 7 * 3600 * 1000;
        const diff = endDate - Date.now();
        const remainingDay = status.match(/WAIT_INVEST_TX_CONFIRM|WAIT_COLLATERAL_DEPOSIT/) ? 7 : status.match(/WAIT_INVEST_TX_CONFIRM|COMPLETE/) ? 0 : Math.ceil(diff / (24 * 3600 * 1000));
        return (
            <TouchableOpacity style={styles.orderContainer} activeOpacity={1} onPress={() => this.toOrderDetail(item)}>
                <View style={styles.orderHeader}>
                    <Text>{`${token}/${tokenFullName}`}</Text>
                    <Text>{orderId}</Text>
                </View>

                <View style={styles.orderBody}>
                    <View style={styles.orderBodyRate}>
                        <SimpleCell title={strings('pokket.label_yearly_rate')} value={`${BigNumber(yearlyInterestRate).toNumber()}%`} />
                        <SimpleCell title={strings('pokket.label_weekly_rate')} value={`${BigNumber(weeklyInterestRate).toNumber()}%`} />
                    </View>
                    <View style={styles.orderBodyProfit}>
                        <SimpleCell title={strings('pokket.label_fixed_deposits')} value={`${amount} ${token}`} />
                    </View>
                    <View style={styles.orderBodyChart}>
                        <ProgressCircle percent={Math.ceil((1 - remainingDay / 7) * 100)} radius={45} borderWidth={5} color={mainColor} shadowColor={mainBgColor} bgColor="white">
                            <Text style={{ fontSize: 10, textAlign: 'center' }}>
                                {status === 'IN_PROGRESS' ? strings('pokket.label_remaining_day', { day: remainingDay }) : strings(`pokket.label_${status}`)}
                            </Text>
                        </ProgressCircle>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    renderEmpty = () => {
        return (
            <View style={styles.container}>
                <Image source={require('../../../../assets/empty_transactions.png')} style={{ width: 80, height: 80, tintColor: 'gray', marginBottom: 20 }} resizeMode="contain" />
                <Text>{strings('pokket.label_no_orders')}</Text>
            </View>
        );
    };

    // loading page
    renderLoadingView() {
        return (
            <View style={styles.container}>
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    render() {
        const { orders } = this.props;
        if (this.state.isLoading) {
            return this.renderLoadingView();
        }
        if (orders.length === 0) {
            return this.renderEmpty();
        }
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <FlatList
                    data={orders}
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={() => {
                        this._onEndReached();
                    }}
                    ListFooterComponent={() => <ImportListFooter hasSeparator={false} footerState={this.state.footerState} />}
                />
            </View>
        );
    }
}

const mapToState = ({ pokketModel }) => {
    return {
        orders: Object.values(pokketModel.orders),
    };
};
export default connect(mapToState)(OrderList);

const styles = {
    container: {
        flex: 1,
        backgroundColor: mainBgColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderContainer: {
        ...CommonStyles.shadow,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 10,
        width: width - 40,
        padding: 10,
        backgroundColor: '#fff',
    },

    orderHeader: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingBottom: 10,
        alignItems: 'center',
        borderBottomWidth: 1 / PixelRatio.get(),
        borderColor: 'gray',
    },
    orderBody: {
        flexDirection: 'row',
        paddingVertical: 20,
        width: '100%',
    },
    orderBodyRate: {
        width: '40%',
        justifyContent: 'flex-start',
    },
    orderBodyProfit: {
        width: '30%',
        justifyContent: 'flex-start',
    },
    orderBodyChart: {
        width: '30%',
        justifyContent: 'center',
    },
};
