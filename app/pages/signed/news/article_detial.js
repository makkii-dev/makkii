import * as React from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native';
import { connect } from 'react-redux';
import Markdown from 'react-native-markdown-renderer';
import { linkButtonColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';

const { width } = Dimensions.get('window');

const rules = navigation => {
    return {
        link: (node, children, parent, styles) => {
            return (
                <Text
                    key={node.key}
                    style={styles.link}
                    onPress={() => {
                        navigation.navigate('simple_webview', { initialUrl: { uri: node.attributes.href } });
                    }}
                >
                    {children}
                </Text>
            );
        },
        blockquote: (node, children, parent, styles) => (
            <View key={node.key} style={styles.blockquote}>
                <Image source={require('../../../../assets/icon_quote.png')} style={{ width: 30, height: 30, tintColor: 'lightgray' }} resizeMode="contain" />
                {children}
            </View>
        ),
    };
};
const MarkdownStyles = {
    text: {
        fontSize: 15,
        lineHeight: 20,
    },
    link: {
        color: linkButtonColor,
        textDecorationLine: 'underline',
    },
    heading: {
        marginVertical: 20,
        color: '#000000',
        fontWeight: 'bold',
    },
    heading1: {
        fontSize: 32,
    },
    heading2: {
        fontSize: 24,
    },
    heading3: {
        fontSize: 18,
    },
    heading4: {
        fontSize: 16,
    },
    heading5: {
        fontSize: 13,
    },
    heading6: {
        fontSize: 11,
    },
    blockquote: {
        backgroundColor: '#FBFBFB',
        padding: 10,
        marginVertical: 10,
    },
};

class ArticleDetail extends React.Component {
    constructor(props) {
        super(props);
        const articleKey = this.props.navigation.getParam('key');
        this.article = this.props.articles[articleKey];
    }

    render() {
        const { title, content, origin, timestamp } = this.article;
        return (
            <ScrollView style={{ width }} contentContainerStyle={{ alignItems: 'center' }}>
                <View style={{ flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#000' }}>{title}</Text>
                    <Text style={{ marginVertical: 20 }}> {`${strings(`news.origin_${origin}`)}  ${new Date(timestamp).Format('yyyy-MM-dd hh:mm')}`}</Text>
                    <Markdown style={MarkdownStyles} rules={rules(this.props.navigation)}>
                        {content}
                    </Markdown>
                    <Text style={{ marginVertical: 15, fontWeight: 'bold' }}>{strings('news.label_disclaimer')}</Text>
                </View>
            </ScrollView>
        );
    }
}

const mapToState = ({ newsModel }) => {
    return {
        articles: newsModel.articles,
    };
};

export default connect(mapToState)(ArticleDetail);
