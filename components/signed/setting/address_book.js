import React, {Component} from 'react';
import {Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio} from 'react-native';
import SwipeableRow from '../../swipeCell';
import {fixedHeight, mainBgColor} from '../../style_util';
import { connect } from 'react-redux';
import { strings } from '../../../locales/i18n';
import {RightActionButton} from '../../common';
import {delete_address, add_address, update_address} from '../../../actions/user';

const {width} = Dimensions.get('window');

class AddressBook extends Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: strings('address_book.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    btnTitle={strings('address_book.btn_add')}
                    onPress={() => {
                        navigation.navigate('signed_setting_add_address', {
                            addressAdded: navigation.getParam('addressAdded'),
                        })
                    }}
                />
            )
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            openRowKey: null,
        };
        this.props.navigation.setParams({
            addressAdded: this.addressAdded,
        });
    }

    addressAdded=(address) => {
        const {dispatch} = this.props;
        console.log("address:" + address);
        if (address.oldAddress === undefined) {
            dispatch(add_address(address));
        } else {
            dispatch(update_address(address));
        }
    }

    onSwipeOpen(Key: any) {
        this.setState({
            openRowKey: Key,
        });
    }

    onSwipeClose() {
        this.setState({
            openRowKey: null,
        });
    }

    onDelete(key) {
        const {dispatch} = this.props;
        popCustom.show(
            strings('alert_title_warning'),
            strings('address_book.warning_delete_address'),
            [
                {text: strings('cancel_button'), onPress:()=>this.setState({openRowKey: null})},
                {text: strings('delete_button'), onPress:()=>{
                    this.setState({
                        openRowKey: null,
                    }, ()=>setTimeout(() => {
                        // delete address locally
                        dispatch(delete_address(key));
                    }));
                }}
            ],
            {cancelable: false}
        );
    }

    render_item= ({item, index}) => {
        const cellHeight = 80;
        return (
            <SwipeableRow
                maxSwipeDistance={fixedHeight(186)}
                onOpen={() => this.onSwipeOpen(item.address)}
                onClose={() => this.onSwipeClose()}
                slideoutView={
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                        backgroundColor:'transparent',
                        height: cellHeight,
                        justifyContent:'flex-end'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.onDelete(item.address);
                            }}>
                            <View style={{
                                width: fixedHeight(186),
                                justifyContent: 'center',
                                height: cellHeight,
                                alignItems: 'center',
                                backgroundColor: '#fe0000',
                            }}>
                                <Text style={{fontSize:14,color:'#fff'}}>{strings('delete_button')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                }
                isOpen={item.address === this.state.openRowKey}
                swipeEnabled={this.state.openRowKey === null}
                preventSwipeRight={true}
                shouldBounceOnMount={true}
                >
                <TouchableOpacity activeOpacity={1}
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
                                      if (this.state.openRowKey === null) {
                                          console.log("selected: " + item.address);
                                          this.props.navigation.navigate('signed_setting_add_address', {
                                              name: item.name,
                                              address: item.address,
                                              addressAdded: this.addressAdded,
                                          });
                                      } else {
                                          this.setState({openRowKey: null});
                                      }
                                  }
                                  }>
                    <View style={{flexDirection: 'column'}}>
                        <Text numberOfLines={1} style={{...styles.nameStyle, marginBottom: 10}}>{item.name}</Text>
                        <Text numberOfLines={1} style={styles.addressStyle}>{item.address.substring(0, 12) + '...' + item.address.substring(54)}</Text>
                    </View>
                    <Image style={{width: 24, height: 24}}
                           source={require('../../../assets/arrow_right.png')} />
                </TouchableOpacity>
            </SwipeableRow>
        )
    };

    render() {
        let address_book = this.props.user.address_book;
        console.log("address_book: ", address_book);
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                    paddingTop: 20,
                }}
                onPress={() => {
                    this.setState({openRowKey: null});
                }}
                >
                <FlatList
                    style={{width: width}}
                    data={Object.values(address_book)}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={()=><View style={styles.divider}/>}
                    keyExtractor={(item, index)=>item.address}
                />
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf'
    },
    nameStyle: {
        fontSize: 14,
        color: '#000',
    },
    addressStyle: {
        fontSize: 12,
        color: 'gray',
    }
});

export default connect(state => {
    return {
        setting: state.setting,
        user: state.user,
    };
})(AddressBook);