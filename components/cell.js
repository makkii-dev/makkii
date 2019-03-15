import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
} from 'react-native';

export default class AionCell extends Component {
    static defaultProps = {
        topSeparator: true,
        bottomSeparator: true,
    }
    constructor(props) {
        super(props);
    }
    render() {
        let titlePadLeft = 0;
        if (this.props.leadIcon) {
            titlePadLeft = 30;
        }
        return (
            <View style={{
                height: 50,
            }}>
                {this.props.topSeparator ? <View style={styles.cellSeparator}/> : null }
                <TouchableOpacity onPress={this.props.onClick}>
                    <View style={styles.cellContainer} >
                        <Image source={this.props.leadIcon} style={{
                            width: 15,
                            height: 15,
                            position: 'absolute',
                            left: 5,
                            resizeMode: 'contain'
                        }} />
                        <View style={styles.cellItem}>
                            <Text style={{...styles.titleText, paddingLeft: titlePadLeft}}>{this.props.title}</Text>
                        </View>
                        <View style={styles.cellItem}>
                            <Image style={styles.icon}
                                   source={require('../assets/arrow_right.png')} />
                        </View>
                    </View>
                </TouchableOpacity>
                {this.props.bottomSeparator? <View style={styles.cellSeparator} /> :null }
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
