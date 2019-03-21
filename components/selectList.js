import React from 'react';
import PropTypes from 'prop-types';
import {FlatList, TouchableOpacity, View, Image, StyleSheet} from 'react-native';


class SelectCell extends React.Component{
    static propTypes ={
        item: PropTypes.object.isRequired,
        itemHeight: PropTypes.number.isRequired,
        cellLeftView: PropTypes.func.isRequired,
        onItemSelected: PropTypes.func.isRequired,
        select: PropTypes.bool.isRequired,
    };

    shouldComponentUpdate(nextProps,nextState){
        return (this.props.item.key !== nextProps.item.key || this.props.select !== nextProps.select);
    }


    onPress(key){
        this.props.onItemSelected(key,!this.props.select)
    }

    render(){
        const {item,cellLeftView} = this.props;
        const element = cellLeftView(item.value);
        return (
            <TouchableOpacity
                onPress={()=>this.onPress(item.key)}
            >
                <View style={{backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex:1, height:this.props.itemHeight,paddingLeft:20, paddingRight: 20}}>
                    {element}
                    {this.props.select&&<Image
                        source={require('../assets/icon_checked.png')}
                        style={{width:20,height:20,marginLeft:20}}
                        resizeMode={'contain'}
                    />}
                </View>
            </TouchableOpacity>
        )
    }

}

export default class SelectList extends  React.Component {
    static propTypes= {
        data: PropTypes.object.isRequired,
        cellLeftView: PropTypes.func.isRequired,
        isMultiSelect:PropTypes.bool,
        itemHeight: PropTypes.number,
        defaultKey: PropTypes.string,
        onItemSelected: PropTypes.func,
    };
    static defaultProps={
        isMultiSelect: false,
        itemHeight:50,
        defaultKey: undefined,
    };
    state={
        needRefresh: false,
    };


    constructor(props){
        super(props);
        const {defaultKey} = this.props;
        defaultKey&&(this.select={[defaultKey]:this.props.data[defaultKey]});
        defaultKey||(this.select={})
    }


    onPress(key, select){
        if (!this.props.isMultiSelect){
            select&&(this.select={[key]:this.props.data[key]});
        }else{
            select&&(this.select[key]=this.props.data[key]);
            select||(delete this.select[key]);
        }
        this.setState({needRefresh:!this.state.needRefresh});
        this.props.onItemSelected && this.props.onItemSelected();
    }

    getSelect(){
        return this.select;
    }

    render(){
        const propsData = this.props.data;
        let data= {};
        Object.keys(propsData).map(key=>{
            data[key]={'key':key,'value':propsData[key]}
        });
        return(
            <FlatList
                {...this.props}
                data={Object.values(data)}
                renderItem={({item})=>
                    <SelectCell
                        item={item}
                        itemHeight={this.props.itemHeight}
                        onItemSelected={(key,select)=>this.onPress(key,select)}
                        cellLeftView={this.props.cellLeftView}
                        select={this.select[item.key]!==undefined}
                    />
                }
                keyExtractor={(item,index)=>index.toString()}
                ItemSeparatorComponent={()=><View style={{backgroundColor:'lightgray',height:StyleSheet.hairlineWidth}}/>}
            />
        )
    }

}
