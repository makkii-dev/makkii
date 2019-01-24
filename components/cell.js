import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableNativeFeedback,
    Dimensions
} from 'react-native';

export default class AionCell extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{
                height: 50,
                width: Dimensions.get('window').width,
            }}>
                <View style={styles.cellSeparator} />
                <TouchableNativeFeedback>
                    <View style={{
                        height: 50,
                        width: Dimensions.get('window').width,
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: 10,
                        paddingRight: 10
                    }} >
                        <View style={styles.cellView}>
                            <Text style={styles.titleText}>{this.props.title}</Text>
                        </View>
                        <View style={styles.cellView}>
                            <Image style={{width: 24, height: 24}}
                                   source={require('../assets/arrow_right.png')} />
                        </View>
                    </View>
                </TouchableNativeFeedback>
                <View style={styles.cellSeparator} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 18,
        color: 'black'
    },
    cellView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cellSeparator: {
        width: Dimensions.get('window').width,
        height: StyleSheet.hairlineWidth,
        left: 0,
        backgroundColor: 'lightgray',
    }
});
