# redux-async-transitions

[![Coverage Status](https://coveralls.io/repos/github/Cron-J/redux-async-transitions/badge.svg?branch=master&rand=2)](https://coveralls.io/github/Cron-J/redux-async-transitions?branch=testcases)
![Build status](https://circleci.com/gh/Cron-J/redux-async-transitions.svg?style=shield&circle-token=2e3e2b7b174d781d2bf12a3fd2db7b1bb2385d03)

This project is a combination of following two project along with features included
<a href="https://github.com/symbiont-io/redux-async"> redux-async </a> and <a href="https://github.com/johanneslumpe/redux-history-transitions"> redux-history-transition </a>

thanks to the author

*NOTE: All the code blocks are written with ES6*

## Installation
```
npm install --save redux-async-transitions
```

## How to Use
```javascript
import { createStore, compose } from 'redux';
import asyncMiddleware from 'redux-async-transitions';
const store = compose(asyncMiddleware(history))(createStore);
```

## Features

##### Function calls

Apart from path transition like this

```javascript
  return {
    type: types.SOMEFUNCTION,
    payload: {
      data: somedata
    },
    meta: {
      transition: () => ({
        path : '/somePath',
        query: {
          someKey: 'someQuery'
        },
        state: {
          stateObject: stateData
        }
      })
    }
  };
```

we can have another function to be called while executing a function, were the page transition happens only after executing the function (someOtherfunction)

```javascript
  return {
    type: types.SOMEFUNCTION,
    payload: {
      data: somedata
    },
    meta: {
      transition: () => ({
        func: () => {
          return someOtherfunction();
        },
        path : '/somePath',
        query: {
          someKey: 'someQuery'
        },
        state: {
          stateObject: stateData
        }
      })
    }
  };
```
##### async function calls

```javascript
  return {
    types: [types.PENDINGFUNCTION, types.SUCCESSFUNCTION, types.FAILUREFUNCTION],
    payload: {
      response: someapi.asyncall() // only return promise
    }
    meta: {
      transition: (state, action) => ({
        onPending: () => {
        },
        onSuccess: (successdata) => {
        },
        onFail: (promiseError) => {
        }
      })
    }
  };
```

for each async functions we can have path and also a function like below

```javascript
  onSuccess: (successdata) => {
    return {
      func: () => {
        return someOtherfunction();
      },
      path : '/somePath',
      query: {
        someKey: 'someQuery'
      },
      state: {
        stateObject: stateData
      }
    }
  }
```
