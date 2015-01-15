var _ = require('stackq');
var plug = require('plugd');
var fs = require('../fs.plug.js');

_.Jazz('fs.plug specification tests',function(n){

  var io = fs.IO('io');

  io.use(fs.Plug('fs.base'),'base.fs');


  n('can i read a file',function(k){
    k.async(function(d,next,g){
      d.replies().on(g(function(f){
        next();
        _.Expects.truthy(f);
        _.Expects.truthy(f.body);
        _.Expects.isString(f.message);
      }));
    });
    k.for(io.get('fileRead'));
    io.Task.make('file.read',{ file: '../fs.plug.js '});
  });

  n('can i write a file',function(k){
    k.async(function(d,next,g){
      d.replies().on(g(function(f){
        _.Expects.truthy(f);
        _.Expects.isString(f.message);
        _.Expects.isObject(f.body);
      }));
      next();
    });
    k.for(io.get('fileWriteNew'));

    io.Task.make('file.write.new',{ file: './poem.md'})
    .emit('#oh God!,i Seek you!')
    .emit('\n')
    .emit('\n')
    .emit('sing aloud to my God, oh earth')
    .emit('\n')
    .emit('recite a beautiful psalm to his hearing')
    .emit('\n')
    .emit('fill him with the most beautiful praise')
    .emit('\n')
    .emit('for my God and Lord deserves more beyond wonder')
    .emit('\n')
    .emit('praise my God, oh Zion, praise the Lord, Our God and King!')
    .emit('\n')
    .emit('\n')
    .end();

  });

  n('can i append to a file',function(k){
    k.async(function(d,next,g){
      d.replies().on(g(function(f){
        next();
        _.Expects.truthy(f);
        _.Expects.isString(f.message);
        _.Expects.isObject(f.body);
      }));
    });

    k.for(io.get('fileWriteAppend'));
    io.Task.make('file.write.append',{ file: './poem.md'})
    .emit('#Forever oh God!,i wait for you!')
    .emit('\n')
    .emit('\n')
    .emit('with joy unseizing upon this earth')
    .emit('\n')
    .emit('to see you, know you and walk with you')
    .emit('\n')
    .emit('for by you i have found where i belong')
    .emit('\n')
    .emit('in your presence oh God, Lord and father')
    .emit('\n')
    .emit('\n')
    .end();

  });

  n('can i configure a base.fs to a directory',function(k){
    k.async(function(d,next,g){
      d.tasks('base.conf').on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isTask(t));
        _.Expects.is(t.body.base,'../specs/');
      }));
    });
    k.for(io.get('base.fs'));
    io.Task.make('fs.basefs.conf',{ base: '../specs/' });
  });

  n('can i get the task request from base.fs for a read op',function(k){

    k.sync(function(d,g){
      d.tasks().on(g(function(t){
        _.Expects.truthy(plug.Packets.isTask(t));
        _.Expects.truthy(t.body.file,'./poem.md');
      }));
    });

    k.sync(function(d,g){
      d.replies().on(g(function(t){
        _.Expects.truthy(plug.Packets.isReply(t));
        t.stream().on(g(function(k){
          _.Expects.isInstanceOf(k,Buffer);
        }));
      }));
    });

    k.for(io.get('fileRead'));

  });

  n('can i read a file from base.fs',function(k){

    k.async(function(d,next,g){
      d.tasks().on(g(function(t){
        next();
        _.Expects.truthy(plug.Packets.isTask(t));
      }));
    });

    k.for(io.get('base.fs'));
    io.Task.make('fs.base',{ task: 'file.read', file: './poem.md' });
    io.Task.make('fs.base',{ task: 'file.read', file: '../coller/../poem.md' });

  });


});
