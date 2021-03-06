var Event = require('./event'),
    Utils = require('./utils');

/**
 * @class Observable
 * @param {number} id          The id of this observale. Used to track observables
 * @param {Event[]}  eventList A list of all published events
 * @param {object} settings    Settings object
 */
function Observable(id, eventList, settings) {
    this._id = id;
    this.settings = settings;
    var _reactFn = null,
        _rejectFn = null,
        _eventList = eventList,
        _useDebounce = false;
        _debounce = 0,
        _leading = false;

    var that = this;

    /**
     * The interface to Observable instances.
     * @type {Object}
     */
    var api = {
        _id: that._id,
        /**
         * Called when changes have been made to the subject
         * 
         * @callback reactFn Function called on observed changes
         * @return {object}  returns the api. which allows piping.
         */
        react: function(reactFn) {
            if (!_reactFn) {
                _reactFn = reactFn;
                if(_useDebounce) {
                    _reactFn = Utils.debounce(_reactFn, _debounce, _leading);
                }
                if (that.settings.first) {
                    that.update(Event.make());
                }
            }
            return api;
        },
        /**
         * Wraps the react function in a debounce function.
         * @param {number}  time    - the time to debounce
         * @return {[type]}      [description]
         */
        debounce: function(time) {
            _useDebounce = true;
            if(_reactFn) {
                _reactFn = Utils.debounce(_reactFn, _debounce, _leading);
            }
            return api;
        },
        reject: function(rejectFn) {
            Utils.deprecate();
            _rejectFn = rejectFn;
            return api;
        },
        first: function() {
            if (_eventList.length) {
                return _eventList[0];
            } else {
                return null;
            }
        }
    };

    this.update = function(event) {
        if (_reactFn) {
            _reactFn.call(api, event);
        }
    };

    this.notify = this.update;

    this.reject = function(data) {
        if (_rejectFn) {
            _rejectFn.call(api, data);
        }
    };

    this.expose = function() {
        return api;
    }
}

function make(id, eventList, settings) {
    var observable = new Observable(id, eventList, settings);
    return observable;
}

exports.make = make;