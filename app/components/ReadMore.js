import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { linkButtonColor } from '../style_util';
import { strings } from '../../locales/i18n';

export class ReadMore extends Component {
    static propTypes = {
        numberOfLines: PropTypes.number,
        initExpanded: PropTypes.bool,
        expansionDuration: PropTypes.number,
        collapsionDuration: PropTypes.number,
        expandorStyle: PropTypes.any,
        collapsarStyle: PropTypes.any,
        onExpand: PropTypes.func,
        onCollapse: PropTypes.func,
        referLink: PropTypes.string,
        onPressReferLink: PropTypes.func,
    };

    static defaultProps = {
        initExpanded: false,
        expansionDuration: 300,
        collapsionDuration: 300,
    };

    _heightAnimatedValue;

    _fullHeight;

    _truncatedHeight;

    constructor(props) {
        super(props);
        const { initExpanded } = this.props;
        this.state = {
            truncatedHeight: undefined,
            fullHeight: undefined,
            expanded: initExpanded,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const { onExpand, onCollapse } = this.props;
        if (prevState.expanded !== this.state.expanded) {
            if (this.state.expanded) {
                onExpand && onExpand();
            } else {
                onCollapse && onCollapse();
            }
        }
    }

    onLayout = event => {
        const { truncatedHeight, expanded } = this.state;
        const height = event.nativeEvent.layout.height;
        if (!this._heightAnimatedValue) {
            this._heightAnimatedValue = new Animated.Value(height);
        }
        if (expanded) {
            this._fullHeight = height;
            this._truncatedHeight = height;
        } else {
            this._truncatedHeight = height;
        }
        if (!truncatedHeight) {
            this.setState({
                truncatedHeight: height,
            });
        }
    };

    onFullViewLayout = event => {
        const { fullHeight } = this.state;
        const height = event.nativeEvent.layout.height;
        this._fullHeight = height;
        if (!fullHeight) {
            this.setState({
                fullHeight: height,
            });
        }
    };

    expand = () => {
        const { expanded } = this.state;
        const { expansionDuration } = this.props;
        if (this._fullHeight > 0 && !expanded) {
            Animated.timing(this._heightAnimatedValue, {
                toValue: this._fullHeight,
                duration: expansionDuration,
            }).start();
            this.setState({
                expanded: true,
            });
        }
    };

    collapse = () => {
        const { expanded } = this.state;
        const { collapsionDuration } = this.props;
        if (expanded) {
            if (this._truncatedHeight > 0) {
                Animated.timing(this._heightAnimatedValue, {
                    toValue: this._truncatedHeight,
                    duration: collapsionDuration,
                }).start();
            } else {
                LayoutAnimation.easeInEaseOut();
            }
            this.setState({
                expanded: false,
            });
        }
    };

    toReferLink = link => {
        const { onPressReferLink } = this.props;
        onPressReferLink && onPressReferLink(link);
    };

    render() {
        const { style, numberOfLines, referLink, ...restProps } = this.props;
        const { expanded } = this.state;
        let truncator;
        const _numberOfLines = expanded ? undefined : numberOfLines;
        if (expanded) {
            truncator = this.collapse;
        } else if ((this._truncatedHeight && this._fullHeight && this._truncatedHeight < this._fullHeight) || !this._fullHeight || !this._truncatedHeight) {
            truncator = this.expand;
        }
        return (
            <TouchableOpacity activeOpacity={1} style={styles.container} onPress={() => truncator()}>
                <Animated.View
                    style={{
                        height: this._heightAnimatedValue,
                        overflow: 'hidden',
                    }}
                >
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={this.onFullViewLayout}>
                        <Text {...restProps} style={{ opacity: 0 }} numberOfLines={undefined} />
                        {referLink ? (
                            <Text style={{ color: linkButtonColor, marginVertical: 10, textDecorationLine: 'underline' }} onPress={() => this.toReferLink(referLink)}>
                                {strings('news.button_refer_link')}
                            </Text>
                        ) : null}
                    </View>
                    <View onLayout={expanded ? undefined : this.onLayout}>
                        <Text {...restProps} numberOfLines={_numberOfLines} />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'stretch',
    },
    truncatorContainer: {
        alignSelf: 'center',
        marginTop: 2,
    },
});
