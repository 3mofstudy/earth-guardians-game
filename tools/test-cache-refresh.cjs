const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('cache-refresh.js', 'utf8');
const current = '1111111111111111', latest = '2222222222222222';
async function setup({remote = latest, playing = false, video = false, offline = false, remembered = false, storageBlocked = false, query = ''} = {}) {
  const replacements = [], requests = [], intervals = [], listeners = {}, store = new Map();
  const location = {protocol:'https:',pathname:'/earth-guardians-game/index.html',href:'https://example.github.io/earth-guardians-game/index.html'+query+'#rules',replace:url=>replacements.push(url)};
  if (remembered) store.set('earth-guardians:refresh:'+location.pathname, latest);
  const landing = {hidden:playing}, movie={paused:!video,ended:false,addEventListener(){}};
  let mutation;
  const document = {hidden:false,readyState:'complete',baseURI:location.href,currentScript:{src:'https://example.github.io/earth-guardians-game/cache-refresh.js?v='+current},
    querySelector:()=>({content:current}),getElementById:()=>landing,querySelectorAll:()=>video?[movie]:[],addEventListener:(type,fn)=>listeners[type]=fn};
  const sandbox = {URL,AbortController,Date,Array,document,location,window:{},
    fetch:async(url,options)=>{requests.push({url:String(url),options});if(offline)throw Error('offline');return {ok:true,json:async()=>({version:remote})};},
    sessionStorage:{getItem:key=>{if(storageBlocked)throw Error('blocked');return store.get(key);},setItem:(key,value)=>store.set(key,value)},
    MutationObserver:class{constructor(fn){mutation=fn;}observe(){}},
    setTimeout:()=>1,clearTimeout(){},setInterval:fn=>intervals.push(fn)};
  vm.runInNewContext(source,sandbox);
  await new Promise(resolve=>setImmediate(resolve));
  return {replacements,requests,intervals,listeners,landing,movie,sandbox,mutation};
}
(async()=>{
  let t=await setup({remote:current});assert.equal(t.replacements.length,0);assert.equal(t.requests[0].options.cache,'no-store');
  assert.match(t.requests[0].url,/\/earth-guardians-game\/site-version.json\?_check=/);
  assert.equal(new URL(t.sandbox.window.SiteVersion.url('assets/player-bear.png')).searchParams.get('v'),current);
  assert.equal(t.sandbox.window.SiteVersion.url('https://other.test/image.png'),'https://other.test/image.png');
  t=await setup();assert.equal(t.replacements.length,1);const next=new URL(t.replacements[0]);assert.equal(next.searchParams.get('v'),latest);assert.equal(next.hash,'#rules');
  t=await setup({playing:true});assert.equal(t.replacements.length,0);t.landing.hidden=false;t.mutation();assert.equal(t.replacements.length,1);
  t=await setup({video:true});assert.equal(t.replacements.length,0);t.movie.paused=true;t.intervals[0]();assert.equal(t.replacements.length,1);
  t=await setup({remote:current});t.intervals[0]();await new Promise(resolve=>setImmediate(resolve));assert.equal(t.requests.length,2,'periodic check');
  t=await setup({offline:true});assert.equal(t.replacements.length,0);
  t=await setup({remote:'invalid/version'});assert.equal(t.replacements.length,0);
  t=await setup({remembered:true});assert.equal(t.replacements.length,0,'no refresh loop on stale CDN response');
  t=await setup({storageBlocked:true,query:'?v='+latest});assert.equal(t.replacements.length,0,'loop protection without session storage');
  assert(!/document\.cookie\s*=|localStorage\.clear|caches\.delete/.test(source),'never remove unrelated user data');
  console.log('PASS: no-store checks, GitHub subdirectory, versions, periodic checks, deferred game/video refresh, offline fallback, and loop protection.');
})().catch(error=>{console.error(error);process.exitCode=1;});
