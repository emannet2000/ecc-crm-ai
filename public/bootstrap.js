
    (function () {
      localStorage.removeItem("token");
      var token = "cookie-session";
      var now = new Date();
      var today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

      var app = Elm.Main.init({
        node: document.getElementById("app"),
        flags: {
          token: token,
          today: today,
          theme: localStorage.getItem("theme")
        }
      });
      app.ports.storeToken.subscribe(function (token) {
        localStorage.removeItem("token");
        if (!token) fetch("/api/session/logout", {method:"POST",credentials:"same-origin"});
      });
      app.ports.storeTheme.subscribe(function (theme) { localStorage.setItem("theme", theme); });
      app.ports.downloadFile.subscribe(function (file) {
        var url = URL.createObjectURL(new Blob([file.content], { type: file.mime }));
        var link = document.createElement("a");
        link.href = url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    })();
// Keyboard support and focus restoration for Elm-rendered record rows and dialogs.
(function(){let activeDialog=null,returnFocus=null;const refresh=()=>{const main=document.querySelector('main.content, .content__body');if(main){main.id='workspace-content';main.setAttribute('tabindex','-1')};for(const row of document.querySelectorAll('tbody tr')){if(row.querySelector('a,button,input')||row.dataset.keyboard)return;row.dataset.keyboard='true';row.tabIndex=0;row.setAttribute('role','button');row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();row.click()}})}const dialog=document.querySelector('[role=dialog], .modal, .ecc-modal, .modal-panel');if(dialog!==activeDialog){if(dialog){returnFocus=document.activeElement;if(!dialog.hasAttribute('role'))dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');if(!dialog.getAttribute('aria-label')&&!dialog.getAttribute('aria-labelledby'))dialog.setAttribute('aria-label',dialog.querySelector('h2,h3')?.textContent||'Edit record');activeDialog=dialog;requestAnimationFrame(()=>dialog.querySelector('input,select,textarea,button,[tabindex]')?.focus())}else{activeDialog=null;if(returnFocus?.isConnected)returnFocus.focus()}}};new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!activeDialog)return;const focusable=[...activeDialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(el=>el.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});document.addEventListener('click',e=>{if(e.target.closest('.skip-link'))document.getElementById('workspace-content')?.focus()});refresh()})();
(function(){new MutationObserver(()=>{const readonly=document.querySelector('.app-shell--viewer');if(!readonly)return;for(const button of readonly.querySelectorAll('button')){const label=(button.textContent||'').trim();if(/^(Add |Edit$|Delete$|Move |Refund|Request refund)/i.test(label)||button.classList.contains('task-status')){button.disabled=true;button.title='Your role has read-only access';button.setAttribute('aria-disabled','true')}}}).observe(document.body,{childList:true,subtree:true})})();
