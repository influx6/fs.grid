var _ = require('stackq');
var plug = require('plugd');
var fs = require('../fs.plug.js');

_.Jazz('fs.plug specification tests',function(n){

  var grid = plug.Network.make('fs.plug.spec');
  grid.crate(fs);

  grid.use('fs/compose/io','grid.io');
  var io = grid.get('grid.io');

  n('can i read a file',function(k){
    k.async(function(d,next,g){
      d.replies().on(g(function(f){
        _.Expects.truthy(f);
        _.Expects.isString(f.message);
        _.Expects.isObject(f.body);
      }));
      next();
    });
    k.for(io.get('fileRead'));
    io.Task('file.read',{ file: '../fs.plug.js '});
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
    io.Task('file.write.new',{ file: './poem.md'})
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
    .endData();

  });

  n('can i append to a file',function(k){
    k.async(function(d,next,g){
      d.replies().on(g(function(f){
        _.Expects.truthy(f);
        _.Expects.isString(f.message);
        _.Expects.isObject(f.body);
      }));
      next();
    });
    k.for(io.get('fileWriteAppend'));
    io.Task('file.write.append',{ file: './poem.md'})
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
    .endData();

  });

});
