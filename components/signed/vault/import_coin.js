import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio} from 'react-native';
import { strings } from '../../../locales/i18n';
import {mainBgColor} from '../../style_util';
import {COINS} from './constants';

const {width} = Dimensions.get('window');

class ImportCoin extends Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: strings('vault_import_coin.title'),
        });
    }

    constructor(props) {
        super(props);
    }


    render_item=({item, index})=> {
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
                onPress={() => {
                    this.props.navigation.navigate('signed_vault_import_from', {
                        symbol: item.symbol,
                    });
                }}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={item.icon}
                           style={{
                               width: 30,
                               height: 30,
                           }}
                           resizeMode={'contain'}
                    />
                    <Text numberOfLines={1} style={{paddingLeft: 10}}>{item.name + '/' + item.symbol}</Text>
                </View>
                <Image
                    style={{width: 24, height: 24}}
                    source={require('../../../assets/arrow_right.png')}
                    resizeMode={'contain'}
                />
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={{
                backgroundColor: mainBgColor,
                alignItems: 'center',
                flex: 1,
                paddingTop: 20,
            }}>
                <FlatList
                    style={{ width: width }}
                    data={Object.values(COINS)}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={()=><View style={styles.divider}/>}
                    keyExtractor={(item, index)=>item.name}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
   divider: {
       height: 1 / PixelRatio.get(),
       backgroundColor: '#dfdfdf'
   }
});

export default connect(state=> {
    return {};
})(ImportCoin);