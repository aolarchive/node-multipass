var util = require('util')
  , path = require('path')
  , fs = require('fs')
  , express = require('express');


var plugin = {

  /**
   * Dynamically load plugins, based on given plugin configs hash
   */
	load: function(app, pluginConfigs) {
  
	  var plugins = {},
	   pluginConfig,
	   pluginOptions,
	   pluginViews,
	   pluginStatic,
	   pluginStaticRoute = null,
	   pluginDir,
	   plugin;
	  
	  if (pluginConfigs) {
	    try {
	      Object.keys(pluginConfigs).forEach(function (key) {
	        pluginConfig = pluginConfigs[key];
	        
	        pluginOptions = pluginConfig.options || {};
	        
	        if (pluginConfig.init) {
	          plugin = require(pluginConfig.init);
	          if (plugin) {
	            plugins[key] = plugin;
	            
	            pluginDir = path.join(__dirname, path.dirname(pluginConfig.init)) + '/';
	            
	            /*
	             * Configure the views path for the plugin
	             */
	            plugin._viewsPath = pluginDir;
	            
	            if (plugin.views) {
	            	pluginViews = path.join(__dirname, path.dirname(pluginConfig.init), plugin.views, '/');
	
	            	if (fs.existsSync(pluginViews)) {
	            		plugin._viewsPath = pluginViews;
	            	}
	            }
	            
	            /*
	             * Configure the static path and route for the plugin
	             */
	            plugin._staticPath = pluginDir;
	            
	            if (plugin.staticRoute && plugin.staticRoute != '') {
	            	pluginStaticRoute = plugin.staticRoute;
	            }

	            if (plugin.static) {
	            	pluginStatic = path.join(__dirname, path.dirname(pluginConfig.init), plugin.static, '/');
	            	
	            	if (fs.existsSync(pluginStatic)) {
	            		plugin._staticPath = pluginStatic;
	            		
	            		app.configure('development', function(){
		            		if (pluginStaticRoute) {
		            			app.use(pluginStaticRoute, express.static(pluginStatic));
		            		} else {
		            			app.use(express.static(pluginStatic));
		            		}
		            	});
	            		
	            		app.configure('production', 'stage', function(){
									  var oneMonth = 2592000000;
									  if (pluginStaticRoute) {
									  	app.use(pluginStaticRoute, express.static(pluginStatic, { maxAge: oneMonth }));
									  } else {
									  	app.use(express.static(pluginStatic, { maxAge: oneMonth }));
									  }
									});
	            	}
	            }
	            
	            /* 
	             * Initialize plugin
	             */
	            if (plugin.init) {
	              plugin.init(app, pluginOptions);
	            }
	          }
	        }
	      });
	      
	    } catch (error) {
	      console.error('Error: ' + error.message);
	    }
	  }
	
	  app.set('plugins', plugins);
  }
  
};

module.exports = plugin;