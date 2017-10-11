import expect from 'expect';

module.exports = function(getStore)
{
    // on synchronized calls
    return describe('Sync', () =>
    {
        // on Normal store listener case
        it('Call', (done) =>
        {
            const data = {test: "test-normal-case"};

            let reducer = {
                ["SOMETHING_HAPPENED"](state, action) {
                    return {
                        test: action.payload.test
                    }
                }
            };

            const store = getStore(reducer, {});
            store.subscribe(() =>
            {
                expect(store.getState()).toEqual(data);
                done();
            });
            store.dispatch({type: 'SOMETHING_HAPPENED', payload: data});
        });
    });
}
