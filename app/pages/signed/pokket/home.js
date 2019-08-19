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
        focusedSearch: new Animated.Value(0),
    };

    constructor(props) {
        super(props);
        this.props.navigation.setParams({
            toMyOrder: this.toMyOrder,
        });
    }

    componentWillMount(): void {
        this.isMount = true;
        setTimeout(() => {
            this.searchProduct('');
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
        Animated.timing(this.state.focusedSearch, {
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
                        isLoading &&
                            this.setState({
                                isLoading: false,
                            });
                        if (len === 0) {
                            Keyboard.dismiss();
                        }
                    }
                });
            },
        );
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

    renderCarousel() {
        return (
            <Carousel delay={5000} style={{ width, height: 120 }} autoplay currentPage={0} bullets>
                <View style={[styles.slide, { backgroundColor: 'red' }]}>
                    <Text>Page 1</Text>
                </View>
                <View style={[styles.slide, { backgroundColor: 'green' }]}>
                    <Text>Page 2</Text>
                </View>
                <View style={[styles.slide, { backgroundColor: 'blue' }]}>
                    <Text>Page 3</Text>
                </View>
                <View style={[styles.slide, { backgroundColor: 'yellow' }]}>
                    <Text>Page 4</Text>
                </View>
            </Carousel>
        );
    }

    renderProducts() {
        const { products } = this.props;
        return (
            <FlatList
                data={products}
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
                                        <Text>{`${BigNumber(yearlyInterestRate)
                                            .times(100)
                                            .toNumber()}%`}</Text>
                                        <Text style={{ fontWeight: 'bold' }}>{strings('pokket.label_yearly_rate')}</Text>
                                    </View>
                                    <View style={styles.productLabel}>
                                        <Text>{`${BigNumber(weeklyInterestRate)
                                            .times(100)
                                            .toNumber()}%`}</Text>
                                        <Text style={{ fontWeight: 'bold' }}>{strings('pokket.label_weekly_rate')}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        );
    }

    renderContent() {
        const { keyword, focusedSearch } = this.state;
        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: mainBgColor, alignItems: 'center' }}>
                    {/* billboard */}
                    {this.renderCarousel()}
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
                                        width: focusedSearch.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [100, 300],
                                        }),
                                    },
                                ]}
                            >
                                <Image source={require('../../../../assets/icon_search.png')} resizeMode="contain" style={{ width: 25, height: 25, tintColor: mainColor }} />
                                <TextInput
                                    style={{ width: '100%', height: 30, padding: 0, marginLeft: 5 }}
                                    onFocus={() => this.toggle(true)}
                                    onBlur={() => this.toggle(false)}
                                    value={keyword}
                                    maxLength={10}
                                    multiline={false}
                                    onChangeText={this.searchProduct}
                                />
                            </Animated.View>
                        </View>
                    </View>
                    {/* products */}
                    {this.renderProducts()}
                    <Loading ref="refLoading" />
                </View>
            </DismissKeyboardView>
        );
    }

    render() {
        const { isLoading } = this.state;
        if (isLoading) {
            return this.renderLoading();
        }
        return this.renderContent();
    }
}

const mapToState = ({ pokketModel }) => {
    return {
        products: Object.values(pokketModel.products),
        isFetching: pokketModel.isFetching,
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
        marginVertical: 10,
        marginLeft: 10,
    },
};
