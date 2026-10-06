const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const flush = () => new Promise(resolve => setTimeout(resolve, 5));
async function mount({denied = false, failPatch = false} = {}) {
  const {window} = parseHTML('<html><body><div id="app"></div></body></html>');
  const {document} = window, calls = [], navigations = [];
  const data = {
    currentUserId: 'admin', organization: [{name:'Workspace',timezone:'UTC',currency:'USD',ipAllowlist:''}],
    teams: [{id:'team_a',name:'Admissions'}, {id:'team_b',name:'Finance'}], sessions: [], changes: [], security: [],
    accessLevels: ['admin','manager','member','viewer'].map((id,i) => ({id,name:['Administrator','Manager','Member','Viewer'][i],read:i<2?'All workspace records':'Shared records',write:i===3?'Read only':'Own records',recovery:i<2,users:i===0,settings:i===0})),
    users: [
      {id:'admin',name:'Admin',email:'admin@example.com',role:'admin',teamId:'team_a',status:'Active',disabled:false,activeSessions:1,accessVersion:'admin-v1'},
      {id:'member',name:'<img src=x onerror=alert(1)>',email:'member@example.com',role:'member',teamId:'team_a',status:'Active',disabled:false,twoFactorEnabled:true,activeSessions:2,accessVersion:'member-v1'},
      {id:'pending',name:'Invited user',email:'pending@example.com',role:'viewer',teamId:'team_b',status:'Invited',disabled:true,invitationExpiresAt:'2099-01-01T00:00:00Z',accessVersion:'pending-v1'}
    ]
  };
  Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.getAttribute('value')||''},set(value){for(const option of this.querySelectorAll('option')){if(option.getAttribute('value')===String(value))option.setAttribute('selected','');else option.removeAttribute('selected')}}});
  const sandbox = {
    window, document, HTMLElement:window.HTMLElement, customElements:window.customElements,
    localStorage:{getItem:()=>null}, FormData:class {constructor(form){this.items=[...form.querySelectorAll('[name]')].map(e=>[e.name,e.value])} [Symbol.iterator](){return this.items[Symbol.iterator]()}},
    fetch:async(url,options={}) => {
      calls.push({url,options});
      if (denied) return {ok:false,status:403,json:async()=>({error:'Administrator access is required'})};
      if (failPatch && options.method==='PATCH') return {ok:false,status:409,json:async()=>({error:"This user's access changed. Refresh administration before saving again."})};
      let result = data;
      if (options.method) {
        result = {message:'Changes saved.'};
        if (url==='/api/admin/users') result={inviteLink:'http://crm.test/accept-invite?token=private-invitation'};
        if (url==='/api/admin/users/member'&&options.method==='PATCH') Object.assign(data.users[1],JSON.parse(options.body),{accessVersion:'member-v2'});
      }
      return {ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(result))};
    }
  };
  window.location={assign:path=>navigations.push(path)};
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/administration.js'),'utf8'),vm.createContext(sandbox));
  const element=document.createElement('crm-administration');document.getElementById('app').append(element);await flush();
  return {root:element.shadowRoot,data,calls,navigations,window,cleanup:()=>element.remove()};
}
const findButton = (root,text) => [...root.querySelectorAll('button')].find(button=>button.textContent===text);
const manage = (app,id) => {
  const user=app.data.users.find(u=>u.id===id);
  [...app.root.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Manage '+user.name).onclick();
};

test('administration filters accounts, displays access levels and renders names safely',async()=>{
  const app=await mount();try {
    assert.ok(app.root.querySelector('.tools').textContent.includes('<img src=x'));assert.equal(app.root.querySelectorAll('img').length,0);
    const search=app.root.querySelector('[name=search]');search.value='pending@example.com';search.oninput({target:search});
    assert.ok(app.root.querySelector('.tools').textContent.includes('1 of 3 users'));assert.equal(app.root.querySelectorAll('tbody tr').length,1);
    findButton(app.root,'Access levels').onclick();
    for(const label of ['Administrator','Manager','Member','Viewer','Read only','Private','Organization']) assert.ok(app.root.querySelector('.tools').textContent.includes(label));
  } finally {app.cleanup()}
});

test('access changes require explicit save and include the loaded account revision',async()=>{
  const app=await mount();try {
    manage(app,'member');const role=app.root.querySelector('[name=role]');role.value='manager';
    assert.equal(app.calls.filter(c=>c.options.method).length,0);
    role.closest('form').onsubmit({preventDefault(){}});
    assert.equal(app.calls.filter(c=>c.options.method).length,0);
    findButton(app.root,'Confirm').onclick();await flush();
    const saved=app.calls.find(c=>c.options.method==='PATCH');assert.ok(saved);
    assert.equal(saved.url,'/api/admin/users/member');assert.equal(saved.options.headers['If-Match'],'member-v1');
    assert.equal(JSON.parse(saved.options.body).role,'manager');assert.equal(app.root.querySelector('[name=role]'),null);
    assert.equal(app.data.users[1].role,'manager');
  } finally {app.cleanup()}
});

test('stale access changes retain the form and tell the administrator to refresh',async()=>{
  const app=await mount({failPatch:true});try {
    manage(app,'member');const name=app.root.querySelector('[name=name]');name.value='Updated name';
    name.closest('form').onsubmit({preventDefault(){}});await flush();
    assert.match(app.root.querySelector('#notice').textContent,/Refresh administration/);
    assert.equal(app.root.querySelector('[name=name]').value,'Updated name');
    assert.equal(findButton(app.root,'Save access').disabled,false);
  } finally {app.cleanup()}
});

test('invited accounts expose renewal and cancellation, and new invitations are copyable',async()=>{
  const app=await mount();try {
    manage(app,'pending');assert.ok(findButton(app.root,'Renew invitation'));assert.ok(findButton(app.root,'Cancel invitation'));
    assert.equal(findButton(app.root,'Enable account'),undefined);
    findButton(app.root,'Cancel invitation').onclick();findButton(app.root,'Confirm').onclick();await flush();
    const cancel=app.calls.find(c=>c.options.method==='PATCH');assert.deepEqual(JSON.parse(cancel.options.body),{disabled:true});
    findButton(app.root,'Add user').onclick();const form=app.root.querySelector('form');
    form.querySelector('[name=name]').value='New user';form.querySelector('[name=email]').value='new@example.com';form.onsubmit({preventDefault(){}});await flush();
    const created=app.calls.find(c=>c.url==='/api/admin/users');assert.equal(JSON.parse(created.options.body).role,'member');
    assert.match(app.root.querySelector('[aria-label="Private invitation link"]').value,/private-invitation/);
  } finally {app.cleanup()}
});

test('forbidden administration loads show no account controls',async()=>{
  const app=await mount({denied:true});try {
    assert.match(app.root.querySelector('.tools').textContent,/requires Administrator access/);
    assert.equal(findButton(app.root,'Add user'),undefined);assert.equal(app.root.querySelector('table'),null);
  } finally {app.cleanup()}
});

test('revoking the current administrator session returns to sign-in',async()=>{
  const app=await mount();try {
    manage(app,'admin');findButton(app.root,'Sign out all devices').onclick();findButton(app.root,'Confirm').onclick();await flush();
    assert.deepEqual(app.navigations,['/']);assert.ok(app.calls.some(c=>c.url==='/api/admin/users/admin/revoke-sessions'));
  } finally {app.cleanup()}
});
