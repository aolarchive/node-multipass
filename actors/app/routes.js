var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../../auth')
  , appAPI = require('../../data/app')
  , HttpHelper = require('../../routes/httphelper')
  , ApiResponse = require('../../data/apiresponse');


module.exports = function(app){
	
	var viewsPath = app.get('plugins')['app'] && app.get('plugins')['app']._viewsPath;
	
  /*
  app.get(config.paths.api + '/app',
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res),
        appId = (req.body && req.body.appId) || '';
      
      appAPI.getApp(appId, function(data) {
        http.send(data);
      });
    }
  );
  */
  app.post(config.paths.api + '/app',
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      appAPI.addApp(req.body, function(data) {
        http.send(data);
      });
    }
  );
  
  app.put(config.paths.api + '/app',
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      appAPI.updateApp(req.body, function(data) {
        http.send(data);
      });
    }
  );
  
  app.delete(config.paths.api + '/app',
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res),
        appId = (req.body && req.body.appId) || '';
      
      appAPI.deleteApp(appId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.post(config.paths.api + '/app/secret',
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res),
        appId = (req.body && req.body.appId) || '';
      
      appAPI.refreshAppSecret(appId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.configure('development', function(){
    
    app.get('/app', function(req, res){

      var userId = 'multipass-user';
        
      if (!req.param('action')) {

        appAPI.getAppsByUserId(userId, function(data) {
          res.render(viewsPath + 'app', { userId: userId, apps: data.data });
        });
        
      } else if (req.param('action') == 'create') {
        
        res.render(viewsPath + 'appform', { app: { userId: userId } });
        
      } else if (req.param('action') == 'edit' && req.param('appId')) {
        
        appAPI.getApp(req.param('appId'), function(data) {
          if (!data.isError()) {
            res.render(viewsPath + 'appform', { app: data.data });
          }
        });
        
      } else {
        next();
      }
      
    });
    
  });
  
};