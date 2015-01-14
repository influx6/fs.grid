var _ = require('stackq');
var plug = require('plugd');
var fs = require('../fs.plug.js');

_.Jazz('fs.plug specification tests',function(n){

  var grid = plug.Network.make('control.io');
  grid.use(fs.Plug('fs.iocontrol','io.base'),'io.fs');

  var ioc = grid.get('io.fs'), io = ioc.exposeNetwork();

  n('can i configure a base.fs to a directory',function(k){
    k.async(function(d,next,g){
      d.tasks('io.conf').on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isTask(t));
        _.Expects.is(t.body.base,'../specs/');
      }));
    });
    k.for(ioc);
    grid.Task.make('io.control.conf',{ base: '../specs/' });
  });

  n('can i get the task request from base.fs for a read op',function(k){

    k.async(function(d,next,g){
      d.tasks().on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isTask(t));
        _.Expects.truthy(t.body.file,'./poem.md');
      }));
    });

    k.async(function(d,next,g){
      d.replies().on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isReply(t));
        t.stream().on(g(function(k){
          _.Expects.isInstanceOf(k,Buffer);
        }));
      }));
    });

    k.for(io.get('file.read'));

  });

  n('can i read a file from base.fs',function(k){

    k.async(function(d,next,g){
      next();
      d.tasks().on(g(function(t){
        _.Expects.truthy(plug.Packets.isTask(t));
      }));
    });

    k.for(ioc);

    grid.Task.make('io.base',{ task: 'file.read', file: './poem.md' });
    grid.Task.make('io.base',{ task: 'file.read', file: './coller/../poem.md' });

  });


});
