import {strings} from '../../../locales/i18n';
import { connect } from 'react-redux';
import React, {Component} from 'react';
import {View, FlatList, StyleSheet, PixelRatio, TouchableOpacity, Dimensions, Text} from 'react-native';
import defaultStyles from '../../styles';
import {RightActionButton} from '../../common';
import {mainBgColor} from '../../style_util';

const {width} = Dimensions.get('window');

class SelectCoin extends Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: strings('select_coin.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    btnTitle={strings('select_coin.btn_add_token')}
                    onPress={() => {
                        navigation.navigate('signed_add_token');
                    }}
                ></RightActionButton>
            )
        });
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{
                backgroundColor: mainBgColor,
                alignItems: 'center',
                flex: 1,
                paddingTop: 40,
            }}>
                <View style={{
                    ...defaultStyles.shadow,
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    paddingLeft: 20,
                    paddingRight: 20,
                }}>
                    <FlatList
                        data={['AION','Token1','Token2']}
                        renderItem={({item}) =>
                            <TouchableOpacity activeOpacity={0.3}
                                              style={{
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                  marginVertical: 10,
                                                  height: 30
                                              }}
                                              onPress={() => {
                                                console.log("selected: " + item);
                                              }
                            }>
                                <Text numberOfLines={1}>item</Text>
                            </TouchableOpacity>
                        }
                        ItemSeparatorComponent={() => <View style={styles.divider}/>}
                    />
                </View>
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

export default connect( state => {
    return {
        setting: state.setting,
    };
})(SelectCoin);