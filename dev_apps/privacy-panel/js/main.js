/* global AppList */
/* global Crypto */
/* global CustomLocationPanel */

var app = app || {};

(function() {
  'use strict';

  app.init = function() {
    app.settings = window.navigator.mozSettings;
    if (!app.settings) {
      return;
    }

    app.elements = {
      $root:          document.getElementById('root'),
      $rootBackBtn:   document.getElementById('back'),
      currentApp:     null,
      ALA: {
        $link:        document.getElementById('menuItem-ALA'),
        $back:        document.getElementById('ALA-back'),
        $box:         document.getElementById('ALA'),
        geo: {
          $switch:    document.getElementById('geolocation-switch'),
          $box:       document.getElementById('geolocation-box')
        },
        settings: {
          $switch:    document.getElementById('settings-switch')
        },
        type: {
          $select:    document.getElementById('ALA-type'),
          $elements:  document.getElementById('ALA').querySelectorAll('.type-box'),
          $blurBox:   document.getElementById('type-blur'),
          $blurSlider:document.getElementById('blur-slider'),
          $blurLabel: document.getElementById('blur-label'),
          $customBox: document.getElementById('type-custom-location')
        },
        exception: {
          $box:       document.getElementById('add-exception-box'),
          $link:      document.getElementById('add-exception')
        }
      },
      Exceptions: {
        $box:         document.getElementById('excepions-panel'),
        $back:        document.getElementById('exceptions-back'),
        $appBox:      document.getElementById('app-list')
      },
      Application: {
        $box:         document.getElementById('app-panel'),
        $back:        document.getElementById('app-back'),
        type: {
          $select:    document.getElementById('app-type'),
          $elements:  document.getElementById('app-panel').querySelectorAll('.type-box'),
          $blurBox:   document.getElementById('app-type-blur'),
          $blurSlider:document.getElementById('app-blur-slider'),
          $blurLabel: document.getElementById('app-blur-label'),
          $customBox: document.getElementById('app-type-custom-location'),
          $infoBox:   document.getElementById('app-panel').querySelector('.app-info')
        }
      },
      RPP: {
        $link:        document.getElementById('menuItem-RPP'),
        $back:        document.getElementById('RPP-back'),
        $box:         document.getElementById('RPP'),
        $menu:        document.getElementById('RPP-menu'),
        $newPass:     document.getElementById('RPP-new-password'),
        $login:       document.getElementById('RPP-login'),
        $changePass:  document.getElementById('RPP-change-password'),
        RemoteLocate: {
          $box:       document.querySelector('#RPP .remote-locate'),
          $input:     document.querySelector('#RPP .remote-locate input')
        },
        RemoteRing: {
          $box:       document.querySelector('#RPP .remote-ring'),
          $input:     document.querySelector('#RPP .remote-ring input')
        },
        RemoteLock: {
          $box:       document.querySelector('#RPP .remote-lock'),
          $input:     document.querySelector('#RPP .remote-lock input')
        },
        RemoteWipe: {
          $box:       document.querySelector('#RPP .remote-wipe'),
          $input:     document.querySelector('#RPP .remote-wipe input')
        },
        $changePassLink: document.getElementById('change-password-link')
      },
      DCL: new CustomLocationPanel()
    };

    // Observe 'privacy-panel.launched-by-settings' setting to be able to
    // detect launching point.
    app.settings.addObserver('pp.launched.by.settings', function(evt) {
      app.toggleRootBackBtn(evt.settingValue);
    });

    // Get the launch flag whe app starts.
    app.getLaunchFlag(function(result) {
      app.toggleRootBackBtn(result);
    });

    // Get the flag every time app is activated.
    window.addEventListener('focus', function() {
      app.getLaunchFlag(function(result) {
        app.toggleRootBackBtn(result);
      });
    });

    // Reset launch flag when app is not active.
    window.addEventListener('blur', function() {
      app.settings.createLock().set({ 'pp.launched.by.settings': false });
    });

    // prepare app list that uses geolocation
    AppList.get('geolocation', function(apps) {
      app.elements.appList = apps;
    });

    // prepare exception list
    var applicationList = this.settings.createLock().get('geolocation.exceptions');
    applicationList.onsuccess = function() {
      app.elements.exceptionsList = applicationList.result['geolocation.exceptions'] || {};
    };


    // listeners for ALA
    app.elements.ALA.$link.addEventListener('click', app.showALABox);
    app.elements.ALA.$back.addEventListener('click', app.showRootBox);

    app.elements.ALA.geo.$switch.addEventListener('click', function(event) { app.toggleGeolocation(event.target.checked, true); });
    app.elements.ALA.settings.$switch.addEventListener('click', function(event) { app.toggleSettings(event.target.checked, true); });

    app.elements.ALA.type.$select.addEventListener('change', function(event) { app.changeType(event.target.value, true); });
    app.elements.ALA.type.$blurSlider.addEventListener('change', function(event) { app.changeBlurSlider(event.target.value); });
    app.elements.ALA.type.$blurSlider.addEventListener('touchmove', function(event) { app.updateSliderLabel(event.target.value); });
    app.elements.ALA.type.$customBox.addEventListener('click', app.showCustomLocationBox);

    app.elements.ALA.exception.$link.addEventListener('click', app.showExceptions);

    // listeners for Exceptions
    app.elements.Exceptions.$back.addEventListener('click', app.backToALA);

    // listeners for Application Panel
    app.elements.Application.$back.addEventListener('click', function() {
      app.elements.currentApp = null;
      app.showExceptions();
    });
    app.elements.Application.type.$select.addEventListener('change', function(event) { app.changeAppType(event.target.value, true); });
    app.elements.Application.type.$blurSlider.addEventListener('change', function(event) { app.changeAppBlurSlider(event.target.value); });
    app.elements.Application.type.$blurSlider.addEventListener('touchmove', function(event) { app.updateAppSliderLabel(event.target.value); });
    app.elements.Application.type.$customBox.addEventListener('click', app.showAppCustomLocationBox);

    // listeners for RPP
    app.elements.RPP.$link.addEventListener('click', app.showRPPBox);
    app.elements.RPP.$back.addEventListener('click', app.showRootBox);
    app.elements.RPP.$changePassLink.addEventListener('click', app.showChangePassBox);

    app.elements.RPP.$newPass.querySelector('button.rpp-new-password-ok').addEventListener('click', app.savePassword);
    app.elements.RPP.$login.querySelector('button.rpp-login-ok').addEventListener('click', app.login);
    app.elements.RPP.$changePass.querySelector('button.rpp-change-password-ok').addEventListener('click', app.changePassword);

    app.elements.RPP.RemoteLocate.$input.addEventListener('change', function(event) { app.toggleRemoteLocate(event.target.checked); });
    app.elements.RPP.RemoteRing.$input.addEventListener('change', function(event) { app.toggleRemoteRing(event.target.checked); });
    app.elements.RPP.RemoteLock.$input.addEventListener('change', function(event) { app.toggleRemoteLock(event.target.checked); });
    app.elements.RPP.RemoteWipe.$input.addEventListener('change', function(event) { app.toggleRemoteWipe(event.target.checked); });
  };

  /**
   * Gets launch from settings flag from setting
   *
   * @param {Function} callback
   */
  app.getLaunchFlag = function(callback) {
    var ppLaunchFlag = app.settings.createLock().get('pp.launched.by.settings');
    ppLaunchFlag.onsuccess = function() {
      app.launchFlag = ppLaunchFlag.result['pp.launched.by.settings'] || false;
      callback && callback(app.launchFlag);
    };
    ppLaunchFlag.onerror = function() {
      console.warn('Get pp.launched.by.settings failed');
    };
  };

  /**
   * Toggles back button visibility
   *
   * @param {Boolean} visible
   */
  app.toggleRootBackBtn = function(visible) {
    app.elements.$rootBackBtn.style.display = visible ? 'block' : 'none';
  };


  /**
   * Show main Privacy Panel screen.
   */
  app.showRootBox = function() {
    // show main panel
    app.elements.$root.style.display = 'block';

    // hide ALA panel
    app.elements.ALA.$box.style.display = 'none';

    // hide RPP panel
    app.elements.RPP.$box.style.display = 'none';
    app.elements.RPP.RemoteLocate.$box.style.display = 'none';
    app.elements.RPP.RemoteRing.$box.style.display = 'none';
    app.elements.RPP.RemoteLock.$box.style.display = 'none';
    app.elements.RPP.RemoteWipe.$box.style.display = 'none';
  };

  /**** ALA part **************************************************************/
  /**
   * Show ALA screen.
   */
  app.showALABox = function() {
    app.elements.$root.style.display = 'none';
    app.elements.ALA.$box.style.display = 'block';
    app.toggleGeolocation(false, false);

    // check if geolocation is enabled
    var status1 = app.settings.createLock().get('geolocation.enabled');
    status1.onsuccess = function() {
      var showGeolocation = status1.result['geolocation.enabled'];

      // show Geolocation box if enabled
      app.toggleGeolocation(showGeolocation, false);

      // set switch position
      app.elements.ALA.geo.$switch.checked = showGeolocation;
    };

    // check if settings are enabled
    var status2 = app.settings.createLock().get('ala.settings.enabled');
    status2.onsuccess = function() {
      var showSettings = status2.result['ala.settings.enabled'];

      // show setting-boxes if settings enabled
      app.toggleSettings(showSettings, false);

      // set settings switch position
      app.elements.ALA.settings.$switch.checked = showSettings;
    };

    // get blur type value
    var status3 = app.settings.createLock().get('geolocation.blur.type');
    status3.onsuccess = function() {
      var type = status3.result['geolocation.blur.type'];

      // set checkbox value
      app.elements.ALA.type.$select.value = type;

      // change settings type
      app.changeType(type, false);
    };

    // get blur radius value
    var status4 = app.settings.createLock().get('geolocation.blur.slider');
    status4.onsuccess = function() {
      var sliderValue = status4.result['geolocation.blur.slider'];

      // set slider value
      app.elements.ALA.type.$blurSlider.value = sliderValue;

      // set slider label
      app.updateSliderLabel(sliderValue);
    };
  };

  /**
   * Show main Custom location screen.
   */
  app.showCustomLocationBox = function() {
    var customSettings = {};
    var customSettingsKeys = [
      { key: 'geolocation.blur.cl.type',    name: "type" },
      { key: 'geolocation.blur.cl.country', name: "country" },
      { key: 'geolocation.blur.cl.city',    name: "city" },
      { key: 'geolocation.blur.longitude',  name: "longitude" },
      { key: 'geolocation.blur.latitude',   name: "latitude" },
      { key: 'geolocation.blur.cl.type',    name: "type" }
    ];

    var lock = app.settings.createLock();
    var toCompletion = customSettingsKeys.length;

    [].forEach.call(customSettingsKeys, function(item) {
      var getReq = lock.get(item.key);
      getReq.onsuccess = function() {
        if (getReq.result[item.key] !== undefined) {
         customSettings[item.name] = getReq.result[item.key];
        }

        if (--toCompletion === 0) {
          app.elements.DCL.initAndShow(customSettings, app.saveCustomLocation);
        }
      };
      getReq.onerror = function() {
        if (--toCompletion === 0) {
          app.elements.DCL.initAndShow(customSettings, app.saveCustomLocation);
        }
      };
    });
  };

  /**
   * Save custom location settings.
   * @param {Object} settings
   */
  app.saveCustomLocation = function(settings) {
    var lock = app.settings.createLock();
    var flag = settings.latitude && settings.longitude;

    lock.set({
      'geolocation.blur.cl.type':     settings.type,
      'geolocation.blur.cl.country':  settings.country,
      'geolocation.blur.cl.city':     settings.city,
      'geolocation.blur.longitude':   settings.longitude,
      'geolocation.blur.latitude':    settings.latitude,
      'geolocation.blur.coords':      flag ? '@' + settings.latitude + ',' + settings.longitude : ''
    });
  };

  /**
   * Toggle Geolocation box
   * @param {Boolean} value
   * @param {Boolean} save
   */
  app.toggleGeolocation = function(value, save) {
    // toggle geolocation box
    app.elements.ALA.geo.$box.style.display = (value) ? 'block' : 'none';

    if (save) {
      // save current value to settings
      app.settings.createLock().set({ 'geolocation.enabled': value });
    }
  };

  /**
   * Toggle setting box.
   * @param {Boolean} value
   * @param {Boolean} save
   */
  app.toggleSettings = function(value, save) {
    if (value) {
      app.elements.ALA.geo.$box.classList.add('settings-enabled');
      app.elements.ALA.geo.$box.classList.remove('settings-disabled');
    } else {
      app.elements.ALA.geo.$box.classList.remove('settings-enabled');
      app.elements.ALA.geo.$box.classList.add('settings-disabled');
    }

    if (save) {
      app.settings.createLock().set({ 'ala.settings.enabled': value });
    }
  };


  /**
   * Change ALA type
   * @param {String} value
   * @param {Boolean} save
   */
  app.changeType = function(value, save) {

    if (save) {
      // save current type
      app.settings.createLock().set({'geolocation.blur.type': value});
    }

    // hide all elements
    for (var $el of app.elements.ALA.type.$elements) {
      $el.classList.add('disabled');
      $el.classList.remove('enabled');
    }

    switch (value) {
      case 'user-defined':
        app.elements.ALA.type.$customBox.classList.add('enabled');
        app.elements.ALA.type.$customBox.classList.remove('disabled');
        break;
      case 'blur':
        app.elements.ALA.type.$blurBox.classList.add('enabled');
        app.elements.ALA.type.$blurBox.classList.remove('disabled');

        app.updateSliderLabel(app.elements.ALA.type.$blurSlider.value);
        break;
      case 'precise':
      case 'no-location':
        break;
      default:
        break;
    }
  };

  /**
   * Update slider label
   * @param {Number} value
   */
  app.updateSliderLabel = function(value) {
    app.elements.ALA.type.$blurLabel.textContent = app.getRadiusLabel(value);
  };

  /**
   * Change blur slider
   * @param {Number} value
   */
  app.changeBlurSlider = function(value) {
    // save slider value
    app.settings.createLock().set({ 'geolocation.blur.slider': value });

    // save radius
    app.settings.createLock().set({ 'geolocation.blur.radius': app.getRadiusValue(value) });

    // set slider label
    app.updateSliderLabel(value);
  };

  /**
   * Get radius label from input value.
   * @param {number} value
   * @return {String}
   */
  app.getRadiusLabel = function(value) {
    switch(parseInt(value)) {
      case 1:   return '500m';
      case 2:   return '1km';
      case 3:   return '2km';
      case 4:   return '5km';
      case 5:   return '10km';
      case 6:   return '15km';
      case 7:   return '20km';
      case 8:   return '50km';
      case 9:   return '75km';
      case 10:  return '100km';
      case 11:  return '500km';
      case 12:  return '1000km';
      default:  return '';
    }
  };

  /**
   * Get radius value from input value.
   * @param {number} value
   * @return {number}
   */
  app.getRadiusValue = function(value) {
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
  };

  /**** Exceptions part *******************************************************/
  /**
   * Show Exception panel
   */
  app.showExceptions = function() {
    app.elements.ALA.$box.style.display = 'none';
    app.elements.Application.$box.style.display = 'none';
    app.elements.Exceptions.$box.style.display = 'block';

    // render app list
    var manifest, icon, li;

    app.elements.appList.forEach(function(item, index) {
      manifest = item.manifest || item.updateManifest;
      icon = AppList.icon(item);

      li = app.genAppItemTemplate({
        manifestUrl: item.manifestURL,
        name: manifest.name,
        index: index,
        iconSrc: icon
      });
      app.elements.Exceptions.$appBox.appendChild(li);
    });
  };

  /**
   * Render App item
   * @param itemData
   * @returns {HTMLElement}
   */
  app.genAppItemTemplate = function(itemData) {
    var icon = document.createElement('img');
    var item = document.createElement('li');
    var link = document.createElement('a');
    var name = document.createTextNode(itemData.name);
    icon.src = itemData.iconSrc;
    link.classList.add('menu-item');
    link.appendChild(icon);
    link.appendChild(name);
    link.addEventListener('click', function(){ app.showApplicationPanel(itemData); });
    item.classList.add('app-element');
    item.appendChild(link);
    return item;
  };

  /**
   * Go back to ALA panel
   */
  app.backToALA = function() {
    app.elements.ALA.$box.style.display = 'block';
    app.elements.Exceptions.$box.style.display = 'none';
  };

  /**** Application part ******************************************************/
  /**
   * Show Application Panel
   * @param itemData
   */
  app.showApplicationPanel = function(itemData) {

    app.elements.currentApp = itemData.manifestUrl;

    app.elements.Exceptions.$box.style.display = 'none';
    app.elements.Application.$box.style.display = 'block';

    // set application info
    app.elements.Application.type.$infoBox.querySelector('img').src = itemData.iconSrc;
    app.elements.Application.type.$infoBox.querySelector('span').textContent = itemData.name;

    var application = app.elements.exceptionsList[itemData.manifestUrl];
    if (!application) {
      // set default value (from general settings)
      app.elements.Application.type.$select.value = 'system-settings';
      app.changeAppType('system-settings', false);
    } else {
      //show item's values

      // set checkbox value
      app.elements.Application.type.$select.value = application.type;

      // change settings type
      app.changeAppType(application.type, false);

      // set slider value
      app.elements.Application.type.$blurSlider.value = application.slider;

      // set slider label
      app.updateAppSliderLabel(application.slider);
    }
  };

  /**
   * Change Application type
   * @param {String} value
   * @param {Boolean} save
   */
  app.changeAppType = function(value, save) {

    // hide all elements
    for (var $el of app.elements.Application.type.$elements) {
      $el.classList.add('disabled');
      $el.classList.remove('enabled');
    }

    switch (value) {
      case 'user-defined':
        app.elements.Application.type.$customBox.classList.add('enabled');
        app.elements.Application.type.$customBox.classList.remove('disabled');
        break;
      case 'blur':
        app.elements.Application.type.$blurBox.classList.add('enabled');
        app.elements.Application.type.$blurBox.classList.remove('disabled');

        app.updateAppSliderLabel(app.elements.Application.type.$blurSlider.value);
        break;
      case 'system-settings':
        // remove application
        if (save === true) {
          app.removeApplication();
        }
        return;
      case 'precise':
      case 'no-location':
        break;
      default:
        break;
    }

    // save current type
    if (save === true) {
      app.saveApplications();
    }
  };

  /**
   * Update slider label for application
   * @param {Number} value
   */
  app.updateAppSliderLabel = function(value) {
    app.elements.Application.type.$blurLabel.textContent = app.getRadiusLabel(value);
  };

  /**
   * Change blur slider for application
   * @param {Number} value
   */
  app.changeAppBlurSlider = function(value) {
    app.saveApplications();

    // set slider label
    app.updateAppSliderLabel(value);
  };

  /**
   * Show main Custom location screen.
   */
  app.showAppCustomLocationBox = function() {
    var application = app.elements.exceptionsList[app.elements.currentApp];
    var customSettings = {};

    if (application.cl_type) {
      customSettings.type = application.cl_type;
    }
    if (application.cl_country) {
      customSettings.country = application.cl_country;
    }
    if (application.cl_city) {
      customSettings.city = application.cl_city;
    }
    if (application.cl_longitude) {
      customSettings.longitude = application.cl_longitude;
    }
    if (application.cl_latitude) {
      customSettings.latitude = application.cl_latitude;
    }

    app.elements.DCL.initAndShow(customSettings, app.saveAppCustomLocation);
  };

  /**
   * Save custom location settings for app.
   * @param {Object} settings
   */
  app.saveAppCustomLocation = function(settings) {
    var flag = settings.latitude && settings.longitude;

    app.saveApplications({
      coords:       flag ? '@' + settings.latitude + ',' + settings.longitude : '',
      cl_type:      settings.type,
      cl_country:   settings.country,
      cl_city:      settings.city,
      cl_longitude: settings.longitude,
      cl_latitude:  settings.latitude
    });
  };

  /**
   * Save application list.
   * @param {Object|Null} settings
   */
  app.saveApplications = function(settings) {
    var current = app.elements.exceptionsList[app.elements.currentApp] || {};
    var extraSettings = settings || {};

    app.elements.exceptionsList[app.elements.currentApp] = {
      type:   app.elements.Application.type.$select.value,
      slider: app.elements.Application.type.$blurSlider.value,
      radius: app.getRadiusValue(app.elements.Application.type.$blurSlider.value),

      coords:       extraSettings.coords || current.coords || null,
      cl_type:      extraSettings.cl_type || current.cl_type || null,
      cl_country:   extraSettings.cl_country || current.cl_country || null,
      cl_city:      extraSettings.cl_city || current.cl_city || null,
      cl_longitude: extraSettings.cl_longitude || current.cl_longitude || null,
      cl_latitude:  extraSettings.cl_latitude || current.cl_latitude || null
    };

    app.settings.createLock().set({ 'geolocation.exceptions': app.elements.exceptionsList });
  };

  /**
   * Remove application from list
   */
  app.removeApplication = function() {
    delete app.elements.exceptionsList[app.elements.currentApp];

    app.settings.createLock().set({ 'geolocation.exceptions': app.elements.exceptionsList });
  };

  /**** RPP part **************************************************************/
  /**
   * Show RPP screen
   */
  app.showRPPBox = function() {
    app.elements.$root.style.display = 'none';
    app.elements.RPP.$box.style.display = 'block';

    // Get current passphrase and display proper screen
    var status = app.settings.createLock().get('rpp.password');
    status.onsuccess = function() {
      var password = status.result['rpp.password'];

      app.elements.RPP.$menu.style.display = 'none';
      app.elements.RPP.$newPass.style.display = (!password) ? 'block' : 'none';
      app.elements.RPP.$login.style.display = (password) ? 'block' : 'none';
      app.elements.RPP.$changePass.style.display = 'none';
    };
  };

  /**
   * Show RPP menu
   */
  app.showRPPMenu = function() {
    app.elements.RPP.$menu.style.display = 'block';
    app.elements.RPP.$newPass.style.display = 'none';
    app.elements.RPP.$login.style.display = 'none';
    app.elements.RPP.$changePass.style.display = 'none';


    // get Remote Locate value from settings
    var status1 = app.settings.createLock().get('rpp.locate.enabled');
    status1.onsuccess = function() {
      app.elements.RPP.RemoteLocate.$input.checked = (status1.result['rpp.locate.enabled'] === true);
      app.elements.RPP.RemoteLocate.$box.style.display = 'block';
    };

    // get Remote Ring value from settings
    var status2 = app.settings.createLock().get('rpp.ring.enabled');
    status2.onsuccess = function() {
      app.elements.RPP.RemoteRing.$input.checked = (status2.result['rpp.ring.enabled'] === true);
      app.elements.RPP.RemoteRing.$box.style.display = 'block';
    };

    // get Remote Lock value from settings
    var status3 = app.settings.createLock().get('rpp.lock.enabled');
    status3.onsuccess = function() {
      app.elements.RPP.RemoteLock.$input.checked = (status3.result['rpp.lock.enabled'] === true);
      app.elements.RPP.RemoteLock.$box.style.display = 'block';
    };

    // get Remote Wipe value from settings
    var status4 = app.settings.createLock().get('rpp.wipe.enabled');
    status4.onsuccess = function() {
      app.elements.RPP.RemoteWipe.$input.checked = (status4.result['rpp.wipe.enabled'] === true);
      app.elements.RPP.RemoteWipe.$box.style.display = 'block';
    };
  };


  /**
   * Save new password
   */
  app.savePassword = function() {
    var pass1 = app.elements.RPP.$newPass.querySelector('#rpp-new-pass1').value,
        pass2 = app.elements.RPP.$newPass.querySelector('#rpp-new-pass2').value,
        passHash = Crypto.MD5(pass1).toString(),
        $validationMessage = app.elements.RPP.$newPass.querySelector('.validation-message');

    if (!(pass1 && pass2)) {
      $validationMessage.textContent = 'Passphrase/confirmation is empty!';
      $validationMessage.style.display = 'block';
    } else if (pass1.length > 100 || pass2.length > 100) {
      $validationMessage.textContent = 'Passphrase is too long!';
      $validationMessage.style.display = 'block';
    } else if (pass1 !== pass2) {
      // passwords are valid
      $validationMessage.textContent = 'Confirmation must match passphrase!';
      $validationMessage.style.display = 'block';
    } else {
      // clear validation message
      $validationMessage.textContent = '';
      $validationMessage.style.display = 'none';

      // saving password
      app.settings.createLock().set({ 'rpp.password': passHash });
      app.showRPPMenu();
    }
  };

  /**
   * Login to RPP
   */
  app.login = function() {
    var pass = app.elements.RPP.$login.querySelector('#rpp-login-pass').value,
        passHash = Crypto.MD5(pass).toString(),
        $validationMessage = app.elements.RPP.$login.querySelector('.validation-message'),
        password;

    var status = app.settings.createLock().get('rpp.password');
    status.onsuccess = function() {
      password = status.result['rpp.password'];

      if (password === passHash) {
        // clear validation message
        $validationMessage.textContent = '';
        $validationMessage.style.display = 'none';

        // clear password input
        app.elements.RPP.$login.querySelector('#rpp-login-pass').value = '';

        // show RPP menu
        app.showRPPMenu();
      } else {
        // passwords are valid
        $validationMessage.textContent = 'Passphrase is wrong!';
        $validationMessage.style.display = 'block';
      }
    };
  };

  app.showChangePassBox = function () {
    app.elements.RPP.$login.style.display = 'none';
    app.elements.RPP.$changePass.style.display = 'block';

    var pin = app.elements.RPP.$changePass.querySelector('#rpp-pin'),
    pass1 = app.elements.RPP.$changePass.querySelector('#rpp-change-pass1'),
    pass2 = app.elements.RPP.$changePass.querySelector('#rpp-change-pass2'),
    $pinValidationMessage = app.elements.RPP.$changePass.querySelector('.pin-validation-message'),
    $validationMessage = app.elements.RPP.$changePass.querySelector('.validation-message');

    pin.value = '';
    pass1.value = '';
    pass2.value = '';

    $validationMessage.textContent = '';
    $validationMessage.style.display = 'none';

    $pinValidationMessage.textContent = '';
    $pinValidationMessage.style.display = 'none';
  };

  app.changePassword = function () {
    var pin = app.elements.RPP.$changePass.querySelector('#rpp-pin').value,
    pass1 = app.elements.RPP.$changePass.querySelector('#rpp-change-pass1').value,
    pass2 = app.elements.RPP.$changePass.querySelector('#rpp-change-pass2').value,
    passHash = Crypto.MD5(pass1).toString(),
    $pinValidationMessage = app.elements.RPP.$changePass.querySelector('.pin-validation-message'),
    $validationMessage = app.elements.RPP.$changePass.querySelector('.validation-message');

    if (!(pass1 && pass2)) {
      $validationMessage.textContent = 'Passphrase/confirmation is empty!';
      $validationMessage.style.display = 'block';

      $pinValidationMessage.textContent = '';
      $pinValidationMessage.style.display = 'none';
    } else if (pass1 !== pass2) {
      $validationMessage.textContent = 'Confirmation must match passphrase!';
      $validationMessage.style.display = 'block';

      $pinValidationMessage.textContent = '';
      $pinValidationMessage.style.display = 'none';
    } else if (pass1.length > 100 || pass2.length > 100) {
      $validationMessage.textContent = 'Passphrase is too long!';
      $validationMessage.style.display = 'block';
    } else if (!pin) {
      $pinValidationMessage.textContent = 'Passcode lock/SIM PIN is empty!';
      $pinValidationMessage.style.display = 'block';

      $validationMessage.textContent = '';
      $validationMessage.style.display = 'none';
    } else {
      $validationMessage.textContent = '';
      $validationMessage.style.display = 'none';

      $pinValidationMessage.textContent = 'Wrong Passcode lock/SIM PIN!';
      $pinValidationMessage.style.display = 'block';

      var mobileConnections = navigator.mozMobileConnections;
      if (mobileConnections && mobileConnections.length > 0) {
        var mobileConnection = mobileConnections[0];
        if (mobileConnection) {
          var icc = navigator.mozIccManager.getIccById(mobileConnection.iccId);
          if (icc) {
            var unlockOptions = {};
            unlockOptions.lockType = 'pin';
            unlockOptions.pin = pin;
            var unlock = icc.unlockCardLock(unlockOptions);

            unlock.onsuccess = function () {
              $pinValidationMessage.textContent = '';
              $pinValidationMessage.style.display = 'none';

              $validationMessage.textContent = '';
              $validationMessage.style.display = 'none';

              app.settings.createLock().set({ 'rpp.password': passHash });
              app.showRPPBox();
            };

            unlock.onerror = function () {
              var lock = app.settings.createLock();
              if (lock) {
                var codeReq = lock.get('lockscreen.passcode-lock.code');
                if (codeReq) {
                  codeReq.onsuccess = function () {
                    if (pin === codeReq.result['lockscreen.passcode-lock.code']) {
                      var enabledReq = lock.get('lockscreen.passcode-lock.enabled');
                      if (enabledReq) {
                        enabledReq.onsuccess = function () {
                          if (enabledReq.result['lockscreen.passcode-lock.enabled']) {
                            $pinValidationMessage.textContent = '';
                            $pinValidationMessage.style.display = 'none';

                            $validationMessage.textContent = '';
                            $validationMessage.style.display = 'none';

                            app.settings.createLock().set({ 'rpp.password': passHash });
                            app.showRPPBox();
                          }
                        };

                        enabledReq.onerror = function () {};
                      }

                    }
                  };

                  codeReq.onerror = function () {};
                }
              }
            };
          }
        }
      }
    }
  };

  /**
   * Save Remote Locate value
   * @param {Boolean} value
   */
  app.toggleRemoteLocate = function(value) {
    app.settings.createLock().set({ 'rpp.locate.enabled': value });
  };

  /**
   * Save Remote Ring value
   * @param {Boolean} value
   */
  app.toggleRemoteRing = function(value) {
    app.settings.createLock().set({ 'rpp.ring.enabled': value });
  };

  /**
   * Save Remote Lock value
   * @param {Boolean} value
   */
  app.toggleRemoteLock = function(value) {
    app.settings.createLock().set({ 'rpp.lock.enabled': value });
  };

  /**
   * Save Remote Wipe value
   * @param {Boolean} value
   */
  app.toggleRemoteWipe = function(value) {
    app.settings.createLock().set({ 'rpp.wipe.enabled': value });
  };

  app.init();
}());
