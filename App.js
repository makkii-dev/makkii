// libs
import React from 'react';
// models
import models from './models';
// store
import Router, { routerReducer, routerMiddleware } from './app/routes';
import dva from './utils/dva';

// eslint-disable-next-line camelcase
const app = dva({
    models,
    extraReducers: {
        router: routerReducer,
    },
    onAction: [routerMiddleware],
    onError(e) {
        console.log('init dva error', e);
    },
});

const App = app.start(<Router />);

export default App;
