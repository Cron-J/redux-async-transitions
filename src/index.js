'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var isPromise = function isPromise(obj) {
    return obj && typeof obj.then === 'function';
};
var hasPromiseProps = function hasPromiseProps(obj) {
    return Object.keys(obj).some(function (key) {
        return isPromise(obj[key]);
    });
};

var resolveProps = function resolveProps(obj) {
    var props = Object.keys(obj);
    var values = props.map(function (prop) {
        return obj[prop];
    });

    return Promise.all(values).then(function (resolvedArray) {
        return props.reduce(function (acc, prop, index) {
            acc[prop] = resolvedArray[index];
            return acc;
        }, {});
    });
};

var getNonPromiseProperties = function getNonPromiseProperties(obj) {
    return Object.keys(obj).filter(function (key) {
        return !isPromise(obj[key]);
    }).reduce(function (acc, key) {
        acc[key] = obj[key];
        return acc;
    }, {});
};

var getActionObjects = function getActionObjects(obj) {
    var actionObject = {};
    for (var key in obj) {
        if (key != 'payload' && key != 'type' && key != 'types') {
            actionObject[key] = obj[key];
        }
    }
    return actionObject;
};

var dispatcher = function dispatcher(action, store, history) {
    var types = action.types;
    var payload = action.payload;
    var meta = action.meta;
    if (types || hasPromiseProps(action.payload)) {
        var onSuccess = null;
        var onFail = null;
        var onPending = null;

        var metaFunction = meta && meta.transition ? meta.transition(store.getState(), action) : null;
        onSuccess = metaFunction && metaFunction.onSuccess ? metaFunction.onSuccess : null;
        onFail = metaFunction && metaFunction.onFail ? metaFunction.onFail : null;
        onPending = metaFunction && metaFunction.onPending ? metaFunction.onPending : null;

        if (onPending) {
            var onPendingData = onPending();
            var func = onPendingData.func;
            var path = onPendingData.path;

            if (func)
            dispatcher(func(), store, history);

            if (path) {
                var query = onPendingData.query;
                var replace = onPendingData.replace;
                var search = '';

                for (var key in query) {
                    if (!search) {
                        search = '?' + key + '=' + query[key];
                    } else {
                        search += '&' + key + '=' + query[key];
                    }
                }

                var method = replace ? 'replace' : 'push';
                history[method]({pathname: path, search: search});
            }
        }

        var actionProperties = getActionObjects(action);
        var nonPromiseProperties = getNonPromiseProperties(payload);

        var PENDING = types[0];
        var RESOLVED = types[1];
        var REJECTED = types[2];

        actionProperties.type = PENDING;
        actionProperties.payload = _extends({}, nonPromiseProperties);
        store.dispatch(actionProperties);
        return resolveProps(payload).then(function (results) {
            actionProperties.type = RESOLVED;
            actionProperties.payload = _extends({}, results);

            if (onSuccess) {
                store.dispatch(actionProperties);
                var successData = onSuccess(results);
                if (successData) {
                    var path = successData.path;
                    var func = successData.func;

                    if (func)
                    dispatcher(func(), store, history);

                    if (path) {
                        var query = successData.query;
                        var replace = successData.replace;
                        var search = '';

                        for (var key in query) {
                            if (!search) {
                                search = '?' + key + '=' + query[key];
                            } else {
                                search += '&' + key + '=' + query[key];
                            }
                        }

                        var method = replace ? 'replace' : 'push';
                        history[method]({pathname: path, search: search});
                    }
                }
            } else {
                store.dispatch(actionProperties);
            }
        }, function (error) {
            actionProperties.type = REJECTED;
            actionProperties.error = true;
            actionProperties.payload = _extends({}, error);
            if (onFail) {
                store.dispatch(actionProperties);
                var failData = onFail(error);
                if (failData) {
                    var path = failData.path;
                    var func = failData.func;

                    if (func)
                    dispatcher(func(), store, history);

                    if (path) {
                        var query = failData.query;
                        var replace = failData.replace;
                        var search = '';

                        for (var key in query) {
                            if (!search) {
                                search = '?' + key + '=' + query[key];
                            } else {
                                search += '&' + key + '=' + query[key];
                            }
                        }

                        var method = replace ? 'replace' : 'push';
                        history[method]({pathname: path, search: search});
                    }
                }
            } else {
                return store.dispatch(actionProperties);
            }
        });
    } else if (action.type) {
        var type = action.type;
        var meta = action.meta;

        store.dispatch(action);

        var transitionData = meta && meta.transition ? meta.transition(store.getState(), action) : null;

        if (transitionData) {
            var path = transitionData.path;
            var func = transitionData.func;

            if (func)
                dispatcher(func(), store, history);

            if (path) {
                var query = transitionData.query;
                var replace = transitionData.replace;
                var search = '';

                for (var key in query) {
                    if (!search) {
                        search = '?' + key + '=' + query[key];
                    } else {
                        search += '&' + key + '=' + query[key];
                    }
                }

                var method = replace ? 'replace' : 'push';

                history[method]({pathname: path, search: search});
            }
        }

        return action;
    }
}


exports['default'] = function(history) {
    return function (next) {
        return function (reducer, initialState) {
            var store = next(reducer, initialState);
            return _extends({}, store, {
                dispatch: function dispatch(action) {
                    dispatcher(action, store, history);
                }
            });
        }
    }
}

module.exports = exports['default'];
