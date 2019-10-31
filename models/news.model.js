import { getArticles, getArticlesCoinVoice, getFlashNews } from '../services/news.service';
import { createAction } from '../utils/dva';

export default {
    namespace: 'newsModel',
    state: {
        flash: {},
        flashNextPage: 1,
        articles: {},
        articleNextPage: 1,
        articlesCoinVoice: {},
        articlesCoinVoiceNextPage: 1,
    },
    reducers: {
        updateState(state, { payload }) {
            console.log('newsModel payload=>', payload);
            return { ...state, ...payload };
        },
    },
    effects: {
        *getFlash(
            {
                payload: { page },
            },
            { call, select, put },
        ) {
            const payload = yield call(getFlashNews, page);
            // const payload = { data: {}, nextPage: 0, result: true };
            const flash = yield select(({ newsModel }) => newsModel.flash);
            if (payload.result) {
                yield put(createAction('updateState')({ flash: { ...flash, ...payload.data }, flashNextPage: payload.nextPage }));
            }
            return Object.keys(payload.data).length;
        },
        *getArticles(
            {
                payload: { page },
            },
            { call, select, put },
        ) {
            const payload = yield call(getArticles, page);
            // const payload = { data: {}, nextPage: 0, result: true };
            const articles = yield select(({ newsModel }) => newsModel.articles);
            if (payload.result) {
                yield put(createAction('updateState')({ articles: { ...articles, ...payload.data }, articleNextPage: payload.nextPage }));
            }
            return Object.keys(payload.data).length;
        },
        *getArticlesCoinVoices(
            {
                payload: { page },
            },
            { call, select, put },
        ) {
            const payload = yield call(getArticlesCoinVoice, page);
            const articlesCoinVoice = yield select(({ newsModel }) => newsModel.articlesCoinVoice);
            if (payload.result) {
                yield put(createAction('updateState')({ articlesCoinVoice: { ...articlesCoinVoice, ...payload.data }, articlesCoinVoiceNextPage: payload.nextPage }));
            }
            return Object.keys(payload.data).length;
        },
    },
};
