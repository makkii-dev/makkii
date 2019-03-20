import React from 'react';
import PropTypes from 'prop-types';
import {FlatList, TouchableOpacity, View, Image, StyleSheet} from 'react-native';
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

    constructor(props){
        super(props);
        this.state={
            data:{},
        }
    }
    componentWillMount(): void {
        const stateData = this.state.data;
        const propsData = this.props.data;
        let newData = {};
        Object.keys(propsData).map(key=>{
            newData[key]={'key':key,'value':propsData[key],'select':(key == this.props.defaultKey)}
        });
        this.setState({
            data:Object.assign({},newData,stateData)
        })
    }

    componentWillReceiveProps(nextProps): void {
        const stateData = this.state.data;
        const propsData = nextProps.data;
        let newData = {};
        Object.keys(propsData).map(key=>{
            newData[key]={'key':key,'value':propsData[key],'select':(key == this.props.defaultKey)}
        });
        this.setState({
            data:Object.assign({},newData,stateData)
        })
    }

    onPress(key){
        let newData = this.state.data;
        if (!this.props.isMultiSelect){
            Object.keys(newData).map(_key=>{
                if(key!==_key)
                    newData[_key].select=false;
            })
        }
        this.props.isMultiSelect&&(newData[key].select=!newData[key].select);
        this.props.isMultiSelect||(newData[key].select=true);
        this.setState({
            data:Object.assign({},newData)
        });

        this.props.onItemSelected && this.props.onItemSelected();
    }
    getSelect(){
        let ret_data={};
        const stateData = this.state.data;
        Object.keys(stateData).map(key=> {
            if(stateData[key].select){
                ret_data[key] = stateData[key].value;
            }
        });
        return ret_data;
    }
    _renderItem=({item})=>{
        const element = this.props.cellLeftView(item.value);
        return (
            <TouchableOpacity
                onPress={()=>this.onPress(item.key)}
            >
                <View style={{backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex:1, height:this.props.itemHeight,paddingLeft:20, paddingRight: 20}}>
                    {element}
                    {item.select&&<Image
                        source={require('../assets/icon_checked.png')}
                        style={{width:20,height:20,marginLeft:20}}
                        resizeMode={'contain'}
                    />}
                </View>
            </TouchableOpacity>
        )
    };
    render(){
        return(
            <FlatList
                {...this.props}
                data={Object.values(this.state.data)}
                renderItem={this._renderItem}
                keyExtractor={(item,index)=>index.toString()}
                ItemSeparatorComponent={()=><View style={{backgroundColor:'lightgray',height:StyleSheet.hairlineWidth}}/>}
            />
// <View style={{backgroundColor:'lightgray',height:StyleSheet.hairlineWidth}}/>
        )
    }

}