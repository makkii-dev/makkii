import React from 'react';
import ProTypes from 'prop-types';
import {FlatList, TouchableOpacity, View, Image,PixelRatio} from 'react-native';
export default class SelectList extends  React.Component {
    static propTypes= {
        data: ProTypes.object.isRequired,
        cellLeftView: ProTypes.func.isRequired,
        isMultiSelect:ProTypes.bool,
        itemHeight: ProTypes.number,
    };
    static defaultProps={
        isMultiSelect: false,
        itemHeight:50,
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
            newData[key]={'key':key,'value':propsData[key],'select':false}
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
            newData[key]={'key':key,'value':propsData[key],'select':false}
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
        newData[key].select=!newData[key].select;
        this.setState({
            data:Object.assign({},newData)
        });

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
        const elemet = this.props.cellLeftView(item.value);
        return (
            <TouchableOpacity
                onPress={()=>this.onPress(item.key)}
            >
                <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex:1, height:this.props.itemHeight,paddingLeft:20, paddingRight: 20}}>
                    {elemet}
                    {item.select&&<Image source={require('../assets/selected.png')} style={{width:25,height:25,marginLeft:20,tintColor:'#669900'}}/>}
                </View>
            </TouchableOpacity>
        )
    };
    render(){
        const HeaderComponent = this.props.ListHeaderComponent?this.props.ListHeaderComponent:()=><View style={{marginLeft:20,backgroundColor:'#000',height:1/PixelRatio.get()}}/>;
        const FooterComponent = this.props.ListFooterComponent?this.props.ListFooterComponent:()=><View style={{marginLeft:20,backgroundColor:'#000',height:1/PixelRatio.get()}}/>;

        return(
            <FlatList
                {...this.props}
                style={{flex:1}}
                data={Object.values(this.state.data)}
                renderItem={this._renderItem}
                keyExtractor={(item,index)=>index.toString()}
                ItemSeparatorComponent={()=><View style={{marginLeft:20,backgroundColor:'#000',height:1/PixelRatio.get()}}/>}
                ListFooterComponent={FooterComponent}
                ListHeaderComponent={HeaderComponent}
            />

        )
    }

}