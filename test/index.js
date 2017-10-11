import expect from 'expect';
import Promise from 'bluebird';
import { createStore, applyMiddleware, compose } from 'redux';
import { createReducer } from 'redux-create-reducer';
import createHistory from 'history/createMemoryHistory';

import asyncTransitionMiddleware from '../src';

const history = createHistory();

const getStore = (reducers, initialState, stateHistory) =>
{
    let createStoreWithMiddleware = compose(asyncTransitionMiddleware(history))(createStore);
    const store = createStoreWithMiddleware(createReducer({}, reducers), initialState);
    return store;
};

describe('redux-async-transitions', () =>
{

    require('./sync-test')(getStore);
    require('./async-test')(getStore);

    require('./sync-transition-test')(getStore, history);
    require('./async-transition-test')(getStore, history);

    require('./sync-transition-action-test')(getStore, history);
    require('./async-transition-action-test')(getStore, history);

});
