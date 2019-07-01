import * as React from 'react';
import {
    View,
    FlatList
} from 'react-native';
import {mainBgColor} from '../../style_util';

class AccountList extends React.Component{
    render(){

        return(
            <View style={{flex:1,backgroundColor:mainBgColor}}>
                <FlatList

                />
            </View>
        )
    }
}