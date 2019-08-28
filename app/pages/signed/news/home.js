import * as React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import Animated from 'react-native-reanimated';
import FlashTab from './flash_tab';
import NewsTab from './news_tab';
import { strings } from '../../../../locales/i18n';
import { mainBgColor, mainColor } from '../../../style_util';

export default class NewsHome extends React.Component {
    static navigationOptions = ({ screenProps }) => {
        const { t, lang } = screenProps;
        return {
            title: t('menuRef.title_news', { locale: lang }),
        };
    };

    state = {
        index: 0,
        routes: [{ key: 'first', title: strings('news.title_news') }, { key: 'second', title: strings('news.title_flash') }],
    };

    // eslint-disable-next-line react/sort-comp
    NewsRoute = () => {
        const { navigation } = this.props;
        return <NewsTab navigation={navigation} />;
    };

    FlashRoute = () => {
        const { navigation } = this.props;
        return <FlashTab navigation={navigation} />;
    };

    _renderScene = SceneMap({
        first: this.NewsRoute,
        second: this.FlashRoute,
    });

    _handleIndexChange = index => this.setState({ index });

    _renderTabBar = props => {
        const { index, routes } = this.state;
        const labelStyle = { paddingHorizontal: 5 };
        const inputRange = props.navigationState.routes.map((x, i) => i);
        const fontSize = i =>
            Animated.interpolate(props.position, {
                inputRange,
                outputRange: inputRange.map(index => (index === i ? 18 : 12)),
            });

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => this._handleIndexChange(0)}>
                    <Animated.Text style={[labelStyle, { color: index === 0 ? mainColor : 'black', fontSize: fontSize(0) }]}>{routes[0].title}</Animated.Text>
                </TouchableOpacity>
                <Text>/</Text>
                <TouchableOpacity onPress={() => this._handleIndexChange(1)}>
                    <Animated.Text style={[labelStyle, { color: index === 1 ? mainColor : 'black', fontSize: fontSize(1) }]}>{routes[1].title}</Animated.Text>
                </TouchableOpacity>
            </View>
        );
    };

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <TabView navigationState={this.state} renderScene={this._renderScene} renderTabBar={this._renderTabBar} onIndexChange={this._handleIndexChange} swipeEnabled={false} />
            </View>
        );
    }
}
