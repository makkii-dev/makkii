import * as React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Image, PixelRatio, TouchableOpacity, Dimensions } from 'react-native';
import { mainBgColor } from '../../../style_util';
import { ImportListFooter, renderNoNetWork } from '../../../components/common';
import { dateDiff } from '../../../../utils';
import { strings } from '../../../../locales/i18n';
import { getArticlesOthers } from '../../../../services/news.service';

const { height } = Dimensions.get('window');

const useNews = ({ origin }) => {
    const [state, setState] = React.useState({
        news: {},
        nextPage: 0,
        isFetching: true,
        hasMore: true,
    });
    const getNextPage = () =>
        new Promise(resolve => {
            setState({
                ...state,
                isFetching: true,
            });
            getArticlesOthers(state.nextPage, origin).then(res => {
                if (res.result) {
                    const newNews = { ...state.news, ...res.data };
                    setState({
                        news: newNews,
                        nextPage: res.nextPage,
                        isFetching: false,
                        hasMore: Object.keys(res.data).length === 10,
                    });
                } else {
                    setState({
                        ...state,
                        isFetching: false,
                    });
                }
                resolve(res);
            });
        });

    return { articles: state.news, hasMore: state.hasMore, isFetching: state.isFetching, getNextPage };
};

const CommonChannel = props => {
    const [state, setState] = React.useState({
        footerState: 0,
        isLoading: true,
    });
    const [isRefreshing, setIsRefresing] = React.useState(false);
    const [isShowToTop, setIsShowToTop] = React.useState(false);
    const listRef = React.useRef();
    const { navigation } = props;
    const origin = navigation.getParam('origin');
    const { articles, hasMore, isFetching, getNextPage } = useNews({ origin });

    React.useEffect(() => {
        let newState = { ...state };
        let shouldUpdate = false;
        if (isFetching === false && state.isLoading) {
            newState.isLoading = false;
            shouldUpdate = true;
        }
        if (isFetching === false && state.footerState === 2) {
            newState.footerState = hasMore ? 0 : 1;
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            setState(newState);
        }
    }, [isFetching, hasMore]);

    React.useEffect(() => {
        getNextPage();
    }, []);

    const onEndReached = () => {
        if (state.footerState !== 0) return;
        setState({
            ...state,
            footerState: 2,
        });
        getNextPage();
    };

    const onRefresh = () => {
        if (isRefreshing) {
            return;
        }
        setIsRefresing(true);
        getNextPage().then(() => {
            setIsRefresing(false);
        });
    };

    const toArticle = uri => {
        navigation.navigate('simple_webview', {
            initialUrl: { uri },
        });
    };

    const renderItem = ({ item }) => {
        const { title, origin, timestamp, link } = item;

        const timeText = dateDiff(timestamp);
        return (
            <TouchableOpacity
                onPress={() => toArticle(link)}
                activeOpacity={1}
                style={{ width: '100%', padding: 10, paddingVertical: 20, flexDirection: 'row', alignItem: 'center', justifyContent: 'space-between' }}
            >
                <View style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={{ color: 'gray' }}>{`${strings(`news.origin_${origin}`)}  ${timeText}`}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const _onScroll = e => {
        const offsetY = e.nativeEvent.contentOffset.y;
        if (offsetY > 100 && isShowToTop === false) {
            setIsShowToTop(true);
        } else if (offsetY <= 100 && isShowToTop === true) {
            setIsShowToTop(false);
        }
    };

    const data = Object.values(articles).sort((a, b) => {
        return b.timestamp - a.timestamp;
    });

    if (state.isLoading) {
        return renderLoadingView();
    }
    if (data.length === 0) {
        return renderNoNetWork(() => {
            setState({
                ...state,
                isLoading: true,
            });
            getNextPage();
        });
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                style={{ backgroundColor: '#fff', height }}
                ref={listRef}
                onScroll={_onScroll}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${index}`}
                data={data}
                ItemSeparatorComponent={() => (
                    <View
                        style={{
                            height: 1 / PixelRatio.get(),
                            marginHorizontal: 10,
                            backgroundColor: 'lightgray',
                        }}
                    />
                )}
                onEndReached={() => onEndReached()}
                ListFooterComponent={() => <ImportListFooter hasSeparator={false} footerState={state.footerState} />}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => onRefresh()} />}
            />

            {isShowToTop ? (
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        elevation: 8,
                        shadowColor: 'black',
                        shadowOffset: { width: 5, height: 5 },
                        shadowOpacity: 0.3,
                        position: 'absolute',
                        right: 10,
                        bottom: 20,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#ffffff',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        listRef.current.scrollToOffset({ animated: true, offset: 0 });
                    }}
                >
                    <Image source={require('../../../../assets/arrow_asc.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

// loading page
const renderLoadingView = () => {
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: mainBgColor,
            }}
        >
            <ActivityIndicator animating color="red" size="large" />
        </View>
    );
};

CommonChannel.navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('title');
    return {
        title: strings(title),
    };
};

export default CommonChannel;
