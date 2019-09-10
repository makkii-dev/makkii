import { HttpClient } from 'lib-common-util-js';

const getFlashNews = async page => {
    const url = page === undefined ? 'https://api.chainnews.com/api/news' : `https://api.chainnews.com/api/news/?page=${page}`;
    console.log('[news get Flash] req =>', url);
    try {
        const { data } = await HttpClient.get(url);
        if (data.count) {
            const data_ = data.results.reduce((map, el) => {
                map[el.pb_timestamp * 1000] = {
                    title: el.title,
                    content: el.content,
                    referLink: el.refer_link,
                    timestamp: el.pb_timestamp * 1000,
                };
                return map;
            }, {});
            const nextPage = getNextPage(data.next);
            return { data: data_, result: true, nextPage };
        }
        return { data: {}, result: false };
    } catch (e) {
        console.log('[news get Flash] error =>', e);
        return { data: {}, result: false };
    }
};

const getArticles = async page => {
    const url = page === undefined ? 'https://api.chainnews.com/api/articles' : `https://api.chainnews.com/api/articles/?page=${page}`;
    console.log('[news getArticles] req =>', url);
    try {
        const { data } = await HttpClient.get(url);
        if (data.count) {
            const data_ = data.results.reduce((map, el) => {
                map[el.pb_timestamp * 1000] = {
                    title: el.title,
                    content: el.content,
                    origin: 'chainnews',
                    referLink: el.refer_link,
                    timestamp: el.pb_timestamp * 1000,
                    imageUrl: el.cover_url,
                };
                return map;
            }, {});
            const nextPage = getNextPage(data.next);
            return { data: data_, result: true, nextPage };
        }
        return { data: {}, result: false };
    } catch (e) {
        console.log('[news getArticles] error =>', e);
        return { data: {}, result: false };
    }
};
const getNextPage = url => {
    return parseInt(url.slice(url.indexOf('=') + 1));
};

export { getFlashNews, getArticles };
