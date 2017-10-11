import expect from 'expect';

module.exports = function(getStore, history)
{
    // on path change with action
    it('pathChange with Action', (done) =>
    {
        const stateData = {test: "test1"};
        const subStateData = {test: "test2"};

        let reducer = {
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
        }

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

        let reducer = {
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
        };

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
}
