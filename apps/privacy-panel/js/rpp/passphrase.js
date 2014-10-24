/**
 * PassPhrase storage helper.
 * 
 * @module PassPhrase
 * @return {Object}
 */
define([
  'shared/async_storage'
],

function(asyncStorage) {
  'use strict';

  function PassPhrase(macDest, saltDest) {
    this.macDest = macDest;
    this.saltDest = saltDest;
  }

  PassPhrase.prototype = {
    buffer: encode('topsecret'),

    _getItem: function(key) {
      var promise = new Promise(function(resolve) {
        asyncStorage.getItem(key, function(value) {
          resolve(value);
        });
      });
      return promise;
    },

    _setItem: function(key, value) {
      var promise = new Promise(function(resolve) {
        asyncStorage.setItem(key, value, function() {
          resolve(value);
        });
      });
      return promise;
    },

    exists: function() {
      return this._getItem(this.macDest).then(function(mac) {
        return mac;
      });
    },

    verify: function(password) {
      return this.exists().then(function(mac) {
        if ( ! mac) {
          return false;
        }

        return this._retrieveKey(password).then(function(key) {
          return crypto.subtle.verify('HMAC', key, mac, this.buffer)
            .then(function(valid) {
              return valid;
            });
        }.bind(this));
      }.bind(this));
    },

    change: function(password) {
      return this._retrieveKey(password).then(function(key) {
        return crypto.subtle.sign('HMAC', key, this.buffer)
          .then(function(mac) {
            return this._setItem(this.macDest, mac);
          }.bind(this));
      }.bind(this));
    },

    clear: function() {
      return this._setItem(this.macDest, null);
    },

    _salt: function() {
      return this._getItem(this.saltDest).then(function(salt) {
        if (salt) {
          return salt;
        }
        salt = crypto.getRandomValues(new Uint8Array(8));
        return this._setItem(this.saltDest, salt);
      }.bind(this));
    },

    _retrievePWKey: function(password) {
      var usages = ['deriveKey'];
      var buffer = encode(password);
      return crypto.subtle.importKey('raw', buffer, 'PBKDF2', false, usages);
    },

    _retrieveKey: function(password) {
      var params = Promise.all([
        this._retrievePWKey(password), this._salt()
      ]);

      return params.then(function(values) {
        var pwKey = values[0];
        var salt = values[1];
        return this._deriveKey(pwKey, salt);
      }.bind(this));
    },

    _deriveKey: function(pwKey, salt) {
      var params = {
        name: 'PBKDF2',
        hash: 'SHA-1',
        salt: salt,
        iterations: 5000
      };
      var alg = {name: 'HMAC', hash: 'SHA-256'};
      var usages = ['sign', 'verify'];
      return crypto.subtle.deriveKey(params, pwKey, alg, false, usages);
    }

  };

  function encode(str) {
    return new TextEncoder('utf-8').encode(str);
  }

  return PassPhrase;

});
