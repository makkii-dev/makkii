import * as React from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Keyboard, PixelRatio, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BigNumber from 'bignumber.js';
import { connect, createAction } from '../../../../utils/dva';
import { DismissKeyboardView } from '../../../components/DismissKeyboardView';
import { mainBgColor, mainColor } from '../../../style_util';
import commonStyles from '../../../styles';
import { Carousel } from '../../../components/carousel';
import { strings } from '../../../../locales/i18n';
import Loading from '../../../components/Loading';
import { SortButton } from '../../../components/common';
import { formatMoney } from '../../../../utils';

const { width } = Dimensions.get('window');

class PokketHome extends React.Component {
    static navigationOptions = ({ navigation, screenProps }) => {
        const { t, lang } = screenProps;
        const toMyOrder = navigation.getParam('toMyOrder', () => {});
        return {
            title: t('pokket.title', { locale: lang }),
            headerRight: (
                <TouchableOpacity
                    style={{
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                    }}
                    onPress={toMyOrder}
                >
                    <Text style={{ color: '#fff' }}>{t('pokket.title_myOrder', { locale: lang })}</Text>
                </TouchableOpacity>
            ),
        };
    };

    state = {
        keyword: '',
        isLoading: true,
        noNetwork: false,
        focusedSearch: false,
        listsDesc: true,
    };

    focusedAnimated = new Animated.Value(0);

    constructor(props) {
        super(props);
        this.props.navigation.setParams({
            toMyOrder: this.toMyOrder,
        });
    }

    componentWillMount(): void {
        this.isMount = true;
        setTimeout(() => {
            this.checkNetWork();
        }, 500);
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    toMyOrder = () => {
        const { navigation } = this.props;
        navigation.navigate('signed_pokket_order_list');
    };

    toggle = isActive => {
        this.setState({ focusedSearch: isActive });
        Animated.timing(this.focusedAnimated, {
            toValue: isActive ? 1 : 0,
            duration: 200,
        }).start();
    };

    searchProduct = keyword => {
        const { isLoading } = this.state;
        isLoading || this.refs.refLoading.show(null, { position: 'top' });
        const { dispatch } = this.props;
        this.setState(
            {
                keyword,
            },
            () => {
                dispatch(createAction('pokketModel/getProducts')({ keyword })).then(len => {
                    if (this.isMount) {
                        isLoading || this.refs.refLoading.hide();
                        if (len === 0) {
                            Keyboard.dismiss();
                        }
                    }
                });
            },
        );
    };

    checkNetWork = () => {
        const { dispatch } = this.props;
        Promise.all([dispatch(createAction('pokketModel/getProducts')({ keyword: '' })), dispatch(createAction('pokketModel/getRemoteData')())])
            .then(([len, { error }]) => {
                console.log('len=>', len);
                if (error) {
                    this.setState({
                        isLoading: false,
                        noNetwork: true,
                    });
                } else {
                    this.setState({
                        isLoading: false,
                        noNetwork: false,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    isLoading: false,
                    noNetwork: true,
                });
            });
    };

    toProductDetail = ({ token, tokenFullName }) => {
        const { dispatch, navigation } = this.props;
        dispatch(createAction('pokketModel/setCurrentProduct')({ token })).then(() => navigation.navigate('signed_pokket_product', { title: `${token}/${tokenFullName}` }));
    };

    renderLoading() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    renderBanners() {
        const { totalInvestment, banners } = this.props;
        const bannersViews = banners.reduce((arr, el, index) => {
            arr.push(
                <View style={styles.slide} key={`${index}`}>
                    <Image style={{ height: 120, width }} source={{ uri: el }} resizeMode="stretch" />
                </View>,
            );
            return arr;
        }, []);
        return (
            <Carousel delay={5000} style={{ width, height: 120 }} autoplay currentPage={0} bullets>
                <View style={styles.slide} key="totalInvestment">
                    <Text>
                        {`${strings('pokket.label_current_totalInvestment')}:`} <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{`$${formatMoney(totalInvestment)}`}</Text>
                    </Text>
                </View>
                {bannersViews}
            </Carousel>
        );
    }

    renderProducts() {
        const { products } = this.props;
        const { listsDesc } = this.state;
        const products_ = listsDesc ? products.sort((a, b) => b.yearlyInterestRate - a.yearlyInterestRate) : products.sort((a, b) => a.yearlyInterestRate - b.yearlyInterestRate);
        return products.length ? (
            <FlatList
                data={products_}
                style={{ backgroundColor: mainBgColor }}
                keyExtractor={(item, index) => `${index}`}
                renderItem={({ item }) => {
                    const { token, tokenFullName, weeklyInterestRate, yearlyInterestRate, remainingQuota } = item;

                    return (
                        <TouchableOpacity onPress={() => this.toProductDetail(item)}>
                            <View style={styles.productContainer}>
                                <View style={styles.productHeader}>
                                    <Text>{`${token}/${tokenFullName}`}</Text>
                                    <Text>{remainingQuota}</Text>
                                </View>
                                <View style={styles.productBody}>
                                    <View style={styles.productLabel}>
                                        <Text>{`${BigNumber(yearlyInterestRate).toNumber()}%`}</Text>
                                        <Text style={{ fontWeight: 'bold' }}>{strings('pokket.label_yearly_rate')}</Text>
                                    </View>
                                    <View style={styles.productLabel}>
                                        <Text>{`${BigNumber(weeklyInterestRate).toNumber()}%`}</Text>
                                        <Text style={{ fontWeight: 'bold' }}>{strings('pokket.label_weekly_rate')}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        ) : (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image source={require('../../../../assets/empty_transactions.png')} style={{ width: 80, height: 80, tintColor: 'gray', marginBottom: 20 }} resizeMode="contain" />
                <Text style={{ color: 'gray' }}>{strings('pokket.label_no_products')}</Text>
            </View>
        );
    }

    renderContent() {
        const { keyword, focusedSearch, listsDesc } = this.state;
        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: mainBgColor, alignItems: 'center' }}>
                    {/* billboard */}
                    {this.renderBanners()}
                    {/* search bar */}
                    <View
                        style={{
                            ...commonStyles.shadow,
                            width,
                            paddingHorizontal: 20,
                            backgroundColor: '#fff',
                        }}
                    >
                        <View style={{ width, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Image source={require('../../../../assets/rectangle.png')} resizeMode="contain" style={{ width: 5, height: 30 }} />
                            <Animated.View
                                style={[
                                    styles.searchBar,
                                    {
                                        width: this.focusedAnimated.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [180, 250],
                                        }),
                                    },
                                ]}
                            >
                                <Image source={require('../../../../assets/icon_search.png')} resizeMode="contain" style={{ width: 20, height: 20, tintColor: mainColor }} />
                                <TextInput
                                    style={{ width: '100%', height: 30, padding: 0, marginLeft: 5 }}
                                    onFocus={() => this.toggle(true)}
                                    onBlur={() => this.toggle(false)}
                                    value={keyword}
                                    maxLength={10}
                                    multiline={false}
                                    placeholder={strings('pokket.placeholder_filter_by_token')}
                                    onChangeText={this.searchProduct}
                                />
                            </Animated.View>
                            <SortButton
                                onPress={() => {
                                    this.setState({
                                        listsDesc: !listsDesc,
                                    });
                                }}
                                style={{ marginLeft: 10 }}
                                title={focusedSearch ? '' : strings('pokket.label_rate')}
                                desc={listsDesc}
                            />
                        </View>
                    </View>
                    {/* products */}
                    {this.renderProducts()}
                    <Loading ref="refLoading" />
                </View>
            </DismissKeyboardView>
        );
    }

    renderNoNetWork() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{
                        ...commonStyles.shadow,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        flex: 1,
                        width: width - 20,
                        marginVertical: 20,
                        marginHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this.setState(
                            {
                                isLoading: true,
                            },
                            () => this.checkNetWork(),
                        );
                    }}
                >
                    <Image source={require('../../../../assets/empty_under_construction.png')} style={{ width: 80, height: 80, tintColor: 'gray' }} resizeMode="contain" />
                    <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20 }}>{strings('error_connect_remote_server')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const { isLoading, noNetwork } = this.state;
        if (isLoading) {
            return this.renderLoading();
        }
        if (noNetwork) {
            return this.renderNoNetWork();
        }
        return this.renderContent();
    }
}

const mapToState = ({ pokketModel }) => {
    return {
        products: Object.values(pokketModel.products),
        totalInvestment: pokketModel.totalInvestment,
        banners: pokketModel.banners,
    };
};

export default connect(mapToState)(PokketHome);

const styles = {
    billboardContainer: {
        height: 240,
        backgroundColor: 'black',
    },
    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    productContainer: {
        ...commonStyles.shadow,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 10,
        width: width - 40,
        height: 80,
        backgroundColor: '#fff',
        padding: 10,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1 / PixelRatio.get(),
        borderColor: 'gray',
    },
    productBody: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productLabel: {
        marginHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchBar: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        alignItems: 'center',
        paddingHorizontal: 5,
        marginVertical: 10,
        marginLeft: 10,
    },
};
