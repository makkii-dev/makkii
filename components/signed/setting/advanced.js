import React, {Component} from 'react';
import {connect} from 'react-redux';
import {strings} from "../../../locales/i18n";
import {View} from 'react-native';

class Advanced extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('advanced.title'),
        };
    };
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View></View>
        )
    }
}

export default connect(state => { return ({ setting: state.setting }); })(Advanced);
