import expect from 'expect';

module.exports = function(getStore, history)
{
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

            let reducer = {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(data);
                    return {
                        test: action.payload.test
                    }
                }
            };

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

            let reducer = {
                ["SOMETHING_RESOVLED"](state, action) {
                    expect(action.payload.response).toEqual(successData);
                    return {
                        test: action.payload.response.test
                    }
                }
            };

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

            let reducer = {
                ["SOMETHING_REJECTED"](state, action) {
                    expect(action.payload).toEqual(faileData);
                    return {
                        test: action.payload.test
                    }
                }
            };

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

        // async with overall transition
        it('Async with overall transition', (done) =>
        {
            const data = {test: 'test1'};
            const successData = {test: 'Result is recieved'};
            const transitionPath = '/some/path';
            const transitionPath1 = '/some/path1';
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
                ["SOMETHING_RESOVLED"](state, action) {
                    expect(action.payload.response).toEqual(successData);
                    return {
                        test: action.payload.response.test
                    }
                }
            };

            const unlisten = history.listen((location, action) => {
                expect(location.search).toEqual('?someKey=someValue&someTest=someTest1');
                if (transitionPath == location.pathname) {
                    expect(location.pathname).toEqual(transitionPath);
                }
                else {
                    expect(location.pathname).toEqual(transitionPath1);
                    unlisten();
                    done();
                }
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
                        }),
                        onSuccess: () => ({
                            path: transitionPath1,
                            query: query
                        })
                    })
                }
            });
        });
    });
}
