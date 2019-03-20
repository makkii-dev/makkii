import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
} from 'react-native';

export default class AionCell extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let titlePadLeft = 0;
        if (this.props.leadIcon) {
            titlePadLeft = 30;
        }
        return (
            <TouchableOpacity onPress={this.props.onClick}>
                <View style={styles.cellContainer} >
                    <Image
                        source={this.props.leadIcon}
                        style={{
                            width: 15,
                            height: 15,
                            position: 'absolute',
                            left: 5,
                        }}
                        resizeMode={'contain'}
                    />
                    <Text style={{...styles.titleText, paddingLeft: titlePadLeft}}>{this.props.title}</Text>
                    <Image style={styles.icon}
                           source={require('../assets/arrow_right.png')} />
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 15,
        color: 'black',
        fontWeight: 'normal',
    },
    icon: {
        position: 'absolute',
        right: 0,
        width: 24,
        height: 24
    },
    cellContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14
    }
});
