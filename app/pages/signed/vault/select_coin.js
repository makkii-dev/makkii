import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio } from 'react-native';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import { COINS } from '../../../../client/support_coin_list';
import { createAction } from '../../../../utils/dva';

const { width } = Dimensions.get('window');

class SelectCoin extends Component {
    static navigationOptions = () => {
        return {
            title: strings('vault_import_coin.title'),
        };
    };

    constructor(props) {
        super(props);
        this.usage = this.props.navigation.getParam('usage');
    }

    selectCoin = item => {
        const { dispatch, navigation } = this.props;
        if (this.usage === 'import') {
            dispatch(createAction('accountImportModel/updateState')({ symbol: item.symbol }));
            navigation.navigate('signed_vault_import_from');
        } else if (this.usage === 'address_book') {
            dispatch(createAction('contactAddModel/updateState')({ symbol: item.symbol }));
            navigation.goBack();
        }
    };

    renderItem = ({ item }) => {
        const cellHeight = 60;
        return (
            <TouchableOpacity
                activeOpaicty={1}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    height: cellHeight,
                }}
                onPress={() => this.selectCoin(item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={item.icon}
                        style={{
                            width: 30,
                            height: 30,
                        }}
                        resizeMode="contain"
                    />
                    <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                        {`${item.name}/${item.symbol}`}
                    </Text>
                </View>
                <Image style={{ width: 24, height: 24 }} source={require('../../../../assets/arrow_right.png')} resizeMode="contain" />
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <View
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                    paddingTop: 20,
                }}
                accessibilityLabel={this.props.navigation.state.routeName}
            >
                <FlatList style={{ width }} data={Object.values(COINS)} renderItem={this.renderItem} ItemSeparatorComponent={() => <View style={styles.divider} />} keyExtractor={item => item.name} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf',
    },
});

export default connect()(SelectCoin);
