import * as React from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';

class NewsTab extends React.Component {
    render() {
        return (
            <View>
                <Text> NewsTab</Text>
            </View>
        );
    }
}

const mapToState = ({ newsModel }) => ({ ...newsModel });
export default connect(mapToState)(NewsTab);
