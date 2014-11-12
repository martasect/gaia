'use strict';

var assert = require('assert');
var PRIVACYPANEL_TEST_APP = 'app://privacy-panel.gaiamobile.org';

marionette('check ala main panel', function() {
  var client = marionette.client({
    settings: {
      'geolocation.enabled': false,
      'ala.settings.enabled': false,
      'geolocation.type': 'no-location'
    }
  });

  setup(function() {
    client.apps.launch(PRIVACYPANEL_TEST_APP);
    client.apps.switchToApp(PRIVACYPANEL_TEST_APP);
    client.helper.waitForElement('body');
  });

  test('ability to set geolocation and use location adjustment', function() {
    var useLocationBlurBox = client.findElement('.show-when-geolocation-on');
    var geolocationTypeBox = client.findElement('.geolocation-type-box');
    var description1 = client.findElement('.hide-when-ala-on');
    var description2 = client.findElement('.show-when-ala-on.description');
    var addExceptionBox = client.findElement('.add-exception-box');
    var typeBlur = client.findElement('.type-blur');
    var typeCustom = client.findElement('.type-custom-location');
    var geolocationSwitcher = client.findElement(
      'span[data-l10n-id="use-geolocation"]');
    var alaSwitcher = client.findElement(
      'span[data-l10n-id="use-location-blur"]');


    // display ala panel
    client.findElement('#menu-item-ala').click();
    client.waitFor(function() {
      return client.findElement('#ala-main').displayed();
    });
    assert.ok( ! useLocationBlurBox.displayed());


    // turn geolocation on
    geolocationSwitcher.tap();
    client.waitFor(function() {
      return useLocationBlurBox.displayed();
    });
    assert.ok(description1.displayed());
    assert.ok( ! description2.displayed());


    // turn use location adjustment on
    alaSwitcher.click();
    client.waitFor(function() {
      return geolocationTypeBox.displayed();
    });
    assert.ok( ! description1.displayed());
    assert.ok(description2.displayed());
    assert.ok( ! typeBlur.displayed());
    assert.ok( ! typeCustom.displayed());

    
    /**@todo: test select values change */
    

    // turn geolocation off
    geolocationSwitcher.click();
    client.waitFor(function() {
      return ! useLocationBlurBox.displayed();
    });
    assert.ok( ! geolocationTypeBox.displayed());

    
    // turn geolocation on
    geolocationSwitcher.click();
    client.waitFor(function() {
      return useLocationBlurBox.displayed();
    });
    assert.ok( geolocationTypeBox.displayed());


    // turn use location adjustment off
    alaSwitcher.click();
    client.waitFor(function() {
      return ! geolocationTypeBox.displayed();
    });
    assert.ok(description1.displayed());
    assert.ok( ! description2.displayed());
    assert.ok( ! typeBlur.displayed());
    assert.ok( ! typeCustom.displayed());
    assert.ok( ! addExceptionBox.displayed());


    // turn geolocation off
    geolocationSwitcher.click();
    client.waitFor(function() {
      return ! useLocationBlurBox.displayed();
    });
  });
});