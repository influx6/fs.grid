var _ = require("stackq"),
    fs = require('graceful-fs'),
    // fs = require('fs'),
    path = require('path'),
    plug = require("plugd");

/*
  Fsplug contains the plug for fs ops and thereby caters for specific fs operations in the plug
  framework
*/

var fsp = module.exports = plug.Composable.make('fs');
var Sack = fsp.Sack = _.FunctionStore.make('FunctionSack',function(fx,id,chan){
  if(plug.SelectedChannel.isType(chan)) return chan.mutate(fx);
});

Sack.add('pathCleaner',function(d,next,end){
  if(_.valids.not.contains(d.body,'file')) return;
  d.body.file = d.body.file.replace(/\s+/,'');
  return next(d);
});

Sack.add('srcCleaner',function(d,next,end){
  if(_.valids.not.contains(d.body,'src')) return;
  d.body.file = d.body.src.replace(/\s+/,'');
  return next(d);
});

Sack.add('destCleaner',function(d,next,end){
  if(_.valids.not.contains(d.body,'dest')) return;
  d.body.file = d.body.dest.replace(/\s+/,'');
  return next(d);
});

fsp.registerPlug('dir.read',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.readDir(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,{ f:file, p: ps});
      if(_valids.List(body)){
        _.enums.each(body,function(e,i,o,fx){
          m.emit(e); return fx(null);
        },function(){
          m.endData();
        });
      }else{
        m.emit(body);
        m.endData();
      }
    }));
  }));
});

fsp.registerPlug('dir.write',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.mkdir(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,body);
      // m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('dir.overwrite',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.mkdir(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,body);
      // m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('dir.destroy',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.rmdir(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,body);
      // m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('file.check',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(b));
    fs.exists(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,{file: ps, state: body});
      m.endData();
    }));
  }));
});

fsp.registerPlug('file.read',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(file)) return this.Reply(ps,new Error(_.Util.String(' ',file,':[',ps,'] not Found')));
    fs.readFile(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,{ f:file, p: ps});
      m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('file.destroy',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.unlink(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,{ f:file, p: ps});
      m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('stat',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.stat(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('symlink.read',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.readlink(ps,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,{ f:file, p: ps});
      m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('symlink.write',function(){
  Sack.Q('srcCleaner',this.tasks());
  Sack.Q('destCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var b = p.body, src = b.src, dest = b.dest;
    if(_.valids.not.String(src) || _.valids.not.String(dest)) return;
    var ps = path.resolve(src), pd = path.resolve(dest);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.link(ps,pd,this.$bind(function(err,body){
      if(err) return this.Reply(file,err);
      var m = this.Reply(file,body);
      // m.emit(body);
      m.endData();
    }));
  }));
});

fsp.registerPlug('file.write.new',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var data = [],d = p.body, file = d.file, stream = p.stream,
    ops = _.funcs.extends({flag:'w'},d.options);
    if(_.valids.not.String(file)) return;
    var ps = path.resolve(file);
    stream.on(function(f){
      if(_.valids.isList(f)) data = data.concat(f);
      data.push(f);
    });

    stream.afterEvent('dataEnd',this.$bind(function(){
      fs.writeFile(ps,data.join(''),ops,this.$bind(function(err,d){
        if(err) return this.Reply(file,err);
        return this.Reply(file,{f:file, res: d});
      }));
    }));

  }));
});

fsp.registerPlug('file.write.append',function(){
  Sack.Q('pathCleaner',this.tasks());
  this.channels.tasks.on(this.$bind(function(p){
    var data = [],d = p.body, file = d.file, stream = p.stream,
    ops = _.funcs.extends({flag:'a'},d.options);
    if(_.valids.not.String(file)) return;
    var ps = path.resolve(file);
    stream.on(function(f){
      if(_.valids.isList(f)) data = data.concat(f);
      data.push(f);
    });

    stream.afterEvent('dataEnd',this.$bind(function(){
      fs.appendFile(ps,data.join(''),ops,this.$bind(function(err,d){
        if(err) return this.Reply(file,err);
        return this.Reply(file,{f:file, res: d});
      }));
    }));

  }));
});

fsp.registerCompose('io',function(){
  this.use('fs.stat','fs.stat','stat');
  this.use('fs.symlink.write','symlink.write','symlinkWrite');
  this.use('fs.symlink.read','symlink.read','symlinkRead');
  this.use('fs.dir.read','dir.read','dirRead');
  this.use('fs.dir.overwrite','dir.overwrite','dirOverwrite');
  this.use('fs.dir.write','dir.write','dirWrite');
  this.use('fs.dir.destroy','dir.destroy','dirDestroy');
  this.use('fs.file.write.append','file.write.append','fileWriteAppend');
  this.use('fs.file.write.new','file.write.new','fileWriteNew');
  this.use('fs.file.destroy','file.destroy','fileDestroy');
  this.use('fs.file.read','file.read','fileRead');
  this.use('fs.file.check','file.check','fileCheck');
});
