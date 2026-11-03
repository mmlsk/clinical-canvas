// Generated standalone compatibility copy of the maintained modular app.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.dirname(fileURLToPath(import.meta.url));
const dir=path.join(root,"clinical-canvas");
let html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
const css=fs.readFileSync(path.join(dir,"styles.css"),"utf8");
const offline = `window.CanvasPersistence={
mode:"offline",
async read(){const v=localStorage.getItem("clinical-canvas-v2")||localStorage.getItem("makieta-medyczna-v1");return v?JSON.parse(v):null;},
async write(payload){localStorage.setItem("clinical-canvas-v2",JSON.stringify(payload));}
};`;
const scripts=fs.readFileSync(path.join(dir,"clinical-data.js"),"utf8")+"\n"+offline+"\n"+["graph-model.js","score-engine.js","app.js","calculators.js"].map(f=>fs.readFileSync(path.join(dir,f),"utf8")).join("\n");
html=html.replace(/<link\s+rel="stylesheet"\s+href="styles\.css"\s*\/?>/,"<style>"+css+"</style>")
  .replace(/<script\s+defer\s+src="(?:clinical-data|storage-adapter|graph-model|score-engine|app|calculators)\.js"\s*><\/script>/g,"")
  .replace(/<script>window\.__API_BASE__\s*=\s*"__PORT_8765__";<\/script>/,"")
  .replace("</body>","<script>"+scripts.replace(/<\/script/gi,"<\\/script")+"</script></body>");
fs.writeFileSync(path.join(root,"makieta-medyczna-canvas.html"),html);
console.log("Updated standalone makieta-medyczna-canvas.html",Buffer.byteLength(html),"bytes");
