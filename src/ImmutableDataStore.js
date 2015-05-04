/**
 * Use Immutablejs and RX to do the trick
 */
import Immutable from 'immutable';
import {EventEmitter} from 'events';
import Rx from 'rx';

// I do like the dots
const PathSeparator = '.';

/**
 * An Immutable Data Store
 * It's a simple store with getters and setters
 * Detect changes to the underlying immutable data
 * Supports History for Time Travel
 *
 * @author Haithem Bel Haj
 */
export class Store extends EventEmitter{

    /**
     * Constructor for the class
     * Takes a schema with initital data
     * and a bufferSize for the history
     *
     * @param schema
     * @param bufferSize
     */
    constructor(schema, bufferSize = 1) {

        super();

        this.data = Immutable.fromJS(schema);

        this.history = new Array(bufferSize);
    }

    /**
     * get a path from the store
     *
     * @param path
     * @returns {any|*}
     */
    get(path){

        return this.data.getIn(getPathArray(path));
    }

    /**
     * Set a path from store
     *
     * @param path
     * @param value
     */
    set(path, value){

        if(value === undefined){

            value = path;
            path = '';
        }

        const newData = this.data.setIn(getPathArray(path), Immutable.fromJS(value));

        // nothing to see here
        if(Immutable.is(newData, this.data))
            return;

        // save the histrory
        this.history.unshift(this.data);
        this.history.pop();

        // update the data
        this.data = newData;

        // emit the change event
        this.emit('change', path);
    }

    /**
     * update path with function
     *
     * @param path
     * @param func
     */
    update(path, func){

        if(typeof path === 'function'){

            func = path;
            path = '';
        }

        this.set(path, func(this.get(path)));
    }
}

/**
 * Observer Class
 * Observe an Immutable Data Store for changes
 * Just a wrapper on Rx
 *
 */
export class Observer {

    /**
     * Construct with a store
     * @param store
     */
    constructor(store){

        this.store = store;
        this.changes = Rx.Observable.fromEvent(this.store, 'change');
    }

    /**
     * Some nice path observation method
     * @param path
     * @returns {RxStream}
     */
    observe(path = ''){

        let oldData = this.store.get(path);

        return this.changes
            .filter(() => oldData !== this.store.get(path))
            .map(() => oldData = this.store.get(path))
    }
}

/**
 * Get the diff paths from two immutable data structures
 *
 * @param a
 * @param b
 * @param paths
 * @param changes
 * @returns {Array}
 */
function diff(a, b, paths = [], changes = []){

    const oldValue = a.getIn(paths);
    const newValue = b.getIn(paths);

    if(oldValue !== newValue){

        changes.push(paths.join(PathSeparator));

        if(oldValue instanceof Immutable.Iterable)
            oldValue.forEach((v, k) => diff(a, b, paths.concat([k]), changes));
    }

    return changes;
}

/**
 * construct path array from path string
 *
 * @param path
 * @returns {Array}
 */
function getPathArray(path){

    return (path === '')? [] : path.split(PathSeparator);
}