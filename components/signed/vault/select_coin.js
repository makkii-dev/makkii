import {strings} from '../../../locales/i18n';
import { connect } from 'react-redux';
import React, {Component} from 'react';
import {View, FlatList, StyleSheet, PixelRatio, TouchableOpacity, Dimensions, Text} from 'react-native';
import defaultStyles from '../../styles';
import {RightActionButton} from '../../common';
import {mainBgColor} from '../../style_util';
import {update_account_tokens} from '../../../actions/accounts';

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
                        navigation.navigate('signed_add_token', {
                            address: navigation.getParam('address'),
                            tokenAdded: navigation.getParam('tokenAdded'),
                        });
                    }}
                />
            )
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            tokens: this.props.accounts[this.props.navigation.getParam('address')].tokens[this.props.setting.explorer_server],
        };
        this.props.navigation.setParams({
            tokenAdded: this.tokenAdded,
        });
    }

    tokenAdded= (token) => {
        const {dispatch, navigation, setting, user} = this.props;
        dispatch(update_account_tokens(navigation.getParam('address'), token, setting.explorer_server, user.hashed_password));
        this.setState({
            tokens: this.props.accounts[this.props.navigation.getParam('address')].tokens[this.props.setting.explorer_server],
        })
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
                        data={[{symbol: 'AION', name: 'AION'}, ...Object.values(this.state.tokens)]}
                        renderItem={({item}) =>
                            <TouchableOpacity activeOpacity={0.3}
                                              style={{
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                  marginVertical: 10,
                                                  height: 30
                                              }}
                                              onPress={() => {
                                                console.log("selected: " + item.name);
                                                const {coinSelected} = this.props.navigation.state.params;
                                                coinSelected(item.symbol);
                                                this.props.navigation.goBack();
                                              }
                            }>
                                <Text numberOfLines={1}>{item.name}</Text>
                            </TouchableOpacity>
                        }
                        ItemSeparatorComponent={() => <View style={styles.divider}/>}
                        keyExtractor={(item, index) => item.symbol}
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
        accounts: state.accounts,
        user: state.user,
    };
})(SelectCoin);