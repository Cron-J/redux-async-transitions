import expect from 'expect';

module.exports = function(getStore, history)
{
    return describe('Async transition with action', () =>
    {
        // async with onPending transition and action
        it('Async with onPending transition and action', (done) =>
        {
            const data = {test: 'test1'};
            const successData = {test: 'Result is recieved'};
            const subStateData = {test: "test2"};
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

            let reducer = {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(data);
                    return {
                        test: action.payload.test
                    }
                },
                ["SOMETHING_SUB_CALL"](state, action) {
                    expect(action.payload).toEqual(subStateData);
                    done();
                }
            };

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
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
                            query: query,
                            func: () => {
                                return {
                                    type: 'SOMETHING_SUB_CALL',
                                    payload: subStateData
                                }
                            }
                        })
                    })
                }
            });
        });

        // async with onSuccess transition and action
        it('Async with onSuccess transition and action', (done) =>
        {
            const data = {test: 'test1'};
            const successData = {test: 'Result is recieved'};
            const subStateData = {test: "test2"};
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

            let reducer = {
                ["SOMETHING_RESOVLED"](state, action) {
                    expect(action.payload.response).toEqual(successData);
                    return {
                        test: action.payload.response.test
                    }
                },
                ["SOMETHING_SUB_CALL"](state, action) {
                    expect(action.payload).toEqual(subStateData);
                    done();
                }
            };

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
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
                            query: query,
                            func: () => {
                                return {
                                    type: 'SOMETHING_SUB_CALL',
                                    payload: subStateData
                                }
                            }
                        })
                    })
                }
            });
        });

        // async with onFail transition and action
        it('Async with onFail transition and action', (done) =>
        {
            const data = {test: 'test1'};
            const failureData = {test: 'Result is recieved'};
            const subStateData = {test: "test2"};
            const transitionPath = '/some/path';
            const query = {someKey: 'someValue', someTest: 'someTest1'};

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

            let reducer = {
                ["SOMETHING_REJECTED"](state, action) {
                    expect(action.payload).toEqual(failureData);
                    return {
                        test: action.payload.test
                    }
                },
                ["SOMETHING_SUB_CALL"](state, action) {
                    expect(action.payload).toEqual(subStateData);
                    done();
                }
            };

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                expect(location.pathname).toEqual(transitionPath);
                unlisten();
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
                            query: query,
                            func: () => {
                                return {
                                    type: 'SOMETHING_SUB_CALL',
                                    payload: subStateData
                                }
                            }
                        })
                    })
                }
            });
        });
    });
}
