'use strict';

var assert = require('assert');
var PRIVACYPANEL_TEST_APP = 'app://privacy-panel.gaiamobile.org';

marionette('check main page', function() {
  var client = marionette.client({
    settings: {
      'lockscreen.enabled': false
    }
  });

  setup(function() {
    client.apps.launch(PRIVACYPANEL_TEST_APP);
    client.apps.switchToApp(PRIVACYPANEL_TEST_APP);
    client.helper.waitForElement('body');
  });

  test('first test', function() {
    console.log('inside');
    assert.ok(true);
  });
});
