'use strict';

var realNavigatormozSetMessageHandler;
var passphrase;

suite('SMS Main', function() {
  suiteSetup(function(done) {
    require(['mocks/mock_navigator_moz_set_message_handler', 'rpp/passphrase'],
      function(MockNavigatormozSetMessageHandler, PassPhrase) {
        realNavigatormozSetMessageHandler = navigator.mozSetMessageHandler;
        navigator.mozSetMessageHandler = MockNavigatormozSetMessageHandler;
        navigator.mozSetMessageHandler.mSetup();

        passphrase = new PassPhrase('rppmac', 'rppsalt');
        passphrase.change('mypass');

        /** @todo: mozSettings - reading RPP values */

        done();
      }
    );
  });

  setup(function(done) {
    require(['sms/main'], RPPExecuteCommands => {
      this.subject = RPPExecuteCommands;
      this.subject.init();
      this.subject._ring = sinon.spy();

      done();
    });
  });

  suiteTeardown(function() {
    MockNavigatormozSetMessageHandler.mTeardown();
    navigator.mozSetMessageHandler = realNavigatormozSetMessageHandler;
  });

  test('should get one apps', function(done) {

    // sending sms
    navigator.mozSetMessageHandler.mTrigger('sms-received', {
      body: 'rpp ring mypass',
      sender: 734123456
    });

    //sinon.assert.called(this.subject._ring);

    done();
  });
});
