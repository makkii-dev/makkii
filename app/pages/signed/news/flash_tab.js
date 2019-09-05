import * as React from 'react';
import { connect } from 'react-redux';
import { View, Text, ActivityIndicator, RefreshControl, SectionList, TouchableOpacity, Image } from 'react-native';
import { ReadMore } from '../../../components/ReadMore';
import { createAction } from '../../../../utils/dva';
import { mainBgColor } from '../../../style_util';
import { ImportListFooter } from '../../../components/common';
import { compareDate } from '../../../../utils';
import { strings } from '../../../../locales/i18n';
import commonStyles from '../../../styles';

class FlashTab extends React.Component {
    state = {
        isLoading: true,
        refreshing: false,
        footerState: 0,
        isShowToTop: false,
    };

    async componentDidMount(): void {
        this.isMount = true;
        setTimeout(() => {
            this.fetchFlashNews(1);
        }, 200);
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    // eslint-disable-next-line react/sort-comp
    fetchFlashNews = page_ => {
        const { nextPage, dispatch } = this.props;
        const page = page_ === undefined ? nextPage : page_;
        dispatch(createAction('newsModel/getFlash')({ page })).then(r => {
            if (r === 0) {
                this.isMount &&
                    this.setState({
                        isLoading: false,
                        refreshing: false,
                        footerState: 1,
                    });
            } else {
                this.isMount &&
                    this.setState({
                        isLoading: false,
                        refreshing: false,
                        footerState: r > 0 ? 0 : 1,
                    });
            }
        });
    };

    onEndReached() {
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
                setTimeout(() => this.fetchFlashNews(), 500);
            },
        );
    }

    onRefresh() {
        if (this.state.refreshing) {
            return;
        }
        this.setState(
            {
                refreshing: true,
            },
            () => {
                setTimeout(() => this.fetchFlashNews(1), 500);
            },
        );
    }

    toNewsOrigin = link => {
        this.props.navigation.navigate('simple_webview', {
            title: strings('news.title_flash'),
            initialUrl: { uri: link },
        });
    };

    // loading page
    renderLoadingView() {
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
    }

    renderTimeBar = ({ section }) => {
        const { timestamp } = section;
        const timestamp_ = new Date(timestamp);
        return (
            <View style={{ width: '100%', paddingHorizontal: 10, height: 30, justifyContent: 'center', backgroundColor: mainBgColor }}>
                <Text>{`${timestamp_.Format('MM/dd')} ${strings(`time.weekday${timestamp_.getDay()}`)}`}</Text>
            </View>
        );
    };

    renderItem = ({ item }) => {
        const { timestamp, title, content, referLink } = item;
        return (
            <View style={{ padding: 10, marginLeft: 10, borderLeftWidth: 1, borderColor: mainBgColor }}>
                <Text>{new Date(timestamp).Format('hh:mm', 24)}</Text>
                <Text style={{ fontSize: 15, marginVertical: 10, fontWeight: 'bold' }}>{title}</Text>
                <ReadMore numberOfLines={3} onPressReferLink={this.toNewsOrigin} referLink={referLink}>
                    <Text>{content}</Text>
                </ReadMore>
                {/* render dot */}
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mainBgColor, position: 'absolute', top: 15, left: -5 }} />
            </View>
        );
    };

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

    _onScroll = e => {
        const offsetY = e.nativeEvent.contentOffset.y;
        if (offsetY > 100 && this.state.isShowToTop === false) {
            this.setState({
                isShowToTop: true,
            });
        } else if (offsetY <= 100 && this.state.isShowToTop === true) {
            this.setState({
                isShowToTop: false,
            });
        }
    };

    render() {
        const { flashNews } = this.props;
        const { isLoading, refreshing, footerState, isShowToTop } = this.state;
        if (isLoading) {
            return this.renderLoadingView();
        }
        if (flashNews.length === 0) {
            return this.renderNoNetWork();
        }
        return (
            <View style={{ flex: 1 }}>
                <SectionList
                    style={{ backgroundColor: '#fff' }}
                    ref="listRef"
                    stickySectionHeadersEnabled
                    onScroll={this._onScroll}
                    bounces={false}
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderTimeBar}
                    keyExtractor={(item, index) => `${index}`}
                    sections={flashNews}
                    onEndReached={() => this.onEndReached()}
                    ListFooterComponent={() => <ImportListFooter hasSeparator={false} footerState={footerState} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => this.onRefresh()} title="ContextMenu" />}
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
                            this.refs.listRef && this.refs.listRef.scrollToLocation({ animated: true, itemIndex: 0, sectionIndex: 0 });
                        }}
                    >
                        <Image source={require('../../../../assets/arrow_asc.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    }
}

const mapToState = ({ newsModel }) => {
    const flashNews_ = Object.values(newsModel.flash).sort((a, b) => {
        return b.timestamp - a.timestamp;
    });
    let tmp = [];
    let timestampKey;
    const flashNews = flashNews_.reduce((arr, el) => {
        if (timestampKey === undefined || compareDate(timestampKey, el.timestamp)) {
            if (timestampKey) {
                arr.push({ timestamp: timestampKey, data: tmp });
                tmp = [];
            }
            timestampKey = new Date(el.timestamp).setHours(0, 0, 0, 0);
        }
        tmp.push(el);
        return arr;
    }, []);
    flashNews.push({ timestamp: timestampKey, data: tmp });
    return { flashNews, nextPage: newsModel.flashNextPage };
};

export default connect(mapToState)(FlashTab);
