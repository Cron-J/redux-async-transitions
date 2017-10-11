import expect from 'expect';
import Promise from 'bluebird';

module.exports = function(getStore)
{
    // on Asynchronized calls
    return describe('Async', () =>
    {
        // on Async calls pending
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

            let reducer = {
                ["SOMETHING_HAPPENED"](state, action) {
                    expect(action.payload.test).toEqual(data.test);
                    done();
                }
            };

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

            let reducer = {
                ["SOMETHING_RESOVLED"](state, action) {
                    expect(action.payload.response).toEqual(successData);
                    done();
                }
            };

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

            let reducer = {
                ["SOMETHING_REJECTED"](state, action) {
                    expect(action.payload).toEqual(failureData);
                    done();
                }
            };

            const store = getStore(reducer, {});

            store.dispatch({types: ['SOMETHING_HAPPENED', 'SOMETHING_RESOVLED', 'SOMETHING_REJECTED'], payload: {response: samplePromise() }});
        });
    });
}
