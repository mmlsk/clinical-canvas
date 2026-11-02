"use strict";
(() => {
  const raw = window.__API_BASE__ || "";
  const unresolved = raw.startsWith("__PORT_");
  const local = ["localhost","127.0.0.1"].includes(location.hostname);
  const base = unresolved && local ? "http://127.0.0.1:8765" : raw;
  let revision = 0, queue = Promise.resolve();
  function endpoint() {
    if (!base || (unresolved && !local)) throw Error("Backend zapisu niedostępny w tym trybie. Użyj eksportu JSON.");
    return base.replace(/\/$/,"") + "/api/state";
  }
  window.CanvasPersistence = {
    mode: "backend",
    async read(){
      const res=await fetch(endpoint(),{credentials:"same-origin"});
      if(!res.ok)throw Error("Nie odczytano zapisu serwerowego.");
      const data=await res.json();revision=data.revision;return data.payload;
    },
    write(payload){
      const next=queue.catch(()=>{}).then(async()=>{
        const res=await fetch(endpoint(),{method:"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({revision,payload})});
        if(res.status===409)throw Error("Konflikt zapisu z inną kartą. Wyeksportuj zmiany, potem użyj „Wczytaj zapis”.");
        if(!res.ok)throw Error("Nie zapisano zmian na serwerze.");
        const data=await res.json();revision=data.revision;
      });
      queue=next;return next;
    }
  };
})();
