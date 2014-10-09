define(function(){
  'use strict';

  function PrivacyPanelItem(element) {
     this.element;
  }

  PrivacyPanelHandler.prototype = {

    /**
     * Initialize click event for Privacy Panel menu item.
     */
    init: function() {
      this.element.addEventListener('click', this.launch);
      var this._privacyPanelManifestURL = document.location.protocol +
       '//privacy-panel.gaiamobile.org' +
       (location.port ? (':' + location.port) : '') + '/manifest.webapp';
      
      navigator.mozApps.mgmt.getAll().onsuccess = function gotApps(evt) {
       var apps = evt.target.result;
       for (var i = 0; i < apps.length && privacyPanelApp === null; i++) {
          var app = apps[i];
          if (app.manifestURL === this._privacyPanelManifestURL) {
           this._privacyPanelApp = app;
          }
       }
      };
    },

    /**
     * Launch Privacy Panel app.
     */
    launch: function(event) {
      event.stopImmediatePropagation();
      event.preventDefault();
      
      if (this._privacyPanelApp) {
          // Let privacy-panel app know that we launched it from settings
          // so the app can show us a back button pointing to settings app.
          navigator.mozSettings.createLock().set({
            'pp.launched.by.settings': true
          });
          privacyPanelApp.launch();
      } else {
          alert(navigator.mozL10n.get('no-privacypanel'));
      }
    }
  };

  return new PrivacyPanelHandler();
});