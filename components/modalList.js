import React from 'react';
import {FlatList, Modal, Text, TouchableOpacity, View, Dimensions, Image} from 'react-native';
import {strings} from "../locales/i18n";
import PropTypes from "prop-types";
const {width,height} = Dimensions.get('window');
export class ModalList extends React.Component {

    static propTypes={
        data: PropTypes.array.isRequired,
        visible: PropTypes.bool.isRequired,
        style: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        viewStyle: PropTypes.object,
        fontStyle: PropTypes.object,
        imageStyle: PropTypes.object,
    };

    static defaultProps={
        visible:true,
        fontStyle:{
            color: '#fff',
            fontSize: 16,
            marginLeft: 5},
        imageStyle:{
            width: 20,
            height:20,
            marginRight: 10,
            tintColor: '#fff'
        },
        viewStyle:{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex:1,
            width: 180,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 8,
            paddingBottom: 8,
        }
    };

    constructor(props){
        super(props);
        this.select='';
    }
    getSelect(){
        return this.select;
    }

    render(){
        return (
            <View style={{position: 'absolute', top: 10, left: 0, width: width, height: height-10}}>
                <Modal
                    transparent={true}
                    visible={this.props.visible}
                    animationType={'none'}
                    onShow={()=>{
                        this.select='';
                    }}
                    onRequestClose={()=>this.props.onClose()}>
                    <TouchableOpacity activeOpacity={1} style={{width,height}} onPress={()=>this.props.onClose()}>
                        <FlatList
                            {...this.props}
                            style={this.props.style}
                            data={this.props.data}
                            renderItem={({item})=>
                                <TouchableOpacity activeOpacity={0.3} onPress={()=>{
                                    this.select=item.title;
                                    this.props.onClose()
                                }}>
                                    <View style={this.props.viewStyle}>
                                        {item.image?<Image source={item.image} style={this.props.imageStyle}/>:null}
                                        <Text numberOfLines={1} style={this.props.fontStyle}>{strings(item.title)}</Text>
                                    </View>
                                </TouchableOpacity>

                            }
                            keyExtractor={(item,index)=>index.toString()}
                        />
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    }
}

