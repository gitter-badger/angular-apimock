angular.module('apiMock', [])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpInterceptor');
})

.provider('apiMock', function() {
  var $location;

  function shouldReplace(req) {
    return req.url.indexOf(config.apiPath) === 0;
  }

  function replacePath(req) {
    var path = req.url.substring(config.apiPath.length);
    req.url = config.mockDataPath + path + '.' + req.method.toLowerCase() + '.json';
  }

  function isMocking() {
    var regex = /apimock/i;
    var found = false;

    angular.forEach($location.search(), function(value, key) {
      if (regex.test(key)) {
        // Update $location object with primitive boolean compatibility in case if string type.
        if (value === true || angular.lowercase(value) === 'true') {
          found = true;
          $location.search(key, null);
          $location.search('apimock', true);
        }
      }
    });

    return found;
  }

  var config = {
    mockDataPath: '/mock_data',
    apiPath: '/api',
    shouldReplace: shouldReplace,
    replacePath: replacePath,
    isMocking: isMocking
  };

  function ApiMock(_$location) {
    angular.extend(this, config);
    $location = _$location;
  }

  this.config = function (options) {
    angular.extend(config, options);
  };

  this.$get = function ($location) {
    return new ApiMock($location);
  };
})

.provider('httpInterceptor', function() {
  function HttpInterceptor($q, apiMock) {
    this.request = function (req) {
      if (req && apiMock.isMocking() && apiMock.shouldReplace(req)) {
        apiMock.replacePath(req);
      }

      return req || $q.when(req);
    };
  }

  this.$get = function ($q, apiMock) {
    return new HttpInterceptor($q, apiMock);
  };
});
