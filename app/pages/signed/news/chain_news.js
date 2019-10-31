import * as React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import Animated from 'react-native-reanimated';
import FlashTab from './flash_tab';
import ArticlesTab from './articles_tab';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import { CustomHeader } from '../../../components/CustomHeader';
import { HEADER_HEIGHT } from '../../../styles';

export default class ChainNews extends React.Component {
    state = {
        index: 0,
        routes: [{ key: 'first', title: strings('news.title_articles') }, { key: 'second', title: strings('news.title_flash') }],
    };

    // eslint-disable-next-line react/sort-comp
    ArticlesRoute = () => {
        const { navigation } = this.props;
        return <ArticlesTab navigation={navigation} />;
    };

    FlashRoute = () => {
        const { navigation } = this.props;
        return <FlashTab navigation={navigation} />;
    };

    renderScene = SceneMap({
        first: this.ArticlesRoute,
        second: this.FlashRoute,
    });

    handleIndexChange = index => this.setState({ index });

    renderTabBar = props => {
        const { index, routes } = this.state;
        const labelStyle = { paddingHorizontal: 5, fontWeight: 'bold', fontSize: 18, color: 'white' };
        const inputRange = props.navigationState.routes.map((x, i) => i);
        const translateX = Animated.interpolate(props.position, {
            inputRange,
            outputRange: [-80, 80],
        });

        return (
            <CustomHeader
                headerLeft={
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}
                        style={{
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={require('../../../../assets/arrow_back.png')}
                            style={{
                                tintColor: 'white',
                                width: 20,
                                height: 20,
                            }}
                        />
                    </TouchableOpacity>
                }
            >
                <View style={{ height: HEADER_HEIGHT, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 240, height: HEADER_HEIGHT - 2, alignItems: 'center', paddingHorizontal: 20 }}>
                        <TouchableOpacity onPress={() => this.handleIndexChange(0)}>
                            <Text style={{ ...labelStyle, color: index === 0 ? '#ffffff' : '#d3d3d3' }}>{routes[0].title}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.handleIndexChange(1)}>
                            <Text style={{ ...labelStyle, color: index === 1 ? '#ffffff' : '#d3d3d3' }}>{routes[1].title}</Text>
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={{ width: 80, height: 2, backgroundColor: 'white', transform: [{ translateX }] }} />
                </View>
            </CustomHeader>
        );
    };

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <TabView navigationState={this.state} renderScene={this.renderScene} renderTabBar={this.renderTabBar} onIndexChange={this.handleIndexChange} swipeEnabled={false} />
            </View>
        );
    }
}
