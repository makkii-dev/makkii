import * as React from 'react';
import {connect} from 'react-redux';
import {View, WebView} from 'react-native';
class Dapp extends React.Component {
    constructor(props) {
        super(props);
        this.uri = this.props.navigation.state.params.uri;
    }
    async componentDidMount() {
        console.log('[route]' + this.props.navigation.state.routeName);
    }
    render() {
        return (
            <View style={{flex:1,backgroundColor:"orange"}}>
                <WebView
                    source={{uri: this.uri}}
                />
            </View>
        )
    }
}
export default connect(state => {return ({dapps: state.dapps});})(Dapp);