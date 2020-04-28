
// defn :: essentials
// --------------------------------------------------------------------------------------------------------------------------------------------
   global.MAIN=global;

   MAIN.fsys = require('fs');
   MAIN.args = process.argv; args.shift(); args.shift();
   MAIN.dump = function(){console.log.apply(console,([].slice.call(arguments)));};
   MAIN.fail = function(m){note(`FAIL\n${m}`); dump(m);};
   MAIN.proc = require('child_process');
   const { spawn } = require('child_process');
   MAIN.execPath = __dirname;
   MAIN.argsPath = process.cwd();

   MAIN.tout = 60;  tout=(tout*1000);  // seconds to milliseconds

   MAIN.exec = function(arg1,arg2)
   {
      var o = {encoding:'utf8',timeout:tout};
      if(!isFunc(arg2)){let r; try{r=proc.execSync(arg1,o);}catch(e){return false}; return r;};
      var a = arg1.split(" ");  var c = a.shift();
      var r = spawn(c,a);
      r.stdout.on('data',function(d){arg2({type:"data",data:d.toString("utf-8")})});
      r.stderr.on('data',function(d){arg2({type:"fail",data:d.toString("utf-8")})});
      return r;
   };

   MAIN.note = function(mesg,dref,prgs)
   {
      if(dref===FALS){dref=VOID}; if(isVoid(dref)){return exec(`kdialog --passivepopup "${mesg}" 5`);};
      if(dref===TRUE){return exec(`kdialog --progressbar "${mesg}" 100`);}; if(!isNumr(prgs)){return;};
      if(prgs<100){this[dref]=1; exec(`qdbus-qt5 ${dref} Set "${mesg}" value ${prgs}`); return};
      if((prgs>99)&&this[dref]){this[dref]=VOID; exec(`qdbus-qt5 ${dref} close`); return;};
   }
   .bind({open:{}});

   MAIN.wait = function(secs,cbfn)
   {
      if(!cbfn){exec(`sleep ${secs}`); return};
      setTimeout(cbfn,(secs*1000));
   };

   process.on('uncaughtException',function(e)
   {
      let o = new Error();
      note(`FAIL\n${e}\n\n${o.stack}`); process.exit(1);
   });

   MAIN.done = function(m)
   {
      if(m){dump(m)}; process.exit();
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// defn :: (refs) : immutable
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.VOID = (function(){}()); // undefined
   MAIN.TRUE = (!0); // true
   MAIN.FALS = (!1); // false
   MAIN.SELF = ':SELF:'; // flag
   MAIN.VERT = ':VERT:'; // flag
   MAIN.HORZ = ':HORZ:'; // flag
// --------------------------------------------------------------------------------------------------------------------------------------------



// shiv :: (types) : shorthands to identify any datatype .. g & l is "greater-than" & "less-than" -which supports counting items inside v
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.isVoid = function(v){return ((v===VOID)||(v===null));};
   MAIN.isBool = function(v){return ((v===TRUE)||(v===FALS));};

   MAIN.isNumr = function(v,g,l){if(!((typeof v)==='number')){return FALS}; return (isVoid(g)||spanIs(v,g,l))};
   MAIN.isFrac = function(v,g,l){if(!(isNumr(v)&&((v+'').indexOf('.')>0))){return FALS}; return (isVoid(g)||spanIs(v,g,l))};
   MAIN.isInum = function(v,g,l){if(!isNumr(v)||isFrac(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))};

   MAIN.isText = function(v,g,l){if(!((typeof v)==='string')){return FALS}; return (isVoid(g)||spanIs(v,g,l))};
   MAIN.isWord = function(v,g,l){if(!test(trim(v,'_'),/^([a-zA-Z])([a-zA-Z0-9_]{1,35})+$/)){return}; return (isVoid(g)||spanIs(v,g,l))};
   MAIN.isPath = function(v,g,l){if(!test(v,/^([a-zA-Z0-9-\/\._@~]){1,432}$/)){return FALS}; return ((v[0]=='/')&&(isVoid(g)||spanIs(v,g,l)))};
   MAIN.isJson = function(v,g,l){return (isin(['[]','{}','""'],wrapOf(v))?TRUE:FALS);};

   MAIN.isList = function(v,g,l)
   {
      let t=Object.prototype.toString.call(v).toLowerCase();
      if((t.indexOf('arra')<0)&&(t.indexOf('argu')<0)&&(t.indexOf('list')<0)&&(t.indexOf('coll')<0)){return FALS};
      return (isVoid(g)||spanIs(v,g,l))
   };

   MAIN.isKnob = function(v,g,l){if(((typeof v)!='object')||isList(v)||isNode(v)){return FALS}; return (isVoid(g)||spanIs(v,g,l))};
   MAIN.isNode = function(v,g,l){if(!(v instanceof Element)){return FALS}; return (isVoid(g)||spanIs(v.childNodes.length,g,l))};
   MAIN.isMain = function(v){if(!v||isBool(v)){return FALS}; return (v.isMaster||v.isWorker);};

   MAIN.isFunc = function(v,g,l){if(!((typeof v)==='function')){return FALS}; return true;};
   MAIN.isTool = function(v, n)
   {if(!v||isBool(v)){return FALS}; n=(v.name||((!!v.constructor)?v.constructor.name:VOID)); return (v.INTRINSIC?true:(n&&(n=='RegExp')));};
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: span : length of anything
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.span = function(d,x)
   {
      if((d===null)||(d===VOID)||(!d&&isNaN(d))){return 0};  if(!isNaN(d)){d=(d+'')};
      if(x&&((typeof x)=='string')&&((typeof d)=='string')){d=(d.split(x).length-1); return d};
      let s = d.length; if(!isNaN(s)){return s;}; try{s=Object.getOwnPropertyNames(d).length; return s;}catch(e){return 0;}
   };

   MAIN.spanIs = function (d,g,l){let s=(((typeof d)=='number')?d:span(d)); g=(g||0); l=(l||s); return ((s>=g)&&(s<=l))};
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: isin : check if haystack contains needle, returns first needle found, or false if not found, or void if invalid
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.isin = function(h,n)
   {
      if((span(h)<1)||isBool(h)){return;}; if(isNumr(h)){h+=''}; if(!isText(h)&&!isList(h)&&!isKnob(h)){return};
      if(isKnob(h)){let r=false; if(!isList(n)){n=[n]}; n.each((i)=>{if(h.hasOwnProperty(i)){r=i; return STOP}}); return r};
      if(isText(n)){return ((h.indexOf(n)>-1)?n:FALS);}; if(isKnob(h)){h=keys(h);};
      if(isList(n)){let r=false; n.each((i)=>{if(h.indexOf(i)>-1){r=i; return STOP}}); return r};
      return (h.indexOf(n)>-1);
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: stub : split once on first occurance of delimeter
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.stub = function(t,a)
   {
      var c,i,b,e,s; c=isin(t,a); if(!c){return};
      s=c.length; i=t.indexOf(c);  b=((i>0)?t.slice(0,i):'');  e=(t[(i+s)]?t.slice((i+s)):'');  return [b,c,e];
   };

   MAIN.rstub = function(t,a)
   {
      var c,i,b,e,a,s;  c=isin(t,a); if(!c){return};
      s=c.length; i=t.lastIndexOf(c); b=((i>0)?t.slice(0,i):''); e=(t[(i+s)]?t.slice((i+s)):'');  return [b,c,e];
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: isee : check if path existsSync
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.isee = function(p)
   {
      return fsys.existsSync(p);
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: pget : return contents of file or folder
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.pget = function(p,t,e)
   {
      if(!isee(p)){fail(`undefined path: ${p}`); return}; if(t==VOID){t=1};
      let r=fsys.readFileSync(p); if(t){r=new Buffer(r).toString(e);};
      return r;
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: pset : write contents to file
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.pset = function(p,d)
   {
      fsys.writeFileSync(p,d);
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: mime : returns the mimeType of a file-extension
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.mime = function(x)
   {
      if(!!this.extn){return this.extn[x]}; this.extn={}; let text=fsys.readFileSync(`${execPath}/mimeType`,`UTF-8`);
      text.split(`\n`).forEach((line)=>{let prts=line.split(` : `); this.extn[(prts[0])]=prts[1];}); return this.extn[x];
   }.bind({});
// --------------------------------------------------------------------------------------------------------------------------------------------



// func :: durl : returns a data-URL from file
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.durl = function(filePath, pathPrts,foldPath,dataBufr,dataText,basePrts,baseName,mimeType,textResl)
   {
      pathPrts = filePath.split(`/`);  if(pathPrts.length<2){fail(`invalid path: ${filePath}`); return;};
      if(!fsys.existsSync(filePath)){fail(`invalid path: ${filePath}`); return;}; pathPrts.pop(); foldPath = pathPrts.join(`/`);
      dataBufr = fsys.readFileSync(filePath);  dataText = new Buffer(dataBufr).toString('base64');  dataBufr=VOID;
      basePrts = filePath.split(`.`);  baseName = basePrts[0];  mimeType = mime(basePrts[1]);
      textResl = `data:${mimeType};base64,${dataText}`;  return textResl;
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// tool :: time : returns seconds
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.time = function()
   {
      let r=(Date.now()/1000);
      return r;
   };

   MAIN.round = function(n,d, r)
   {
      if(!isNumr(n)){return}; if(isInum(n)){return n}; if(!d||!isInum(d)){return Math.round(n)}; r=n.toFixed(d); r=rtrim(rtrim(r,'0'),'.');
      r=(r*1); return r;
   };
// --------------------------------------------------------------------------------------------------------------------------------------------



// tool :: tick : waiting
// --------------------------------------------------------------------------------------------------------------------------------------------
   MAIN.tick = // object
   {
      after:function(ws,cf){let rt = setTimeout(cf,ws); return rt},
      every:function(ws,cf){let rt = setInterval(cf,ws); return rt},
      while:function(w,c,i){let rt = setInterval((r)=>{r=w(); if(r===true){return}; clearInterval(rt); c(r)},(i||1)); return rt;},
   };

   MAIN.wait = // object
   {
      until:function(w,c,l, t,s,r,n)
      {
         s=time(); t=setInterval(()=>
         {
            r=w(); if(!isVoid(r)&&(r!==FALS)){clearInterval(t);c(r);return};
            if(!l){return}; n=time(); if((n-s)>l){clearInterval(t)};
         },10);
         return t;
      },
   };
// --------------------------------------------------------------------------------------------------------------------------------------------


MAIN.ping = function(h)
{
   r=exec(`ping -c1 ${h}`); if(isBool(r)){return r};
   return !isin(r,"is unreachable");
};
