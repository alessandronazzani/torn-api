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

      //if (!$scope.items || !$scope.items.members)
         $http({
            url: '/api/torn/list',
            cache: true,
            method: "GET",
            params: { selections: 'basic' }
         }).success(function(items)
         {
            items.members= json2array(items.members);
            $scope.leader= _.findWhere(items.members, { _id: parseInt(items.leader) });
            $scope.coleader= _.findWhere(items.members, { _id: parseInt(items['co-leader']) });
            $scope.items= items;
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
                                        if (m.attacker_faction && m.attacker_faction == 0)
                                           delete m.attacker_faction;
                                        if (m.defender_faction && m.defender_faction == 0)
                                           delete m.defender_faction;
                                     });

               items.our_attacks= _.where(items.attacks, { attacker_faction: $scope.faction_id });
               items.defends= _.difference(items.attacks, items.our_attacks);

               _.each(items.our_attacks, function(a)
               {
                  var attacker= _.findWhere($scope.items.members, { _id: a.attacker_id });
                  if (attacker)
                     a.attacker_name= attacker.name;
                  else
                     a.attacker_name= a.attacker_id;
               });

               _.each(items.defends, function(d)
               {
                  var defender= _.findWhere($scope.items.members, { _id: d.defender_id });
                  if (defender)
                     d.defender_name= defender.name;
                  else
                     d.defender_name= d.attacker_id;
               });

               var people= _.groupBy(items.our_attacks, 'attacker_name');
               items.hof= _.map(people, function(g, key)
               {
                  return { attacker_name: key, 
                           respect_gain: parseFloat(_.reduce(g, function(m, x)
                                         {
                                            var i= parseFloat(m) + parseFloat(x.respect_gain);
                                            return i.toFixed(5);
                                         }, 0))
                         };
               });
               items.hof= _.sortBy(items.hof, 'respect_gain').reverse();
            }

            var members= $scope.items.members;
            $scope.items= items;
            $scope.items.members= members;
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
