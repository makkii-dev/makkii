import * as React from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';

class FlashTab extends React.Component {
    render() {
        return (
            <View>
                <Text> FlashTab</Text>
            </View>
        );
    }
}

const mapToState = ({ newsModel }) => ({ ...newsModel });
export default connect(mapToState)(FlashTab);
