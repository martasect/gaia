/* global LoadHelper */

(function() {
  'use strict';

  document.getElementById('menu-item-gt').addEventListener('click', function() {
    window.LazyLoader.load(
      [
        document.getElementById('welcome'),
        document.getElementById('la_explain'),
        document.getElementById('la_blur'),
        document.getElementById('la_custom'),
        document.getElementById('la_exceptions'),
        document.getElementById('rpp_explain'),
        document.getElementById('rpp_passphrase'),
        document.getElementById('rpp_locate'),
        document.getElementById('rpp_ring'),
        document.getElementById('rpp_lock')
      ],
      function() {
        document.getElementById('root').style.display = 'none';
        document.getElementById('welcome').style.display = 'block';

        var sections = document.querySelectorAll('section[data-section="gt"]');
        LoadHelper.registerEvents(sections);
      }
    );
  });

})();
