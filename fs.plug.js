var _ = require("stackq"),
    fs = require('graceful-fs'),
    // fs = require('fs'),
    path = require('path'),
    plug = require("plugd");

/*
  Fsplug contains the plug for fs ops and thereby caters for specific fs operations in the plug
  framework
*/

var fsp = module.exports = plug.Rack.make('fs');

fsp.registerMutator('pathCleaner',function(d,next,end){
  if(_.valids.not.contains(d.body,'file')) return;
  d.body.file = d.body.file.replace(/\s+/,'');
  return next(d);
});

fsp.registerMutator('srcCleaner',function(d,next,end){
  if(_.valids.not.contains(d.body,'src')) return;
  d.body.file = d.body.src.replace(/\s+/,'');
  return next(d);
});

fsp.registerMutator('destCleaner',function(d,next,end){
  if(_.valids.not.contains(d.body,'dest')) return;
  d.body.file = d.body.dest.replace(/\s+/,'');
  return next(d);
});

fsp.registerPlug('dir.read',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.readDir(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,{ f:file, p: ps});
      if(_valids.List(body)){
        _.enums.each(body,function(e,i,o,fx){
          m.emit(e); return fx(null);
        },function(){
          m.end();
        });
      }else{
        m.emit(body);
        m.end();
      }
    }));
  }));
});

fsp.registerPlug('dir.write',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.mkdir(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,body);
      // m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('dir.overwrite',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.mkdir(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,body);
      // m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('dir.destroy',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.rmdir(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,body);
      // m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('file.check',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(b));
    fs.exists(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,{file: ps, state: body});
      m.end();
    }));
  }));
});

fsp.registerPlug('file.read',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    var can = fs.existsSync(file);
    if(can){
      fs.readFile(ps,this.$bind(function(err,body){
        if(err){ return this.ReplyFrom(p,err); }
        var m = this.ReplyFrom(p,{ f:file, p: ps});
        m.emit(body);
        m.end();
      }));
    }else{
      return this.ReplyFrom(p,new Error(_.Util.String(' ',file,':',ps,' not Found')));
    }
  }));
});

fsp.registerPlug('file.destroy',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.unlink(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,{ f:file, p: ps});
      m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('stat',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.stat(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,body);
      m.end();
    }));
  }));
});

fsp.registerPlug('symlink.read',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) return this.ReplyFrom(p,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.readlink(ps,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,{ f:file, p: ps});
      m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('symlink.write',function(){
  fsp.Mutator('srcCleaner').bind(this.tasks());
  fsp.Mutator('destCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, src = b.src, dest = b.dest;
    if(_.valids.not.String(src) || _.valids.not.String(dest)) return;
    var ps = path.resolve(src), pd = path.resolve(dest);
    if(!fs.existsSync(ps)) return this.Reply(ps,new Error(_.Util.String(' ',file,':(',ps,')not Found')));
    fs.link(ps,pd,this.$bind(function(err,body){
      if(err) return this.ReplyFrom(p,err);
      var m = this.ReplyFrom(p,body);
      m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('file.write.new',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());

  this.tasks().on(this.$bind(function(p){
    var data = [],d = p.body, file = d.file, stream = p.stream(),
    ops = _.funcs.extends({flag:'w'},d.options);
    if(_.valids.not.String(file)) return;
    var ps = path.resolve(file);
    stream.on(function(f){
      if(_.valids.isList(f)) data = data.concat(f);
      data.push(f);
    });

    stream.afterEvent('dataEnd',this.$bind(function(){
      fs.writeFile(ps,data.join(''),ops,this.$bind(function(err,d){
        if(err) return this.ReplyFrom(p,err);
        return this.ReplyFrom(p,{f:file, res: d});
      }));
    }));

  }));
});

fsp.registerPlug('file.write.append',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var data = [],d = p.body, file = d.file, stream = p.stream(),
    ops = _.funcs.extends({flag:'a'},d.options);
    if(_.valids.not.String(file)) return;
    var ps = path.resolve(file);
    stream.on(function(f){
      if(_.valids.isList(f)) data = data.concat(f);
      data.push(f);
    });

    stream.afterEvent('dataEnd',this.$bind(function(){
      fs.appendFile(ps,data.join(''),ops,this.$bind(function(err,d){
        if(err) return this.ReplyFrom(p,err);
        return this.ReplyFrom(p,{f:file, res: d});
      }));
    }));

  }));
});

fsp.registerPlug('fs.Basefs',function(){

  this.newTaskChannel('base.conf','fs.basefs.conf');

  this.tasks().pause();

  var base;

  this.tasks('base.conf').on(this.$bind(function(p){
    if(_.valids.not.containsKey(p.body,'base')) return;
    var body = p.body;
    delete body.chUID;
    base = _.Util.clone(body);
    base.base = path.normalize(body.base);
    base.full = path.resolve(path.normalize(body.base));
    this.config(base);
    this.tasks('base.conf').lock();
    this.tasks('base.conf').flush();
    this.tasks().resume();
  }));


  this.tasks().on(this.$bind(function(p){
    if(_.valids.not.containsKey(p.body,'task')) return;
    if(_.valids.not.containsKey(p.body,'file')) return;
    var body = p.body,
        task = body.task,
        file = body.file,
        rf = path.join(base.base,file),
        prf = path.resolve(rf),
        and = prf.replace(base.full,'&');

    if(and.substring(0,1) === '&'){
      var f = this.Task(task,{file: file});
      p.link(f);
    }
  }));

});

fsp.IO = plug.Network.make('io',function(){
  this.use(fsp.Plug('stat','fs.stat'),'stat');
  this.use(fsp.Plug('symlink.write','symlink.write'),'symlinkWrite');
  this.use(fsp.Plug('symlink.read','symlink.read'),'symlinkRead');
  this.use(fsp.Plug('dir.read','dir.read'),'dirRead');
  this.use(fsp.Plug('dir.overwrite','dir.overwrite'),'dirOverwrite');
  this.use(fsp.Plug('dir.write','dir.write'),'dirWrite');
  this.use(fsp.Plug('dir.destroy','dir.destroy'),'dirDestroy');
  this.use(fsp.Plug('file.write.append','file.write.append'),'fileWriteAppend');
  this.use(fsp.Plug('file.write.new','file.write.new'),'fileWriteNew');
  this.use(fsp.Plug('file.destroy','file.destroy'),'fileDestroy');
  this.use(fsp.Plug('file.read','file.read'),'fileRead');
  this.use(fsp.Plug('file.check','file.check'),'fileCheck');
});

var netIO = plug.Network.make('fs.io',function(){
  this.use(fsp.Plug('fs.Basefs','io.base'),'io.base');
  this.use(fsp.Plug('dir.read','dir.read'),'dir.read');
  this.use(fsp.Plug('dir.overwrite','dir.overwrite'),'dir.overwrite');
  this.use(fsp.Plug('dir.write','dir.write'),'dir.write');
  this.use(fsp.Plug('dir.destroy','dir.destroy'),'dir.destroy');
  this.use(fsp.Plug('file.write.append','file.write.append'),'file.write.append');
  this.use(fsp.Plug('file.write.new','file.write.new'),'file.write.new');
  this.use(fsp.Plug('file.destroy','file.destroy'),'file.destroy');
  this.use(fsp.Plug('file.read','file.read'),'file.read');
  this.use(fsp.Plug('file.check','file.check'),'file.check');
});

fsp.registerPlug('fs.ioControl',function(){

  this.newTaskChannel('io.conf','io.control.conf');

  this.attachNetwork(netIO);
  this.networkOut(this.replies());

  var net = this.exposeNetwork();
  this.tasks('io.conf').on(this.$bind(function(p){
    var f = net.Task('fs.basefs.conf',p.body);
    p.link(f);
  }));
  this.tasks().on(this.$bind(function(p){
    var f = net.Task('io.base',p.body);
    p.link(f);
  }));

});
