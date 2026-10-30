// Serve the repo on localhost. Needs Playwright's Chromium and ffmpeg on PATH.
// PORT=48731 RENDER_DIR=/path/to/work node film/render.mjs
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const port=process.env.PORT||48731, out=process.env.RENDER_DIR||'render';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const fps=30,total=1800,workers=2;
try{
  await Promise.all(Array.from({length:workers},async(_,w)=>{
    const ctx=await browser.newContext({viewport:{width:1920,height:1080}});
    await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    const p=await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/film/`);
    await p.evaluate(()=>window.ready);
    if(w===0){
      await p.evaluate(()=>window.renderAt(57));
      await p.screenshot({path:path.join(root,'assets/poster.jpg'),type:'jpeg',quality:90});
      for(const t of [4,11,19,26,34,41,49,57]){
        await p.evaluate(t=>window.renderAt(t),t);
        await p.screenshot({path:path.join(out,`scene-${t}.jpg`),type:'jpeg',quality:85});
      }
    }
    const dest=path.join(out,`segment-${w}.mp4`);
    const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','20','-pix_fmt','yuv420p',dest],{stdio:['pipe','inherit','inherit']});
    const done=new Promise((resolve,reject)=>{ff.on('close',code=>code===0?resolve():reject(new Error(`ffmpeg ${code}`)));ff.on('error',reject)});
    for(let f=w*900;f<(w+1)*900;f++){
      const data=await p.evaluate(t=>{window.renderAt(t);return document.querySelector('canvas').toDataURL('image/jpeg',.9).split(',')[1]},f/fps);
      if(!ff.stdin.write(Buffer.from(data,'base64')))await new Promise(r=>ff.stdin.once('drain',r));
      if(f%300===0)console.log(`Renderer ${w}: frame ${f} / ${total}`);
    }
    ff.stdin.end();await done;await ctx.close();
  }));
}finally{await browser.close()}
fs.writeFileSync(path.join(out,'concat.txt'),[0,1].map(i=>`file '${path.resolve(out,`segment-${i}.mp4`)}'`).join('\n'));
console.log('Film pictures rendered. Mix with film/music.py soundtrack using ffmpeg.');
