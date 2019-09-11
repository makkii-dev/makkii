import * as React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import defaultStyle, { HEADER_HEIGHT, STATUSBAR_HEIGHT } from '../styles';

export class CustomHeader extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        headerLeft: PropTypes.object,
        headerRight: PropTypes.object,
    };

    render() {
        const { title, headerLeft, headerRight, children } = this.props;
        if (children && title) {
            console.warn('using title and children at the same time; it is not possible; title is ignored');
        }
        return (
            <View style={{ ...defaultStyle.headerStyleWithoutShadow, height: HEADER_HEIGHT + STATUSBAR_HEIGHT, paddingTop: STATUSBAR_HEIGHT }}>
                <View style={{ height: HEADER_HEIGHT, width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
                    {children}
                    {!children ? (
                        <Text style={{ ...defaultStyle.headerTitleStyle }} allowFontScaling={false}>
                            {title}
                        </Text>
                    ) : null}
                    {headerLeft ? <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-start' }}>{headerLeft}</View> : null}
                    {headerRight ? <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-end' }}>{headerRight}</View> : null}
                </View>
            </View>
        );
    }
}
