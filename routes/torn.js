var async= require('async'),
    _= require('underscore'),
    request= require('request'),
    faction= 7709,
    api_server= 'http://api.torn.com',
    fac_path= '/faction/';

exports.list= function(req, res)
{
   var key= 'Y5cYM';

   request(api_server + fac_path + faction + '?selections=' + req.query.selections + '&key=' + key,
           function (error, response, body)
           {
              if (!error && response.statusCode == 200)
                 res.send(body);
              else
                 res.send(error, response.statusCode);
           });
};

exports.faction= function(req, res)
{
   res.send({ _id: faction });
};
