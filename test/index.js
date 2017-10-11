import expect from 'expect';
import Promise from 'bluebird';
import { createStore, applyMiddleware, compose } from 'redux';
import { createReducer } from 'redux-create-reducer';
import createHistory from 'history/createMemoryHistory';

import asyncTransitionMiddleware from '../src';

const history = createHistory();

const getStore = (reducers, initialState) =>
{
    let createStoreWithMiddleware = compose(asyncTransitionMiddleware(history))(createStore);
    const store = createStoreWithMiddleware(reducers, initialState);
    return store;
};

describe('redux-async-transitions', () =>
{
    // on synchronized calls
    describe('Sync', () =>
    {
        // on Normal store listener case
        it('Call', (done) =>
        {
            const data = {test: "test-normal-case"};

            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    return {
                        test: action.payload.test
                    }
                }
            });

            const store = getStore(reducer, {});
            store.subscribe(() =>
            {
                expect(store.getState()).toEqual(data);
                done();
            });
            store.dispatch({type: 'SOMETHING_HAPPENED', payload: data});
        });
    });

    // on Asynchronized calls
    describe('Async', () =>
    {

        // on Async calls Failure
        it('onPending', (done) =>
        {
            const data = {test: 'Initial test data'};
            const successData = {test: 'Result is recieved'};

            const samplePromise = () =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        resolve(successData);
                    });
                });
            }

            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload.test).toEqual(data.test);
                    done();
                }
            });

            const store = getStore(reducer, {});

            store.dispatch({types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'], payload: {test: data.test, response: samplePromise() }});
        });

        // on Asynchronized calls success
        it('OnSuccess', (done) =>
        {
            const data = {test: "Initial test data"};
            const successData = {test: "Result is recieved"};

            const samplePromise = () =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        resolve(successData);
                    });
                });
            }

            let reducer = createReducer({}, {
                ["SOMETHING_RESOVLED"](state, action) {
                    expect(action.payload.response).toEqual(successData);
                    done();
                }
            });

            const store = getStore(reducer, {});

            store.dispatch({types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'], payload: {response: samplePromise() }});
        });

        // on Async calls Failure
        it('onFail', (done) =>
        {
            const data = {test: 'Initial test data'};
            const failureData = {test: 'Result is not recieved'};

            const samplePromise = () =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        reject(failureData);
                    });
                });
            }

            let reducer = createReducer({}, {
                ["SOMETHING_REJECTED"](state, action) {
                    expect(action.payload).toEqual(failureData);
                    done();
                }
            });

            const store = getStore(reducer, {});

            store.dispatch({types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'], payload: {response: samplePromise() }});
        });
    });

    // sync with transition
    describe('Sync with transition', () =>
    {
        // on path change
        it('PathChange', (done) =>
        {
            const stateData = {test: "test1"};
            const failurePath = '/some/path';


            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(stateData);
                }
            });

            const unlisten = history.listen((location, action) => {
                expect(location.pathname).toEqual(failurePath);
                unlisten();
                done();
            })

            const store = getStore(reducer, {});

            store.dispatch({
                type: 'SOMETHING_HAPPENED',
                payload: stateData,
                meta: {
                    transition: () => ({
                        path: failurePath
                    })
                }
            });
        });

        // on path change with query
        it('pathChange with Query', (done) =>
        {
            const stateData = {test: "test1"};
            const transitionPath = '/some/path';
            const query = {someKey: 'someValue', someTest: 'someTest1'};


            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(stateData);
                }
            });

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
                done();
            });

            const store = getStore(reducer, {});

            store.dispatch({
                type: 'SOMETHING_HAPPENED',
                payload: stateData,
                meta: {
                    transition: () => ({
                        path: transitionPath,
                        query: query
                    })
                }
            });
        });

        // on path change with action
        it('pathChange with Action', (done) =>
        {
            const stateData = {test: "test1"};
            const subStateData = {test: "test2"};

            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(stateData);
                    return {
                        test: action.payload.test
                    }
                },
                ["SOMETHING_SUB_CALL"](state, action) {
                    expect(action.payload).toEqual(subStateData);
                    done();
                }
            });

            const store = getStore(reducer, {});

            store.dispatch({
                type: 'SOMETHING_HAPPENED',
                payload: stateData,
                meta: {
                    transition: () => ({
                        func: () => {
                            return {
                                type: 'SOMETHING_SUB_CALL',
                                payload: subStateData
                            }
                        }
                    })
                }
            });
        });

        // on path change with action and path, query
        it('pathChange overall', (done) =>
        {
            const stateData = {test: "test1"};
            const subStateData = {test: "test2"};
            const transitionPath = '/some/path';
            const query = {someKey: 'someValue', someTest: 'someTest1'};

            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(stateData);
                    return {
                        test: action.payload.test
                    }
                },
                ["SOMETHING_SUB_CALL"](state, action) {
                    expect(action.payload).toEqual(subStateData);
                    return {
                        test: action.payload.test
                    }
                }
            });

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
                done();
            });

            const store = getStore(reducer, {});

            store.dispatch({
                type: 'SOMETHING_HAPPENED',
                payload: stateData,
                meta: {
                    transition: () => ({
                        func: () => {
                            return {
                                type: 'SOMETHING_SUB_CALL',
                                payload: subStateData
                            };
                        },
                        path: transitionPath,
                        query: query
                    })
                }
            });
        });
    });

    // Async with transition
    describe('Async with transition', () =>
    {
        // async with onPending transition
        it('Async with onPending transition', (done) =>
        {
            const data = {test: 'test1'};
            const successData = {test: 'Result is recieved'};
            const transitionPath = '/some/path';
            const query = {someKey: 'someValue', someTest: 'someTest1'};

            const samplePromise = () =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        resolve(successData);
                    });
                });
            }

            let reducer = createReducer({}, {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(data);
                    return {
                        test: action.payload.test
                    }
                }
            });

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
                done();
            });

            const store = getStore(reducer, {});

            store.dispatch({
                types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'],
                payload: {
                    test: data.test,
                    response: samplePromise()
                },
                meta: {
                    transition: () => ({
                        onPending: () => ({
                            path : transitionPath,
                            query: query
                        })
                    })
                }
            });
        });

        // async with onSucess transition
        it('Async with onSuccess transition', (done) =>
        {
            const data = {test: 'test1'};
            const successData = {test: 'Result is recieved'};
            const transitionPath = '/some/path';
            const query = {someKey: 'someValue', someTest: 'someTest1'};

            const samplePromise = () =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        resolve(successData);
                    });
                });
            }

            let reducer = createReducer({}, {
                ["SOMETHING_RESOVLED"](state, action) {
                    expect(action.payload.response).toEqual(successData);
                    return {
                        test: action.payload.response.test
                    }
                }
            });

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
                done();
            });

            const store = getStore(reducer, {});

            store.dispatch({
                types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'],
                payload: {
                    test: data.test,
                    response: samplePromise()
                },
                meta: {
                    transition: () => ({
                        onSuccess: () => ({
                            path : transitionPath,
                            query: query
                        })
                    })
                }
            });
        });

        // async with onFail transition
        it('Async with onFail transition', (done) =>
        {
            const data = {test: 'test1'};
            const faileData = {test: 'Result is recieved'};
            const transitionPath = '/some/path';
            const query = {someKey: 'someValue', someTest: 'someTest1'};

            const samplePromise = () =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        reject(faileData);
                    });
                });
            }

            let reducer = createReducer({}, {
                ["SOMETHING_REJECTED"](state, action) {
                    expect(action.payload).toEqual(faileData);
                    return {
                        test: action.payload.test
                    }
                }
            });

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
                done();
            });

            const store = getStore(reducer, {});

            store.dispatch({
                types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'],
                payload: {
                    test: data.test,
                    response: samplePromise()
                },
                meta: {
                    transition: () => ({
                        onFail: () => ({
                            path : transitionPath,
                            query: query
                        })
                    })
                }
            });
        });
    });
});
