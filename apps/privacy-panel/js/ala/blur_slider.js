/**
 * ALA blur slider module.
 * 
 * @module BlurSlider
 * @return {Object}
 */
define([
  'shared/settings_listener',
  'shared/settings_helper'
],

function(SettingsListener, SettingsHelper) {
  'use strict';

  function BlurSlider() {}

  BlurSlider.prototype = {
    /**
     * Initialize ala blur slider.
     * @param {Object} element
     * @param {String} value
     * @param {Function} callback
     * @return {BlurSlider}
     */
    init: function(element, value, callback) {
      this.callback = callback || function(){};

      this.input = element.querySelector('.blur-slider');
      this.label = element.querySelector('.blur-label');

      this._setLabel(value);

      this.events();

      return this;
    },

    /**
     * Register events.
     */
    events: function() {
      this.input.addEventListener('touchmove', function(event) {
        this._setLabel(event.target.value);
      }.bind(this));

      this.input.addEventListener('change', function(event) {
        this._changeSliderValue(event.target.value);
      }.bind(this));
    },

    /**
     * Get input value.
     * @return {String}
     */
    getValue: function() {
      return this.input.value;
    },

    /**
     * Set input value.
     * @param {String} value
     */
    setValue: function(value) {
      this.input.value = value;
      this._setLabel(value);
    },

    /**
     * Change slider value.
     * @param {String} value
     */
    _changeSliderValue: function(value) {

      // value validation
      value = (value > 0 && value <= 12) ? value : 1;

      // update label
      this._setLabel(value);

      // run callback
      this.callback(this.getRadius(value));
    },

    /**
     * Set radius label.
     * @param {String} value
     */
    _setLabel: function(value) {
      this.label.textContent = BlurSlider.getLabel(value);
    },

    /**
     * Get radius value from input value.
     * @param {Number} value
     * @return {Number}
     */
    getRadius: function(value) {
      switch(parseInt(value)) {
        case 1:   return 0.5;
        case 2:   return 1;
        case 3:   return 2;
        case 4:   return 5;
        case 5:   return 10;
        case 6:   return 15;
        case 7:   return 20;
        case 8:   return 50;
        case 9:   return 75;
        case 10:  return 100;
        case 11:  return 500;
        case 12:  return 1000;
        default:  return null;
      }
    }
  };

  /**
   * Get radius label from input value.
   * @param {Number} value
   * @return {String}
   */
  BlurSlider.getLabel = function(value) {
    switch(parseInt(value)) {
      case 1:   return '500 '+navigator.mozL10n.get('blur-unit-m');
      case 2:   return '1 '+navigator.mozL10n.get('blur-unit-km');
      case 3:   return '2 '+navigator.mozL10n.get('blur-unit-km');
      case 4:   return '5 '+navigator.mozL10n.get('blur-unit-km');
      case 5:   return '10 '+navigator.mozL10n.get('blur-unit-km');
      case 6:   return '15 '+navigator.mozL10n.get('blur-unit-km');
      case 7:   return '20 '+navigator.mozL10n.get('blur-unit-km');
      case 8:   return '50 '+navigator.mozL10n.get('blur-unit-km');
      case 9:   return '75 '+navigator.mozL10n.get('blur-unit-km');
      case 10:  return '100 '+navigator.mozL10n.get('blur-unit-km');
      case 11:  return '500 '+navigator.mozL10n.get('blur-unit-km');
      case 12:  return '1000 '+navigator.mozL10n.get('blur-unit-km');
      default:  return '';
       }
  };

  return BlurSlider;

});
