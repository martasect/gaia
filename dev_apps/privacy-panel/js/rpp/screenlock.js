(function() {
  'use strict';

  function ScreenLock() {}

  ScreenLock.prototype = {

    _settings: {
      passcodeEnabled: false,
      lockscreenEnabled: false
    },

    init: function() {
      this.panel = document.getElementById('rpp-screenlock');
      this.settings = window.SettingsListener;

      this._getAllElements();
      this.passcodeEnable.addEventListener('click', this);
      this.lockscreenEnable.addEventListener('click', this);
      this.passcodeEditButton.addEventListener('click', this);
      this._fetchSettings();
    },

    _getAllElements: function sl_getAllElements() {
      this.screenlockPanel = this.panel;
      this.lockscreenEnable = this.panel.querySelector('.lockscreen-enable');
      this.passcodeEnable = this.panel.querySelector('.passcode-enable');
      this.passcodeEditButton = this.panel.querySelector('.passcode-edit');
    },

    _fetchSettings: function sl_fetchSettings() {
      this.settings.observe('lockscreen.enabled', false,
        function(enabled) {
          this._toggleLockscreen(enabled);
      }.bind(this));

      this.settings.observe('lockscreen.passcode-lock.enabled', false,
        function(enabled) {
          this._togglePasscode(enabled);
      }.bind(this));
    },

    _togglePasscode: function sl_togglePasscode(enabled) {
      this._settings.passcodeEnabled = enabled;
      this.screenlockPanel.dataset.passcodeEnabled = enabled;
      this.passcodeEnable.checked = enabled;
    },

    _toggleLockscreen: function sl_toggleLockscreen(enabled) {
      this._settings.lockscreenEnabled = enabled;
      this.screenlockPanel.dataset.lockscreenEnabled = enabled;
      this.lockscreenEnable.checked = enabled;
    },

    _showDialog: function sl_showDialog(mode) {
      window.pp.panel.show({ id: 'rpp-passcode', options: mode });
    },

    handleEvent: function sl_handleEvent(evt) {
      switch (evt.target) {
        case this.passcodeEnable:
          evt.preventDefault();
          if (this._settings.passcodeEnabled) {
            this._showDialog('confirm');
          } else {
            this._showDialog('create');
          }
          break;
        case this.lockscreenEnable:
          if (this._settings.lockscreenEnabled === true &&
            this._settings.passcodeEnabled === true) {
            evt.preventDefault();
            this._showDialog('confirmLock');
          }
          break;
        case this.passcodeEditButton:
          this._showDialog('edit');
          break;
      }
    }

  };

  window.pp = window.pp || {};
  window.pp.rppScreenLock = new ScreenLock();
})();
