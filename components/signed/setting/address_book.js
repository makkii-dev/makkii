import React, {Component} from 'react';
import {Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio} from 'react-native';
import SwipeableRow from '../../swipeCell';
import {fixedHeight, mainBgColor} from '../../style_util';
import { connect } from 'react-redux';
import { strings } from '../../../locales/i18n';
import {RightActionButton} from '../../common';
import {delete_address} from '../../../actions/user';

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
                navigation.getParam('isEdit')?<RightActionButton
                    btnTitle={strings('address_book.btn_add')}
                    onPress={() => {
                        navigation.navigate('signed_setting_add_address', {
                            addressAdded: navigation.getParam('addressAdded'),
                        })
                    }}
                />:<RightActionButton btnTitle={' '} onPresss={() => {}}/>
            )
        });
    }

    constructor(props) {
        super(props);
        this.type = props.navigation.getParam('type');
        this.state = {
            openRowKey: null,
        };
        if (this.type === undefined || this.type === 'edit') {
            this.props.navigation.setParams({
                isEdit: true,
                addressAdded: this.addressAdded,
            });
        } else {
            this.props.navigation.setParams({
                isEdit: false,
            });
        }
    }

    addressAdded=(address) => {}

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
                swipeEnabled={this.state.openRowKey === null && this.type !== 'select'}
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
                                          if (this.type === 'select') {
                                              const {addressSelected} = this.props.navigation.state.params;
                                              addressSelected(item.address);
                                              this.props.navigation.goBack();
                                          } else {
                                              this.props.navigation.navigate('signed_setting_add_address', {
                                                  name: item.name,
                                                  address: item.address,
                                                  addressAdded: this.addressAdded,
                                              });
                                          }
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

    renderEmpty() {
        return (
            <View style={{
                backgroundColor: mainBgColor,
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
            }}>
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../../../assets/empty_transactions.png')}
                           style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
                           resizeMode={'contain'}
                    />
                    <Text>{strings('address_book.label_address_book_empty')}</Text>
                </View>
            </View>
        )
    }

    render() {
        let address_book_items = Object.values(this.props.user.address_book);
        return (
            address_book_items.length > 0?
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
                    data={address_book_items}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={()=><View style={styles.divider}/>}
                    keyExtractor={(item, index)=>item.address}
                />
            </TouchableOpacity>:
            this.renderEmpty()
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