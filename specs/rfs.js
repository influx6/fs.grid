var _ = require('stackq');
var plug = require('plugd');
var fs = require('../fs.plug.js');

_.Jazz('fs.plug specification tests',function(n){

  var grid = plug.Network.make('control.io');
  grid.use(fs.Plug('io.iodirect'),'io.direct');
  var ioc = grid.get('io.direct');

  n('can i configure a io.iodirect to a directory',function(k){
    k.async(function(d,next,g){
      d.tasks('conf').on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isTask(t));
        _.Expects.is(t.body.base,'../specs/');
      }));
    });
    k.for(ioc);
    grid.Task.make('io.iodirect.conf',{ base: '../specs/' });
  });

  n('can i read a file from base.fs',function(k){

    k.async(function(d,next,g){
      d.tasks().on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isTask(t));
      }));
    });

    k.for(ioc);

    grid.Task.make('io.iodirect.read',{ file: './poem.md' });

  });


});
