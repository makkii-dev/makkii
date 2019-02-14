import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
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
            }}>
                <View style={styles.cellSeparator} />
                <TouchableOpacity onPress={this.props.onClick}>
                    <View style={styles.cellContainer} >
                        <View style={styles.cellItem}>
                            <Text style={styles.titleText}>{this.props.title}</Text>
                        </View>
                        <View style={styles.cellItem}>
                            <Image style={styles.icon}
                                   source={require('../assets/arrow_right.png')} />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.cellSeparator} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 15,
        color: 'black',
        fontWeight: 'normal',
    },
    cellItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cellSeparator: {
        height: StyleSheet.hairlineWidth,
        left: 0,
        backgroundColor: 'lightgray',
    },
    icon: {
        width: 24,
        height: 24
    },
    cellContainer: {
        height: 50,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10
    }
});
