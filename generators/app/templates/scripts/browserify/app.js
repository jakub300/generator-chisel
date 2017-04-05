/*
  Project: <%= name %>
  Author: <%= author %>
 */

<% if(features.has_vue) { %>
var Vue = require('vue');
var Hello = require('./hello.vue');

new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(Hello)
  }
});
<% } else { %>
var greet = require('./greeting.js')

greet('World');
<% } %>
