(function(){
 const $=id=>document.getElementById(id);
 const sample=`-- ARIO demo
local greeting = "Hello, ARIO!"
local count = 3

local function welcome(name)
    print(greeting .. " Welcome " .. name)
end

welcome("Developer")
print(count)
`;
 let mode="lua",lastMs=0,toastTimer;
 const optIds=["minify","strings","numbers","rename","comments"];
 function options(){return {minify:$("minify").checked,strings:$("strings").checked,numbers:$("numbers").checked,rename:$("rename").checked,comments:$("comments").checked,stringStyle:$("stringStyle").value,nameLength:Number($("nameLength").value)}}
 function setNotice(msg,type=""){const n=$("notice");n.className="notice"+(type?" "+type:"");$("noticeText").textContent=msg;}
 function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200);}
 function size(n){if(n<1024)return n+" B";return (n/1024).toFixed(2)+" KB";}
 function lines(s){return s?s.split(/\r\n|\r|\n/).length:0;}
 function gutters(){const s=$("source").value,o=$("output").value;$("inputGutter").textContent=Array.from({length:Math.max(1,lines(s))},(_,i)=>i+1).join("\n");$("outputGutter").textContent=o?Array.from({length:Math.max(1,lines(o))},(_,i)=>i+1).join("\n"):"—";}
 function analyze(){const src=$("source").value;let t=[];try{t=window.ARIO_Lexer.tokenize(src)}catch{}$("sourceStats").textContent=lines(src)+" lines · "+src.length+" chars";$("analysisLines").textContent=lines(src);$("analysisIds").textContent=t.filter(x=>x.type==="id").length;$("analysisStrings").textContent=t.filter(x=>x.type==="string"||x.type==="longstring").length;$("analysisComments").textContent=t.filter(x=>x.type==="comment").length;$("analysisMessage").textContent=src.trim()?"Basic lexical counts only. These checks do not prove the code is valid or secure.":"Paste source code to see basic token statistics.";gutters();}
 function applyProfile(){const p=$("profile").value;const presets={balanced:{minify:true,strings:true,numbers:false,rename:false,comments:true},compact:{minify:true,strings:false,numbers:true,rename:false,comments:true},strings:{minify:false,strings:true,numbers:false,rename:false,comments:false}};if(presets[p])for(const [k,v]of Object.entries(presets[p]))$(k).checked=v;toast(p==="custom"?"Custom settings retained.":"Profile applied.");}
 function saveSettings(){const data={version:1,options:options(),profile:$("profile").value,mode};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ario-settings.json";a.click();URL.revokeObjectURL(a.href);toast("Settings JSON downloaded.");}
 function loadSettings(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);for(const id of optIds)if(typeof d.options?.[id]==="boolean")$(id).checked=d.options[id];if(["char","concat"].includes(d.options?.stringStyle))$("stringStyle").value=d.options.stringStyle;if([6,10,16].includes(d.options?.nameLength))$("nameLength").value=String(d.options.nameLength);if(["balanced","compact","strings","custom"].includes(d.profile))$("profile").value=d.profile;if(["lua","luau"].includes(d.mode))setMode(d.mode);toast("Settings loaded.");}catch{setNotice("That settings file is invalid JSON.","error");}};r.readAsText(file);}
 function setMode(m){mode=m;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===m));$("editorModeText").textContent=m==="luau"?"Luau dialect selected · syntax validation not built in":"Lua-compatible token transforms";$("outputDialect").textContent=m==="luau"?"Luau target":"Lua target";}
 function obfuscate(){const source=$("source").value;try{const start=performance.now();const result=window.ARIO_Transform.transform(source,options());lastMs=performance.now()-start;$("output").value=result;$("outputStats").textContent=lines(result)+" lines · "+result.length+" chars";gutters();setNotice("Transformation finished in "+lastMs.toFixed(1)+" ms. Run the output in your target runtime and compare behavior.");$("reportIn").textContent=size(new Blob([source]).size);$("reportOut").textContent=size(new Blob([result]).size);const change=source.length?((result.length-source.length)/source.length*100):0;$("reportChange").textContent=(change>0?"+":"")+change.toFixed(1)+"%";$("reportTime").textContent=lastMs.toFixed(1)+" ms";}catch(e){setNotice(e.message||"Transformation failed.","error");}}
 function downloadOutput(){const text=$("output").value;if(!text){setNotice("Run a transformation before downloading.","warn");return;}const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ario-obfuscated."+(mode==="luau"?"luau":"lua");a.click();URL.revokeObjectURL(url);toast("Output download started.");}
 async function copyOutput(){const v=$("output").value;if(!v){setNotice("There is no output to copy yet.","warn");return;}try{await navigator.clipboard.writeText(v);toast("Output copied.");}catch{$("output").focus();$("output").select();setNotice("Clipboard access was blocked. The output is selected; copy it manually.","warn");}}
 $("source").addEventListener("input",analyze);$("source").addEventListener("click",cursor);$("source").addEventListener("keyup",cursor);
 function cursor(){const s=$("source"),before=s.value.slice(0,s.selectionStart),ls=before.split(/\r\n|\r|\n/);$("cursorInfo").textContent="Ln "+ls.length+", Col "+(ls[ls.length-1].length+1);}
 $("source").addEventListener("scroll",()=>{$("inputGutter").scrollTop=$("source").scrollTop;});
 $("output").addEventListener("scroll",()=>{$("outputGutter").scrollTop=$("output").scrollTop;});
 $("obfuscateBtn").onclick=obfuscate;$("copyBtn").onclick=copyOutput;$("downloadBtn").onclick=downloadOutput;$("applyProfile").onclick=applyProfile;
 $("profile").onchange=()=>{if($("profile").value!=="custom")applyProfile();};
 $("sampleBtn").onclick=()=>{$("source").value=sample;analyze();setNotice("Sample loaded. Try the balanced profile.");};
 $("clearSource").onclick=()=>{$("source").value="";$("output").value="";$("outputStats").textContent="Waiting for input";analyze();setNotice("Source and output cleared.");};
 $("resetBtn").onclick=()=>{$("source").value="";$("output").value="";$("profile").value="balanced";applyProfile();$("stringStyle").value="char";$("nameLength").value="10";$("sizePanel").classList.add("hidden");analyze();setNotice("Workbench reset.");};
 $("compareBtn").onclick=()=>{$("sizePanel").classList.remove("hidden");$("sizePanel").scrollIntoView({behavior:"smooth",block:"nearest"});};
 $("closeReport").onclick=()=>$("sizePanel").classList.add("hidden");
 $("openFileBtn").onclick=()=>$("fileInput").click();
 $("fileInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$("source").value=String(r.result);analyze();setNotice("Imported "+f.name+". Review and test the output after transformation.");};r.readAsText(f);e.target.value="";};
 $("saveProject").onclick=saveSettings;$("loadSettings").onclick=()=>$("settingsFile").click();$("settingsFile").onchange=e=>{if(e.target.files[0])loadSettings(e.target.files[0]);e.target.value="";};
 $("themeBtn").onclick=()=>{document.body.classList.toggle("alt-accent");toast("Accent theme toggled.");};
 document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
 document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();obfuscate();}});
 analyze();setMode("lua");
})();