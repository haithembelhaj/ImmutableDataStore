'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
    value: true
});
/**
 * Use Immutablejs and RX to do the trick
 */

var _Immutable = require('immutable');

var _Immutable2 = _interopRequireDefault(_Immutable);

var _EventEmitter2 = require('events');

var _Rx = require('rx');

var _Rx2 = _interopRequireDefault(_Rx);

// I do like the dots
var PathSeparator = '.';

/**
 * An Immutable Data Store
 * It's a simple store with getters and setters
 * Detect changes to the underlying immutable data
 * Supports History for Time Travel
 *
 * @author Haithem Bel Haj
 */

var Store = (function (_EventEmitter) {

    /**
     * Constructor for the class
     * Takes a schema with initital data
     * and a bufferSize for the history
     *
     * @param schema
     * @param bufferSize
     */

    function Store(schema) {
        var bufferSize = arguments[1] === undefined ? 1 : arguments[1];

        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), 'constructor', this).call(this);

        this.data = _Immutable2['default'].fromJS(schema);

        this.history = new Array(bufferSize);
    }

    _inherits(Store, _EventEmitter);

    _createClass(Store, [{
        key: 'get',

        /**
         * get a path from the store
         *
         * @param path
         * @returns {any|*}
         */
        value: function get(path) {

            return this.data.getIn(getPathArray(path));
        }
    }, {
        key: 'set',

        /**
         * Set a path from store
         *
         * @param path
         * @param value
         */
        value: function set(path, value) {

            if (value === undefined) {

                value = path;
                path = '';
            }

            var newData = this.data.setIn(getPathArray(path), _Immutable2['default'].fromJS(value));

            // nothing to see here
            if (_Immutable2['default'].is(newData, this.data)) {
                return;
            } // save the histrory
            this.history.unshift(this.data);
            this.history.pop();

            // update the data
            this.data = newData;

            // emit the change event
            this.emit('change', path);
        }
    }, {
        key: 'update',

        /**
         * update path with function
         *
         * @param path
         * @param func
         */
        value: function update(path, func) {

            if (typeof path === 'function') {

                func = path;
                path = '';
            }

            this.set(path, func(this.get(path)));
        }
    }]);

    return Store;
})(_EventEmitter2.EventEmitter);

exports.Store = Store;

/**
 * Observer Class
 * Observe an Immutable Data Store for changes
 * Just a wrapper on Rx
 *
 */

var Observer = (function () {

    /**
     * Construct with a store
     * @param store
     */

    function Observer(store) {
        _classCallCheck(this, Observer);

        this.store = store;
    }

    _createClass(Observer, [{
        key: 'observe',

        /**
         * Some nice path observation method
         * @param path
         * @returns {RxStream}
         */
        value: function observe() {
            var _this = this;

            var path = arguments[0] === undefined ? '' : arguments[0];

            var pathData = this.store.get(path);

            return _Rx2['default'].Observable.fromEvent(this.store, 'change').filter(function () {
                return pathData !== _this.store.get(path);
            }).map(function () {
                return pathData = _this.store.get(path);
            });
        }
    }]);

    return Observer;
})();

exports.Observer = Observer;

/**
 * Get the diff paths from two immutable data structures
 *
 * @param a
 * @param b
 * @param paths
 * @param changes
 * @returns {Array}
 */
function diff(a, b) {
    var paths = arguments[2] === undefined ? [] : arguments[2];
    var changes = arguments[3] === undefined ? [] : arguments[3];

    var oldValue = a.getIn(paths);
    var newValue = b.getIn(paths);

    if (oldValue !== newValue) {

        changes.push(paths.join(PathSeparator));

        if (oldValue instanceof _Immutable2['default'].Iterable) oldValue.forEach(function (v, k) {
            return diff(a, b, paths.concat([k]), changes);
        });
    }

    return changes;
}

/**
 * construct path array from path string
 *
 * @param path
 * @returns {Array}
 */
function getPathArray(path) {

    return path === '' ? [] : path.split(PathSeparator);
}
