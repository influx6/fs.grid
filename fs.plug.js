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

var isPathAbsolute = fsp.isAbsolutePath = function(file){
 if(_.valids.not.String(file)) return;
 var n = path.normalize(file),
 r = path.resolve(file),
 nr = n.replace(/(.+)([\/|\\])$/,'$1');
 return r === nr;
};

var profilePath = fsp.profilePath = function(base,file,fz){
  var rf = (isPathAbsolute(file) ? file : path.join(base,file)),
    full = fz || path.normalize(path.resolve(base)),
    prf = path.resolve(rf),
    and = prf.replace(full,'&'),
    valid = and.substring(0,1) === '&',
    stat;

    if(valid){
      try{
       stat = fs.statSync(prf);
      }catch(e){
       stat = null;
      }
    };

    return {
       state: valid,
       full: full,
       file: file,
       base: base,
       res: prf,
       stat: stat,
    };
};

var checkProfile = fsp.checkProfile = function(profile){
  return _.valids.exists(profile) ? profile.state : false;
};

fsp.registerMutator('absoluteValidator',function(d,next,end){
  if(_.valids.not.contains(d.body,'file')) return;
  d.body.file = d.body.file.replace(/\s+/,'');
  d.body.isAbsolute = isPathAbsolute(file);
  return next(d);
});

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
    if(!fs.existsSync(ps)){
      var r = plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found')));
      this.emitPacket(r);
      return;
    }

    fs.readdir(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
      if(_.valids.List(body)){
        _.enums.each(body,function(e,i,o,fx){
          m.emit({id: e, file: path.resolve(ps,e)}); return fx(null);
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
    if(fs.existsSync(ps)){
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
      return;
    }
    fs.mkdir(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));

      // var content = p.stream();

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
    if(fs.existsSync(ps)){
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
      return;
    }
    fs.mkdir(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
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
    if(!fs.existsSync(ps)){
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
      return;
    }
    fs.rmdir(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
      // m.emit(body);
      m.end();
    }));
  }));
});

fsp.registerPlug('io.profile',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)){
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
      return;
    }
    fs.exists(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{
        profile: profilePath(path.resolve('.',ps)),
        f:file,
        p: ps
      }));
      m.end();
    }));
  }));
});

fsp.registerPlug('io.check',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.exists(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)){
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
      return;
    }
    fs.exists(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
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
        if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
        var m = plug.ReplyPackets.from(p,null,{ f:file, p: ps});
        m.config({ f: file, p: ps });
        this.emitPacket(m);
        m.emit(body);
        m.end();
      }));
    }else{
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
      m.config({ f: file, p: ps });
    }
  }));
});

fsp.registerPlug('file.destroy',function(){
  fsp.Mutator('pathCleaner').bind(this.tasks());
  this.tasks().on(this.$bind(function(p){
    var b = p.body, file = b.file, ps;
    if(_.valids.not.String(file)) return;
    ps = path.resolve(file);
    if(!fs.existsSync(ps)) {
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
    }
    fs.unlink(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
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
    if(!fs.existsSync(ps)) {
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
    }
    fs.stat(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
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
    if(!fs.existsSync(ps)) {
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
    }
    fs.readlink(ps,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
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
    if(!fs.existsSync(ps)) {
      this.emitPacket(plug.ReplyPackets.from(p,null,new Error(_.Util.String(' ',file,':',ps,' not Found'))));
    }
    fs.link(ps,pd,this.$bind(function(err,body){
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, p: ps}));
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
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, res: d}));
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
      if(err){ return this.emitPacket(plug.ReplyPackets.from(p,null,err));}
      var m = this.emitPacket(plug.ReplyPackets.from(p,null,{ f:file, res: d}));
      }));
    }));

  }));
});

fsp.registerPlug('fs.base',function(){

  this.newTask('base.conf',this.makeName('conf'));

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
        profile = profilePath(base.base,file);
        // rf = isPathAbsolute(file) ? file : path.join(base.base,file),
        // prf = path.resolve(rf),
        // and = prf.replace(base.full,'&');

    if(profile.state){
       var f = this.emitPacket(plug.TaskPackets.clone(p,task,{ file: profile.res, profile: profile }));
    }
  }));

});

fsp.IO = plug.Network.blueprint(function(){
  this.use(fsp.Plug('stat'),'stat');
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
  this.use(fsp.Plug('io.check','io.check'),'fileCheck');
});

fsp.baseIO = plug.Network.blueprint(function(){
  this.use(fsp.Plug('fs.base'),'io.base');
  this.use(fsp.Plug('dir.read'),'dir.read');
  this.use(fsp.Plug('dir.overwrite'),'dir.overwrite');
  this.use(fsp.Plug('dir.write'),'dir.write');
  this.use(fsp.Plug('dir.destroy'),'dir.destroy');
  this.use(fsp.Plug('file.write.append'),'file.write.append');
  this.use(fsp.Plug('file.write.new'),'file.write.new');
  this.use(fsp.Plug('file.destroy'),'file.destroy');
  this.use(fsp.Plug('file.read'),'file.read');
  this.use(fsp.Plug('io.check'),'io.check');
  this.use(fsp.Plug('io.profile'),'io.profile');
});

fsp.registerPlug('io.iocontrol',function(){

  var net = fsp.baseIO('io.controller');
  this.newTask('io.conf',this.makeName('conf'));

  this.attachNetwork(net);
  this.networkOut(this.replies());

  var net = this.exposeNetwork();
  this.tasks('io.conf').on(this.$bind(function(p){
    var f = net.emitPacket(plug.TaskPackets.clone(p,'fs.base.conf'));
  }));

  this.tasks().on(this.$bind(function(p){
    var f = net.emitPacket(plug.TaskPackets.clone(p,'fs.base'));
  }));

});

fsp.controlIO = plug.Network.blueprint(function(){
  this.use(fsp.Plug('io.iocontrol'),'io.controller');
});

fsp.registerPlug('io.iodirect',function(){

  var base,net = fsp.controlIO('io.controller'), ior = _.Util.guid();

  this.attachNetwork(net);
  this.networkOut(this.replies());

  this.newTask('conf',this.makeName('conf'));
  this.newTask('appender',this.makeName('append'));
  this.newTask('eraser',this.makeName('remove'));
  this.newTask('reader',this.makeName('read'));
  this.newTask('writer',this.makeName('writ'));
  this.newTask('checker',this.makeName('check'));
  this.newTask('profiler',this.makeName('profile'));

  this.newSrcReply('ro',ior);

  this.store().pauseAllTasks();
  this.store().resumeTask('conf');

  this.tasks('conf').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'base')) return;
    base = p.body;
    net.Task.clone(p,'io.iocontrol.conf');
    this.store().resumeAllTasks();
  }));

  this.tasks('eraser').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'file')) return;
    var body = p.body, file = body.file, profile = fsp.profilePath(base.base,file);

    if(profile.stat){
      if(profile.stat.isFile()){
        p.link(net.Task.make('io.iocontrol',{ task: 'file.destroy', file: file , puid: p.uuid},ior));
      }
      if(profile.stat.isDirectory()){
        p.link(net.Task.make('io.iocontrol',{ task: 'dir.destroy', file: file , puid: p.uuid},ior));
      }
    }else{
      this.Reply.from(p,'io.iodirect.error');
    }

  }));

  this.tasks('profiler').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'file')) return;
    var body = p.body, file = body.file, profile = fsp.profilePath(base.base,file);

    if(profile.stat){
      if(profile.stat.isFile()){
        p.link(net.Task.make('io.iocontrol',{ task: 'io.profile', file: file , puid: p.uuid},ior));
      }
      if(profile.stat.isDirectory()){
        p.link(net.Task.make('io.iocontrol',{ task: 'io.profile', file: file , puid: p.uuid},ior));
      }
    }else{
      this.Reply.from(p,'io.iodirect.error');
    }
  }));

  this.tasks('checker').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'file')) return;
    var body = p.body, file = body.file, profile = fsp.profilePath(base.base,file);

    if(profile.stat){
      if(profile.stat.isFile()){
        p.link(net.Task.make('io.iocontrol',{ task: 'io.check', file: file , puid: p.uuid},ior));
      }
      if(profile.stat.isDirectory()){
        p.link(net.Task.make('io.iocontrol',{ task: 'io.check', file: file , puid: p.uuid},ior));
      }
    }else{
      this.Reply.from(p,'io.iodirect.error');
    }
  }));

  this.tasks('writer').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'file')) return;
    var body = p.body, file = body.file, profile = fsp.profilePath(base.base,file);

    if(profile.stat){
      if(profile.stat.isFile()){
        p.link(net.Task.make('io.iocontrol',{ task: 'file.write', file: file , puid: p.uuid},ior));
      }
      if(profile.stat.isDirectory()){
        p.link(net.Task.make('io.iocontrol',{ task: 'dir.write', file: file , puid: p.uuid},ior));
      }
    }else{
      this.Reply.from(p,'io.iodirect.error');
    }

  }));

  this.tasks('appender').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'file')) return;
    var body = p.body, file = body.file, profile = fsp.profilePath(base.base,file);

    if(profile.stat){
      if(profile.stat.isFile()){
        p.link(net.Task.make('io.iocontrol',{ task: 'file.append', file: file , puid: p.uuid},ior));
      }
      if(profile.stat.isDirectory()){
        p.link(net.Task.make('io.iocontrol',{ task: 'dir.write', file: file , puid: p.uuid},ior));
      }
    }else{
      this.Reply.from(p,'io.iodirect.error');
    }

  }));

  this.tasks('reader').on(this.$bind(function(p){
    if(_.valids.not.contains(p.body,'file')) return;
    var body = p.body, file = body.file, profile = fsp.profilePath(base.base,file);

    if(profile.stat){
      if(profile.stat.isFile()){
        p.link(net.Task.make('io.iocontrol',{ task: 'file.read', file: file , puid: p.uuid},ior));
      }
      if(profile.stat.isDirectory()){
        p.link(net.Task.make('io.iocontrol',{ task: 'dir.read', file: file , puid: p.uuid},ior));
      }
    }else{
      this.Reply.from(p,'io.iodirect.error');
    }

  }));

  this.replies('ro').on(this.$bind(function(p){
    var f = this.Reply.clone(p,p.Meta.puid);
  }));

});
