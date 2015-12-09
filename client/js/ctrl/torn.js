var tornapi= ['$rootScope','$scope','$filter','$http','$cacheFactory','$location','$routeParams','growl',
function ($rootScope, $scope, $filter, $http, $cacheFactory, $location, $routeParams, growl)
{
   var orderBy= $filter('orderBy');

   $scope.currentPage = 1;
   $scope.itemsPerPage = 20;

   var json2array= function(json)
   {
      var result = [];
      var keys = Object.keys(json);
      keys.forEach(function(key)
      {
         var obj= json[key];
         obj._id= parseInt(key);
         result.push(obj);
      });
      return result;
   };

   var load= function()
   {
      if (!$scope.faction_id)
         $http({
            url: '/api/torn/faction',
            cache: true,
            method: "GET"
         }).success(function(data)
         {
            $scope.faction_id= data._id;
         });

      if (!$scope.faction_members)
         $http({
            url: '/api/torn/list',
            cache: true,
            method: "GET",
            params: { selections: 'basic' }
         }).success(function(items)
         {
            items.members= json2array(items.members);
            _.each(items.members, function(m) { m.days_in_faction= parseInt(m.days_in_faction); });
            $scope.leader= _.findWhere(items.members, { _id: parseInt(items.leader) });
            $scope.coleader= _.findWhere(items.members, { _id: parseInt(items['co-leader']) });
            $scope.faction_members= items.members;
         });

      if ($location.path().substring(1) !== 'basic')
         $http({
            url: '/api/torn/list',
            cache: true,
            method: "GET",
            params: { selections: $location.path().substring(1) }
         }).success(function(items)
         {
            if (items.donationnews) items.donationnews= json2array(items.donationnews);

            if (items.attacks)
            {
               items.attacks= json2array(items.attacks);
               _.each(items.attacks, function(m)
                                     {
                                        if (m.respect_gain)
                                           m.respect_gain= parseFloat(m.respect_gain);
                                        if (m.attacker_faction)
                                           m.attacker_faction= parseInt(m.attacker_faction);
                                        if (m.attacker_id)
                                           m.attacker_id= parseInt(m.attacker_id);
                                        if (m.defender_id)
                                           m.defender_id= parseInt(m.defender_id);
                                     });

               items.our_attacks= _.where(items.attacks, { attacker_faction: $scope.faction_id });
               items.defends= _.difference(items.attacks, items.our_attacks);

               _.each(items.our_attacks, function(a)
               {
                  a.attacker_name= _.findWhere($scope.faction_members, { _id: a.attacker_id }).name;
               });
               _.each(items.defends, function(d)
               {
                  d.defender_name= _.findWhere($scope.faction_members, { _id: d.defender_id }).name;
               });
            }

            $scope.items= items;
         });
   };

   $scope.order= function(collection, predicate)
   {
      $scope['sort_'+predicate]= !$scope['sort_'+predicate];

      $scope.items[collection]= orderBy($scope.items[collection], predicate, $scope['sort_'+predicate]);
   };

   $scope.reload= function()
   {
      $cacheFactory.get('$http').remove('/api/torn/list?selections=' + $location.path().substring(1) );
      load();
   };

   load();
}];
