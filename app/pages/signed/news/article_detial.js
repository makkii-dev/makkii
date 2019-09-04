import * as React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { connect } from 'react-redux';
import Markdown, { AstRenderer } from 'react-native-markdown-renderer';
import renderRules from 'react-native-markdown-renderer/src/lib/renderRules';
import { styles as renderStyles } from 'react-native-markdown-renderer/src/lib/styles';
import { linkButtonColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';

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
        paddingVertical: 20,
        color: '#000000',
        fontWeight: 'bold',
        lineHeight: undefined,
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
    static navigationOptions = () => {
        return {
            title: strings('news.title_article_details'),
        };
    };

    constructor(props) {
        super(props);
        const articleKey = this.props.navigation.getParam('key');
        this.article = this.props.articles[articleKey];
    }

    render() {
        const { title, content, origin, timestamp } = this.article;
        const rerender = new AstRenderer({ ...renderRules, ...rules(this.props.navigation) }, { ...renderStyles, ...MarkdownStyles });
        rerender.render = nodes => {
            const children = nodes.map(v => rerender.renderNode(v, []));
            const data = [
                <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#000' }}>{title}</Text>,
                <Text style={{ marginVertical: 20 }}> {`${strings(`news.origin_${origin}`)}  ${new Date(timestamp).Format('yyyy-MM-dd hh:mm')}`}</Text>,
                ...children,
                <Text style={{ marginVertical: 15, fontWeight: 'bold' }}>{strings('news.label_disclaimer')}</Text>,
            ];
            return (
                <FlatList
                    style={{ flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' }}
                    data={data}
                    renderItem={({ item }) => {
                        return item;
                    }}
                    keyExtractor={(item, index) => `${index}`}
                />
            );
        };
        return <Markdown renderer={rerender}>{content}</Markdown>;
    }
}

const mapToState = ({ newsModel }) => {
    return {
        articles: newsModel.articles,
    };
};

export default connect(mapToState)(ArticleDetail);
