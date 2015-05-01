# ImmutableDataStore

An Observable Data Store Based on Immutable Data from [ImmutableJS](https://github.com/facebook/immutable-js). The Change detection is super performant thanks to the immutable nature of the data.
This store can easily be hooked to an Observer for Granular path observation. The included Observer is based on [RxJS](https://github.com/Reactive-Extensions/RxJS).

## Install

```
npm install immutable-data-store
```

## Usage

```js

var Store = require('immutable-data-store').Store;
var Observer = require('immutable-data-store').Observer;

// initialize with some data
var store = new Store({a: {b: {c: [1,2,3]}}});

// the store emits change events when something actually changes
store.on('change', function(){
    
    console.log('store changed');
})

// this will trigger a change
immutableStore.set('a.b.c', [3,4,5])

// initialize an Observer
var observer = new Observer(store);

// observe returns a reactive stream
var pathObserver = observer.observe('a.b');

// you could use Other reactive method like throttle before subscription
pathObserver.forEach(function(){

    console.log('a.b changed');
})

// this will notify the pahObserver
immutableStore.set('a.b.c', 1)

```


## Licence

MIT
