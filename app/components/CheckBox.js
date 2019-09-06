import * as React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import { mainColor } from '../style_util';

class CheckBox extends React.PureComponent {
    static propTypes = {
        beforeCheck: PropTypes.func,
        beforeUncheck: PropTypes.func,
        onCheck: PropTypes.func,
        onUncheck: PropTypes.func,
        textRight: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
        imageStyle: PropTypes.object,
        initValue: PropTypes.bool,
    };

    state = {
        isChecked: this.props.initValue || false,
    };

    componentWillReceiveProps({ initValue }) {
        if (this.props.initValue !== initValue) {
            this.setState({
                isChecked: initValue,
            });
        }
    }

    onPressCheck = () => {
        const { isChecked } = this.state;
        const { onUncheck, onCheck, beforeCheck, beforeUncheck } = this.props;
        isChecked ? onUncheck && onUncheck() : onCheck && onCheck();
        let ret = isChecked ? (beforeCheck ? beforeCheck() : true) : beforeUncheck ? beforeUncheck() : true;
        if (ret) {
            this.setState({
                isChecked: !isChecked,
            });
        }
    };

    render() {
        const { textRight, imageStyle } = this.props;
        const { isChecked } = this.state;
        const BoxImage = isChecked ? require('../../assets/icon_check.png') : require('../../assets/icon_uncheck.png');
        const textView = textRight && React.isValidElement(textRight) ? textRight : textRight && typeof textRight === 'string' ? <Text>{textRight}</Text> : null;
        return (
            <View style={this.props.style}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity activeOpacity={1} onPress={this.onPressCheck}>
                        <Image
                            source={BoxImage}
                            style={{
                                width: 24,
                                height: 24,
                                ...imageStyle,
                                marginRight: 5,
                                tintColor: mainColor,
                            }}
                        />
                    </TouchableOpacity>
                    {textView}
                </View>
            </View>
        );
    }
}
export default CheckBox;
