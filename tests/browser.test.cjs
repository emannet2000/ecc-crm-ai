const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const puppeteer = require('puppeteer');
let browser;
before(async () => {
  const local = path.join(os.homedir(), '.cache/ms-playwright/chromium-1234/chrome-linux64/chrome');
  const executablePath = process.env.CHROME_PATH || (fs.existsSync(local) ? local : puppeteer.executablePath());
  browser = await puppeteer.launch({executablePath, headless:true, pipe:true, args:['--no-sandbox','--disable-dev-shm-usage']});
});
after(async () => { await browser?.close(); });

async function fixture(view = 'contacts') {
  const page = await browser.newPage(), calls=[], errors=[];
  const contact = {id:'c_client',name:'Client One',email:'client@example.com',phone:'+12025550123',orgId:'org_a',ownerId:'u_manager',visibility:'organization',_revision:'old-version'};
  const student = {id:'s_client',name:'Student One',schoolId:'school',applicationStage:'Applying',intake:'January 2027',_revision:'student-version'};
  const flow={contacts:[contact,{...contact,id:'c_other',name:'Other Client'}],students:[student],deals:[],cases:[{id:'case_client',clientId:contact.id,studentId:student.id,caseNumber:'ECC-001',currentStage:'Documents Pending'}],documents:[{id:'doc_client',caseId:'case_client',caseNumber:'ECC-001',docName:'Passport',latestVersion:1,status:'Received'}],invoices:[],leads:[],agents:[],partners:[],schools:[],tasks:[],templates:[],ledger:[]};
  const center={role:'manager',user:{id:'u_manager'},organization:[{name:'Demo workspace',timezone:'UTC'}],records:{contacts:flow.contacts.map(c=>({id:c.id,label:c.name})),students:[{id:student.id,label:student.name}]},features:{smtp:false,ai:false},entries:[],mail:[],notifications:[]};
  page.on('pageerror',e=>errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', async req=> {
    try {
      const url=new URL(req.url()); calls.push({path:url.pathname,method:req.method(),headers:req.headers(),body:req.postData()});
      let data,contentType='application/json';
      if(url.pathname.startsWith('/public/')) {data=fs.readFileSync(path.join(__dirname,'..',url.pathname));contentType=url.pathname.endsWith('.css')?'text/css':'application/javascript';}
      else if(url.pathname==='/portal') {data=fs.readFileSync(path.join(__dirname,'../public/portal.html'));contentType='text/html';}
      else if(url.pathname==='/') {contentType='text/html';data=`<!doctype html><html><body><div id="app">${view==='workspace'?'<crm-workspace></crm-workspace>':view==='insights'?'<crm-insights></crm-insights>':`<crm-record-tools entity="${view}" record-id="${view==='students'?'s_client':'c_client'}"></crm-record-tools>`}</div><script src="/public/record-versions.js"></script><script src="/public/center.js"></script><script src="/public/components.js"></script></body></html>`;}
      else if(url.pathname.startsWith('/api/records/')) data={record:contact,editable:true};
      else if(url.pathname==='/api/control-center') data=center;
      else if(url.pathname==='/api/workflows') data=flow;
      else if(url.pathname==='/api/insights') data={cohort:'All accessible records',sources:[{source:'Website',leads:501,converted:100,rate:19.96}],enrollment:[],agents:[],stages:[],nextActions:[{record:'ECC-001',action:'Request passport',deadline:'2026-10-01',url:'/cases/case_client'}]};
      else if(url.pathname==='/api/assistant/jobs') data={jobs:[]};
      else if(url.pathname==='/api/portal/invitations') data={invitations:[],url:'http://crm.test/portal#invite=private',message:'Share this invitation'};
      else if(url.pathname==='/api/portal/me') data={email:contact.email,student:{name:'Client One',applicationStage:'Applying'},cases:[{id:'case_client',caseNumber:'ECC-001',stage:'Documents Pending',nextAction:'Upload passport'}],documents:[{id:'doc_client',name:'Passport',required:true,status:'Requested',caseNumber:'ECC-001',latestVersion:0}],invoices:[],messages:[]};
      else if(url.pathname.includes('/conversations')) data={messages:[{channel:'email',direction:'inbound',subject:'Reply',body:'<img src=x onerror=alert(1)>',status:'received'}]};
      else if(url.pathname==='/api/contacts/c_client'&&req.method()==='GET') data={contact};
      else data={status:'ok'};
      await req.respond({status:200,contentType,body:typeof data==='object'&&!Buffer.isBuffer(data)?JSON.stringify(data):data});
    }catch(e){errors.push(e.message);await req.abort().catch(()=>{});}
  });
  await page.goto('http://crm.test/'+(view==='portal'?'portal#invite=single-use-invitation':''),{waitUntil:'networkidle0'});
  return {page,calls,errors,flow,center,contact};
}

test('contact tools stay on the record, default to the correct client and show safe conversation text', async () => {
  const {page,errors}=await fixture();
  try {
    await page.waitForFunction(()=>document.querySelector('crm-record-tools')?.shadowRoot.querySelector('form'));
    assert.equal(await page.$eval('body',el=>el.querySelectorAll('iframe').length),0);
    const selected=await page.evaluate(()=>document.querySelector('crm-record-tools').shadowRoot.querySelector('[name=contactId]').value);
    assert.equal(selected,'c_client');
    await page.evaluate(()=>[...document.querySelector('crm-record-tools').shadowRoot.querySelectorAll('nav button')].find(b=>b.textContent==='Conversation').click());
    await page.waitForFunction(()=>document.querySelector('crm-record-tools').shadowRoot.textContent.includes('<img src=x'));
    assert.equal(await page.evaluate(()=>document.querySelector('crm-record-tools').shadowRoot.querySelectorAll('img').length),0);
    assert.deepEqual(errors,[]);
  }finally{await page.close()}
});

test('student workflow hydrates existing values and sends its record version with edits', async()=>{
 const {page,calls,errors}=await fixture('students');
 try{
  await page.waitForFunction(()=>document.querySelector('crm-record-tools').shadowRoot.querySelector('[name=intake]')?.value==='January 2027');
  await page.evaluate(()=>{const root=document.querySelector('crm-record-tools').shadowRoot;root.querySelector('[name=intake]').value='September 2027';root.querySelector('[name=intake]').closest('form').requestSubmit()});
  await page.waitForFunction(()=>document.querySelector('crm-record-tools').shadowRoot.querySelector('#notice').textContent.includes('Saved'));
  const mutation=calls.find(r=>r.path==='/api/workflows/student');assert.ok(mutation);assert.equal(mutation.headers['if-match'],'student-version');assert.equal(JSON.parse(mutation.body).intake,'September 2027');assert.deepEqual(errors,[]);
 }finally{await page.close()}
});

test('native workspace renders operational tabs without an iframe',async()=>{
 const {page,errors}=await fixture('workspace');try{await page.waitForFunction(()=>document.querySelector('crm-workspace').shadowRoot.querySelectorAll('nav button').length>5);assert.equal(await page.$eval('body',el=>el.querySelectorAll('iframe').length),0);assert.ok(await page.evaluate(()=>document.querySelector('crm-workspace').shadowRoot.textContent.includes('Trash')));assert.deepEqual(errors,[])}finally{await page.close()}
});

test('report date filters request server aggregates and retain full record counts',async()=>{
 const {page,calls,errors}=await fixture('insights');try{await page.waitForFunction(()=>document.querySelector('crm-insights').shadowRoot.textContent.includes('501'));await page.evaluate(()=>{const root=document.querySelector('crm-insights').shadowRoot;root.querySelector('[name=from]').value='2026-01-01';root.querySelector('form').requestSubmit()});await page.waitForFunction(()=>document.querySelector('crm-insights').shadowRoot.textContent.includes('501'));assert.ok(calls.filter(r=>r.path==='/api/insights').length>=2);assert.deepEqual(errors,[])}finally{await page.close()}
});

test('portal removes invitation credentials from the URL and supports document submission',async()=>{
 const {page,calls,errors}=await fixture('portal');try{await page.waitForSelector('input[type=file]');assert.equal(new URL(page.url()).hash,'');assert.equal(JSON.parse(calls.find(r=>r.path==='/api/portal/session').body).token,'single-use-invitation');const file=path.join(os.tmpdir(),'ecc-portal-upload.txt');fs.writeFileSync(file,'Client document');const input=await page.$('input[type=file]');await input.uploadFile(file);await page.evaluate(()=>document.querySelector('input[type=file]').closest('form').requestSubmit());await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('uploaded'));assert.ok(calls.some(r=>r.path==='/api/portal/documents/doc_client/files'&&r.method==='POST'));assert.deepEqual(errors,[]);fs.unlinkSync(file)}finally{await page.close()}
});

test('a background refresh cannot replace the version attached to an open edit dialog',async()=>{
 const {page,calls,contact}=await fixture('workspace');try{await page.evaluate(async()=>{const get=()=>new Promise(resolve=>{const xhr=new XMLHttpRequest();xhr.open('GET','/api/contacts/c_client');xhr.onload=resolve;xhr.send()});await get();document.body.append(Object.assign(document.createElement('div'),{className:'modal-panel'}));await new Promise(resolve=>setTimeout(resolve,0))});contact._revision='new-version';await page.evaluate(async()=>{await new Promise(resolve=>{const xhr=new XMLHttpRequest();xhr.open('GET','/api/contacts/c_client');xhr.onload=resolve;xhr.send()});await new Promise(resolve=>{const xhr=new XMLHttpRequest();xhr.open('PUT','/api/contacts/c_client');xhr.onload=resolve;xhr.send('{}')})});assert.equal(calls.find(r=>r.path==='/api/contacts/c_client'&&r.method==='PUT').headers['if-match'],'old-version')}finally{await page.close()}
});

test('live app login, native record workflows, reporting and mobile layout', {skip:process.env.ECC_BROWSER_LIVE!=='true'},async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ecc-crm-browser-')),port='17001';
 const server=spawn(path.join(__dirname,'../build/ecc-crm'),[],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:port,DATABASE_PATH:path.join(directory,'crm.sqlite3'),JWT_SECRET:'browser-test-secret-only',APP_URL:'http://localhost:'+port,ALLOW_SIGNUP:'false',GRAPH_ORG_ID:'',WHATSAPP_ORG_ID:''},stdio:'pipe'});
 const page=await browser.newPage();let output='';server.stderr.on('data',data=>output+=data);
 try{
  for(let i=0;i<100;i++){try{const response=await fetch('http://localhost:'+port+'/api/health');if(response.ok)break}catch{}await new Promise(resolve=>setTimeout(resolve,100))}
  await page.goto('http://localhost:'+port,{waitUntil:'networkidle0'});
  await page.type('input[type=email]','demo@northwind.dev');await page.type('input[type=password]','Demo1234');await page.click('button[type=submit]');
  await page.waitForSelector('.app-shell');await page.goto('http://localhost:'+port+'/contacts/c_1',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>document.querySelector('crm-record-tools').shadowRoot.querySelector('form'));
  assert.equal(await page.$eval('body',el=>el.querySelectorAll('iframe').length),0);
  for (const width of [320,390,768]) {
    await page.setViewport({width,height:844,isMobile:true,hasTouch:true});
    await page.goto('http://localhost:'+port+'/contacts',{waitUntil:'networkidle0'});
    await page.waitForSelector('table[data-mobile-cards]');
    assert.ok(await page.$eval('body',el=>el.scrollWidth<=window.innerWidth+2), 'contacts overflow at '+width);
    assert.equal(await page.$eval('.mobile-nav',el=>getComputedStyle(el).display),'grid');
    if(width<=600) assert.equal(await page.$eval('table.data-table',el=>getComputedStyle(el).minWidth),'0px');
    await page.click('.topbar__menu-btn');
    await page.waitForSelector('.sidebar.is-open');
    await page.waitForFunction(()=>document.querySelector('.app-main').inert);
    assert.equal(await page.$eval('.app-main',el=>el.inert),true);
    await page.click('.sidebar__close');
    await page.waitForFunction(()=>document.querySelector('.sidebar').inert);
    await page.evaluate(()=>[...document.querySelectorAll('.mobile-nav button')].find(b=>b.textContent.trim()==='Tasks').click());
    await page.waitForFunction(()=>location.pathname==='/tasks');
    assert.equal(await page.$eval('.app-main',el=>el.inert),false);
  }
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://localhost:'+port+'/contacts',{waitUntil:'networkidle0'});
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Add contact').click());
  await page.waitForSelector('.modal');
  assert.ok(await page.$eval('.modal',el=>el.getBoundingClientRect().width<=window.innerWidth));
  assert.equal(await page.$eval('.modal input',el=>getComputedStyle(el).fontSize),'16px');
  await page.click('.modal__close');
  await page.goto('http://localhost:'+port+'/administration',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>document.querySelector('crm-administration')?.shadowRoot.querySelector('table'));
  await page.evaluate(()=>[...document.querySelector('crm-administration').shadowRoot.querySelectorAll('button')].find(b=>b.textContent==='Add user').click());
  await page.evaluate(()=>{const root=document.querySelector('crm-administration').shadowRoot;root.querySelector('[name=name]').value='Browser Viewer';root.querySelector('[name=email]').value='browser-viewer@example.com';root.querySelector('[name=role]').value='viewer';root.querySelector('[name=password]').value='BrowserViewerPassword!';root.querySelector('form').requestSubmit()});
  await page.waitForFunction(()=>document.querySelector('crm-administration').shadowRoot.querySelector('table').textContent.includes('browser-viewer@example.com'));
  await page.evaluate(()=>[...document.querySelector('crm-administration').shadowRoot.querySelectorAll('nav button')].find(b=>b.textContent==='Access levels').click());
  assert.ok(await page.evaluate(()=>document.querySelector('crm-administration').shadowRoot.textContent.includes('Read only')));
  await page.setViewport({width:390,height:844});assert.ok(await page.$eval('body',el=>el.scrollWidth<=window.innerWidth+2));
  await page.goto('http://localhost:'+port+'/reports',{waitUntil:'networkidle0'});await page.waitForFunction(()=>document.querySelector('crm-insights').shadowRoot.textContent.includes('Lead conversion'));
  await page.setViewport({width:390,height:844});assert.ok(await page.$eval('body',el=>el.scrollWidth<=window.innerWidth+2));
 }catch(error){fs.mkdirSync(path.join(__dirname,'artifacts'),{recursive:true});await page.screenshot({path:path.join(__dirname,'artifacts/live-failure.png'),fullPage:true});throw new Error(error.message+'\n'+output)}finally{await page.close();server.kill('SIGTERM');await new Promise(resolve=>{if(server.exitCode!==null)return resolve();server.once('exit',resolve)});fs.rmSync(directory,{recursive:true,force:true})}
});
