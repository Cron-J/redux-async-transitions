import expect from 'expect';

module.exports = function(getStore, history)
{
    // sync with transition
    return describe('Sync with transition', () =>
    {
        // on path change
        it('PathChange', (done) =>
        {
            const stateData = {test: "test1"};
            const failurePath = '/some/path';


            let reducer = {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(stateData);
                }
            };

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


            let reducer = {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload).toEqual(stateData);
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
                        path: transitionPath,
                        query: query
                    })
                }
            });
        });
    });
}
