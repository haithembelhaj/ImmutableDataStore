
import Immutable from 'immutable';
import {EventEmitter} from 'events';
import Rx from 'rx';

const PathSeparator = '.';

export class ImmutableDataStore extends EventEmitter{

    constructor(schema, bufferSize = 1) {

        this.data = Immutable.fromJS(schema);

        this.history = new Array(bufferSize);
    }

    get(path){

        return this.data.getIn(path.split(PathSeparator))
    }

    set(path, value){

        const pathArray = path.split(PathSeparator);

        const newData =  this.data.setIn(pathArray, value);

        // bailout if nothing changes
        if(Immutable.is(newData, this.data))
            return;

        const changes = this._getChanges(pathArray, newData, this._getParentChanges(pathArray));

        this.emit('change', changes);

        this.history.unshift(this.data);
        this.history.pop();

        this.data = newData;

    }

    _getParentChanges(paths){

        let changes = [];

        paths.slice(0,-1).reduce((prev, actual)=> {

            const next = prev.concat([actual]);

            changes.push(next.join(PathSeparator));

            return next;
        }, []);

        return changes;
    }

    _getChanges(paths, newData, changes = []){

        const oldValue = this.data.getIn(paths);
        const newValue = newData.getIn(paths);


        if(Immutable.is(oldValue, newValue))
            return true;

        changes.push(paths.join(PathSeparator));

        if(oldValue instanceof Immutable.Iterable)
            oldValue.forEach((v, k) => this._getChanges(paths.concat([k]), newData, changes));

        return changes;
    }
}


export class Observer {


    constructor(store){

        this.store = store;
    }


    observe(path){

        return Rx.Observable
            .fromEvent(this.store, 'change')
            .filter(changes => !path || changes.indexOf(path) >= -1)

    }

}