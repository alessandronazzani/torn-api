angular.module('tornapi',['ngRoute','ngSanitize','mgcrea.ngStrap','ui.bootstrap','angular-growl','angularUtils.directives.dirPagination'])
.config(['$routeProvider','$httpProvider','growlProvider',
function ($routeProvider,$httpProvider,growlProvider)
{
  $routeProvider
     .when('/basic', {controller: tornapi, templateUrl:'/views/basic.html'})
     .when('/currency', {controller: tornapi, templateUrl:'/views/currency.html'})
     .when('/donationnewsfull', {controller: tornapi, templateUrl:'/views/donationnewsfull.html'})
     .when('/attacksfull', {controller: tornapi, templateUrl:'/views/attacksfull.html'})
     /*.when('/weapons', {controller: tornapi, templateUrl:'/views/weapons.html'})
     .when('/armor', {controller: tornapi, templateUrl:'/views/armor.html'})
     .when('/temporary', {controller: tornapi, templateUrl:'/views/temporary.html'})
     .when('/medical', {controller: tornapi, templateUrl:'/views/medical.html'})
     .when('/drugs', {controller: tornapi, templateUrl:'/views/drugs.html'})
     .when('/boosters', {controller: tornapi, templateUrl:'/views/boosters.html'})
     .when('/cesium', {controller: tornapi, templateUrl:'/views/cesium.html'})
     .when('/mainnews', {controller: tornapi, templateUrl:'/views/mainnews.html'})
     .when('/mainnewsfull', {controller: tornapi, templateUrl:'/views/mainnewsfull.html'})
     .when('/attacknews', {controller: tornapi, templateUrl:'/views/attacknews.html'})
     .when('/attacknewsfull', {controller: tornapi, templateUrl:'/views/attacknewsfull.html'})
     .when('/armorynews', {controller: tornapi, templateUrl:'/views/armorynews.html'})
     .when('/armorynewsfull', {controller: tornapi, templateUrl:'/views/armorynewsfull.html'})
     .when('/donationnews', {controller: tornapi, templateUrl:'/views/donationnews.html'})
     .when('/crimes', {controller: tornapi, templateUrl:'/views/crimes.html'})
     .when('/attacks', {controller: tornapi, templateUrl:'/views/attacks.html'})*/
     .otherwise({redirectTo:'/basic'});

    growlProvider.globalTimeToLive(5000);
    growlProvider.onlyUniqueMessages(false);

    $httpProvider.defaults.headers.put['Content-Type']='application/json';
    $httpProvider.defaults.headers.post['Content-Type']='application/json';
    $httpProvider.interceptors.push('myHttpInterceptor');
}])
.factory('myHttpInterceptor', ['$q', function ($q)
{
   var numLoadings = 0;

   return {
      'request': function(config)
      {
         numLoadings++;
         $('.c-loader').show();
         return config || $q.when(config);
      },
      'response': function(response)
      {
         if ((--numLoadings) === 0)
            $('.c-loader').hide();

         return response || $q.when(response);
      },
      'responseError': function(response)
      {
         if (!(--numLoadings))
            $('.c-loader').hide();

         return $q.reject(response);
      }
   }
}])
.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function()
      {
        var img= angular.element(this), src= img.attr('src');

        _.delay(function () 
        {
           if (src==img.attr('src'))
             img.attr('src',iAttrs.fallbackSrc);
        },100);
      });
    }
   }
   return fallbackSrc;
})
.directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  }
}])
.filter('utc', function(){
  return function(val) {
     var date = new Date(val);
     return new Date(date.getUTCFullYear(), 
                     date.getUTCMonth(), 
                     date.getUTCDate(),  
                     date.getUTCHours(), 
                     date.getUTCMinutes(), 
                     date.getUTCSeconds());
  };
})
.run(['$rootScope','$timeout','$http','$location',
function ($rootScope,$timeout,$http,$location)
{
  $rootScope.active= function(path,strict)
  {
     return (strict ? $location.path() : $location.path().substr(0, path.length)) == path;
  };

  $rootScope.activesub= function(list)
  {
     return _.find(list, function(l) { return $location.path().indexOf(l) > -1; });
  };

  $rootScope.messages= []; 

  var closeMessage= $rootScope.closeMessage= function(idx)
  {
     $rootScope.messages.splice(idx,1);
  };

  $rootScope.messageView= function(message)
  {
     return '/views/messages/'+message+'.html';
  };

  $rootScope.addMessage= function(message)
  {
     $rootScope.messages.push(message);

     $timeout(function()
     {
        var i= $rootScope.messages.indexOf(message);
        if (i>-1)
          closeMessage(i); 
     },10000); 
  };
}]);

_.rm= function(arr, elem)
{
  arr.splice(arr.indexOf(elem),1);
};

_.base64ToArrayBuffer= function(base64)
{
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)
    {
        var ascii = binary_string.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
}

_.uniqObjects = function( arr ){
  return _.uniq( _.collect( arr, function( x ){
    return JSON.stringify( x );
  }));
};
