(function () {
  "use strict";

  window.__RDD_ENHANCED__ = true;

  const CDN = "https://setup-aws.rbxcdn.com";
  const CACHE_URL = "../api/versions/index.json";
  const DEFAULT_WORKERS = 4;
  const MAX_WORKERS = 8;
  const RETRIES = 2;

  const types = {
    WindowsPlayer: { source: "WindowsPlayer", platform: "Windows", kind: "player", blob: "/", versionFile: "/version" },
    WindowsStudio64: { source: "WindowsStudio64", platform: "Windows", kind: "studio", blob: "/", versionFile: "/versionQTStudio" },
    MacPlayer: { source: "MacPlayer", platform: "Mac", kind: "player", blob: "/mac/", versionFile: "/mac/version", archive: "RobloxPlayer.zip" },
    MacStudio: { source: "MacStudio", platform: "Mac", kind: "studio", blob: "/mac/", versionFile: "/mac/versionStudio", archive: "RobloxStudioApp.zip" },
    MacPlayerArm64: { source: "MacPlayer", platform: "Mac", kind: "player", blob: "/mac/arm64/", versionFile: "/mac/version", archive: "RobloxPlayer.zip" },
    MacStudioArm64: { source: "MacStudio", platform: "Mac", kind: "studio", blob: "/mac/arm64/", versionFile: "/mac/versionStudio", archive: "RobloxStudioApp.zip" }
  };

  const roots = {
    player: {
      "RobloxApp.zip":"","redist.zip":"","shaders.zip":"shaders/","ssl.zip":"ssl/","WebView2.zip":"","WebView2RuntimeInstaller.zip":"WebView2RuntimeInstaller/",
      "content-avatar.zip":"content/avatar/","content-configs.zip":"content/configs/","content-fonts.zip":"content/fonts/","content-sky.zip":"content/sky/","content-sounds.zip":"content/sounds/","content-textures2.zip":"content/textures/","content-models.zip":"content/models/",
      "content-platform-fonts.zip":"PlatformContent/pc/fonts/","content-platform-dictionaries.zip":"PlatformContent/pc/shared_compression_dictionaries/","content-terrain.zip":"PlatformContent/pc/terrain/","content-textures3.zip":"PlatformContent/pc/textures/",
      "extracontent-luapackages.zip":"ExtraContent/LuaPackages/","extracontent-translations.zip":"ExtraContent/translations/","extracontent-models.zip":"ExtraContent/models/","extracontent-textures.zip":"ExtraContent/textures/","extracontent-places.zip":"ExtraContent/places/"
    },
    studio: {
      "RobloxStudio.zip":"","RibbonConfig.zip":"RibbonConfig/","redist.zip":"","Libraries.zip":"","LibrariesQt5.zip":"","WebView2.zip":"","WebView2RuntimeInstaller.zip":"","shaders.zip":"shaders/","ssl.zip":"ssl/",
      "Qml.zip":"Qml/","Plugins.zip":"Plugins/","StudioFonts.zip":"StudioFonts/","BuiltInPlugins.zip":"BuiltInPlugins/","ApplicationConfig.zip":"ApplicationConfig/","BuiltInStandalonePlugins.zip":"BuiltInStandalonePlugins/",
      "content-qt_translations.zip":"content/qt_translations/","content-sky.zip":"content/sky/","content-fonts.zip":"content/fonts/","content-avatar.zip":"content/avatar/","content-models.zip":"content/models/","content-sounds.zip":"content/sounds/","content-configs.zip":"content/configs/","content-api-docs.zip":"content/api_docs/","content-textures2.zip":"content/textures/","content-studio_svg_textures.zip":"content/studio_svg_textures/",
      "content-platform-fonts.zip":"PlatformContent/pc/fonts/","content-platform-dictionaries.zip":"PlatformContent/pc/shared_compression_dictionaries/","content-terrain.zip":"PlatformContent/pc/terrain/","content-textures3.zip":"PlatformContent/pc/textures/",
      "extracontent-translations.zip":"ExtraContent/translations/","extracontent-luapackages.zip":"ExtraContent/LuaPackages/","extracontent-textures.zip":"ExtraContent/textures/","extracontent-scripts.zip":"ExtraContent/scripts/","extracontent-models.zip":"ExtraContent/models/","studiocontent-models.zip":"StudioContent/models/","studiocontent-textures.zip":"StudioContent/textures/"
    }
  };

  let form, logBox, cache, active = new Set(), cancelled = false, inspectorRecords = [], activeZip = null;

  function $(id) { return document.getElementById(id); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function log(msg) {
    logBox = logBox || $("consoleText");
    if (!logBox) return;
    logBox.append(String(msg || "") + "\n");
    logBox.scrollTop = logBox.scrollHeight;
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, Number(n) || a)); }
  function fmt(bytes) {
    bytes = Number(bytes) || 0;
    if (!bytes) return "0 B";
    const u = ["B","KB","MB","GB","TB"], i = Math.min(u.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
  }
  function channelName(v) {
    v = String(v || "LIVE").trim();
    return !v || v.toLowerCase() === "production" || v.toUpperCase() === "LIVE" ? "LIVE" : v.toLowerCase();
  }
  function normalizeVersion(v) {
    const raw = String(v || "").trim();
    if (!raw) return "";
    try {
      const obj = JSON.parse(raw), x = obj.clientVersionUpload || obj.versionGuid || obj.version;
      if (typeof x === "string" && /^version-[0-9a-f]+$/i.test(x)) return x.toLowerCase();
    } catch (_) {}
    const m = raw.match(/version-[0-9a-f]{8,}/i) || raw.match(/\b[0-9a-f]{16}\b/i);
    if (m) return m[0].toLowerCase().startsWith("version-") ? m[0].toLowerCase() : `version-${m[0].toLowerCase()}`;
    return /^[0-9a-f]{8,}$/i.test(raw) ? `version-${raw.toLowerCase()}` : raw.toLowerCase();
  }
  function basePath() { return window.location.href.split("?")[0]; }
  function channelBase(ch) { return ch === "LIVE" ? CDN : `${CDN}/channel/${ch}`; }
  function showStatus(state, text) {
    const pill = $("statusPill"), label = $("statusLabel"), cancel = $("rddCancel"), retry = $("rddRetry");
    if (pill) pill.dataset.state = state;
    if (label) label.textContent = text || state;
    if (cancel) cancel.disabled = state !== "running";
    if (retry) retry.hidden = state !== "error";
  }
  function progress(pct, text) {
    pct = clamp(pct, 0, 100);
    const bar = $("progressBar"), label = $("progressLabel"), value = $("progressPercent");
    if (bar) bar.style.width = pct + "%";
    if (label) label.textContent = text || "";
    if (value) value.textContent = Math.round(pct) + "%";
  }
  function toast(text) {
    const t = $("toast"); if (!t) return;
    t.textContent = text; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200);
  }
  function readStore(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch (_) { return fallback; } }

  function injectCss() {
    const style = document.createElement("style");
    style.textContent = `
      .rdd-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}.rdd-help{font-size:11px;color:var(--muted-2);margin-top:5px}.rdd-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px}.rdd-row select{min-width:180px;flex:1}.rdd-manifest{margin-top:14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--panel-3);padding:12px}.rdd-packages{display:grid;gap:5px;max-height:280px;overflow:auto;margin-top:9px}.rdd-package{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:7px 9px;border:1px solid var(--border);border-radius:var(--radius-xs);background:var(--panel-2);font-size:12px}.rdd-package span:nth-child(2){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,monospace}.rdd-package span:last-child{color:var(--muted-2)}.rdd-recent{display:grid;gap:7px}.rdd-recent-row{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px;border:1px solid var(--border);border-radius:var(--radius-xs)}.rdd-recent-row div{min-width:0;display:grid}.rdd-recent-row span{color:var(--muted-2);font-size:11px;overflow:hidden;text-overflow:ellipsis}.rdd-small{padding:5px 9px!important;min-height:30px!important;font-size:12px!important}button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:720px){.rdd-extra-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function field(label, html, help) {
    const d = document.createElement("div"); d.className = "field";
    d.innerHTML = `<label>${label}</label>${html}${help ? `<div class="rdd-help">${help}</div>` : ""}`;
    return d;
  }

  function enhanceUi() {
    injectCss();
    form = $("downloadForm"); logBox = $("consoleText");
    if (!form) return;
    $("downloadFormDiv").hidden = false;

    const binary = form.binaryType;
    if (!qa('option[value="MacPlayerArm64"]', binary).length) {
      binary.add(new Option("Mac Player — ARM64", "MacPlayerArm64"));
      binary.add(new Option("Mac Studio — ARM64", "MacStudioArm64"));
      const labels = { WindowsPlayer:"Windows Player", WindowsStudio64:"Windows Studio 64-bit", MacPlayer:"Mac Player — Intel", MacStudio:"Mac Studio — Intel" };
      qa("option", binary).forEach(o => { if (labels[o.value]) o.textContent = labels[o.value]; });
    }

    const grid = q(".field-grid", form);
    const versionField = form.version.closest(".field");
    const modeField = field("Version", '<select id="rddVersionMode"><option value="latest">Latest</option><option value="previous">Previous</option><option value="future">Future</option><option value="history">Observed history</option><option value="custom">Custom hash</option></select><div id="rddVersionHint" class="rdd-help">Loading version cache...</div>');
    grid.insertBefore(modeField, versionField);
    versionField.id = "rddCustomVersion";
    q("label", versionField).textContent = "Custom version hash";
    const historyField = field("Observed version", '<select id="rddHistoryVersion"></select>'); historyField.id = "rddHistoryField"; historyField.hidden = true;
    grid.insertBefore(historyField, versionField.nextSibling);

    const extra = document.createElement("div"); extra.className = "rdd-extra-grid";
    extra.append(
      field("Package set", '<select id="rddPackagePreset"><option value="full">Full deployment</option><option value="core">Core runtime</option><option value="minimal">Minimal runtime</option><option value="content">Content only</option><option value="custom">Custom selection</option></select>'),
      field("Parallel workers", '<input id="rddWorkers" type="number" min="1" max="8" value="4">', "Bounded to 1–8 to reduce RAM/network spikes.")
    );
    grid.after(extra);

    const toggles = q(".toggle-grid", form);
    const verify = document.createElement("label"); verify.className = "toggle"; verify.innerHTML = '<input id="rddVerify" type="checkbox" checked><span>Verify package MD5 + size</span>';
    toggles.appendChild(verify);

    const buttons = q(".button-row", form);
    const inspect = document.createElement("button"); inspect.type = "button"; inspect.className = "btn-ghost"; inspect.textContent = "Inspect manifest"; inspect.onclick = inspectManifest;
    buttons.insertBefore(inspect, buttons.lastElementChild);

    const presets = document.createElement("div"); presets.className = "rdd-row";
    presets.innerHTML = '<select id="rddPreset"><option value="">Saved presets...</option></select><button type="button" class="btn-ghost rdd-small" id="rddSavePreset">Save preset</button><button type="button" class="btn-ghost rdd-small" id="rddDeletePreset">Delete preset</button>';
    buttons.after(presets);

    const inspector = document.createElement("div"); inspector.id = "rddManifest"; inspector.className = "rdd-manifest"; inspector.hidden = true;
    inspector.innerHTML = '<div id="rddManifestMeta" class="rdd-help"></div><div class="rdd-row"><button type="button" class="btn-ghost rdd-small" id="rddAll">Select all</button><button type="button" class="btn-ghost rdd-small" id="rddNone">Select none</button><span class="rdd-help">Checkboxes are used by Custom selection.</span></div><div id="rddPackages" class="rdd-packages"></div>';
    presets.after(inspector);

    const shell = q(".progress-shell");
    if (shell) {
      const actions = document.createElement("div"); actions.className = "rdd-row";
      actions.innerHTML = '<button id="rddCancel" type="button" class="btn-ghost rdd-small" disabled>Cancel</button><button id="rddRetry" type="button" class="btn-ghost rdd-small" hidden>Retry</button>';
      shell.appendChild(actions);
    }

    const leftStack = q(".app-grid > .stack");
    if (leftStack) {
      const recent = document.createElement("section"); recent.className = "panel";
      recent.innerHTML = '<div class="panel-head"><div class="panel-title"><h2>Recent downloads</h2><div class="panel-subtitle">Stored locally in this browser only.</div></div></div><div class="panel-body"><div id="rddRecent" class="rdd-recent"></div></div>';
      leftStack.appendChild(recent);
    }

    $("rddVersionMode").onchange = () => { syncMode(); updateSummary(); };
    binary.onchange = () => { fillVersionInfo(); updateSummary(); };
    form.channel.oninput = updateSummary; form.version.oninput = updateSummary;
    $("rddPackagePreset").onchange = updateSummary; $("rddWorkers").oninput = updateSummary; $("rddVerify").onchange = updateSummary;
    form.compressZip.onchange = updateSummary; form.compressionLevel.oninput = updateSummary;
    form.version.onblur = () => { const v = normalizeVersion(form.version.value); if (v) form.version.value = v; updateSummary(); };
    $("rddAll").onclick = () => qa('#rddPackages input[type="checkbox"]').forEach(x => x.checked = true);
    $("rddNone").onclick = () => qa('#rddPackages input[type="checkbox"]').forEach(x => x.checked = false);
    $("rddCancel").onclick = cancel;
    $("rddRetry").onclick = () => location.reload();
    $("rddSavePreset").onclick = savePreset;
    $("rddDeletePreset").onclick = deletePreset;
    $("rddPreset").onchange = loadPreset;

    window.downloadFromForm = () => location.assign(permalink());
    window.copyPermLink = async () => { await navigator.clipboard.writeText(permalink()); toast("Permanent link copied."); };
    renderPresets(); renderRecent(); syncMode(); updateSummary();
  }

  function queryConfig() {
    const p = new URLSearchParams(location.search), type = p.get("binaryType") || form.binaryType.value;
    return {
      type,
      channel: channelName(p.get("channel") || form.channel.value || form.channel.placeholder),
      mode: p.get("versionMode") || (p.get("version") ? "custom" : $("rddVersionMode").value),
      version: normalizeVersion(p.get("version") || ""),
      blob: p.get("blobDir") || (types[type] && types[type].blob),
      preset: p.get("packagePreset") || $("rddPackagePreset").value,
      packages: (p.get("packages") || "").split(",").filter(Boolean),
      workers: clamp(parseInt(p.get("parallelism") || $("rddWorkers").value, 10), 1, MAX_WORKERS),
      verify: p.has("verifyPackages") ? p.get("verifyPackages") !== "false" : $("rddVerify").checked,
      compress: p.get("compressZip") === "true" || (!p.has("compressZip") && form.compressZip.checked),
      level: clamp(parseInt(p.get("compressionLevel") || form.compressionLevel.value, 10), 1, 9)
    };
  }

  function permalink() {
    const p = new URLSearchParams(), type = form.binaryType.value, mode = $("rddVersionMode").value;
    p.set("channel", channelName(form.channel.value || form.channel.placeholder)); p.set("binaryType", type); p.set("versionMode", mode);
    let v = mode === "custom" ? normalizeVersion(form.version.value) : mode === "history" ? normalizeVersion($("rddHistoryVersion").value) : "";
    if (v) p.set("version", v);
    p.set("packagePreset", $("rddPackagePreset").value); p.set("parallelism", clamp($("rddWorkers").value,1,MAX_WORKERS)); p.set("verifyPackages", String($("rddVerify").checked));
    if (form.compressZip.checked) { p.set("compressZip","true"); p.set("compressionLevel",form.compressionLevel.value); }
    if ($("rddPackagePreset").value === "custom" && inspectorRecords.length) {
      const picked = qa('#rddPackages input[type="checkbox"]:checked').map(x => x.dataset.pkg);
      p.set("packages", picked.length ? picked.join(",") : "__none__");
    }
    return `${basePath()}?${p.toString()}`;
  }

  async function loadCache() {
    if (cache) return cache;
    const r = await fetch(CACHE_URL, { cache: "no-store" }); if (!r.ok) throw new Error(`version cache HTTP ${r.status}`);
    cache = await r.json(); return cache;
  }
  function cachedVersion(c, mode, type) {
    const info = types[type]; if (!c || !info) return null;
    if (mode === "latest") return c.current && c.current[info.source] && c.current[info.source].version;
    const section = c[mode]; return section && section[info.source] && section[info.source].version;
  }
  async function resolveVersion(cfg) {
    if (cfg.version) return cfg.version;
    if (cfg.mode === "custom" || cfg.mode === "history") throw new Error("A version hash is required for this mode.");
    if (cfg.channel === "LIVE") {
      try { const c = await loadCache(), v = cachedVersion(c,cfg.mode,cfg.type); if (v) return normalizeVersion(v); } catch (e) { log(`[*] Cache unavailable: ${e.message}`); }
    }
    if (cfg.mode !== "latest") throw new Error(`${cfg.mode} is unavailable for channel ${cfg.channel}; use a custom hash.`);
    const info = types[cfg.type], r = await fetch(channelBase(cfg.channel) + info.versionFile, { cache:"no-store" });
    if (!r.ok) throw new Error(`latest version HTTP ${r.status}`); const v = normalizeVersion(await r.text());
    if (!v.startsWith("version-")) throw new Error("Unexpected version response."); return v;
  }

  async function fillVersionInfo() {
    try {
      const c = await loadCache(), type = form.binaryType.value, mode = $("rddVersionMode").value, hint = $("rddVersionHint");
      const current = cachedVersion(c,"latest",type), prev = cachedVersion(c,"previous",type), future = cachedVersion(c,"future",type);
      hint.textContent = mode === "latest" ? (current ? `Latest: ${current}` : "Resolved at download time") : mode === "previous" ? (prev ? `Previous: ${prev}` : "No previous cached") : mode === "future" ? (future ? `Future: ${future}` : "No future cached") : mode === "custom" ? "Paste a hash, ClientSettings JSON, or deployment URL" : "Choose an observed version below";
      const h = $("rddHistoryVersion"), arr = (c.history && c.history[types[type].source]) || [], old = h.value; h.innerHTML = "";
      arr.forEach(x => h.add(new Option(`${x.version}${x.observedAt ? ` — ${new Date(x.observedAt).toLocaleString()}` : ""}`, x.version)));
      if (old && qa("option",h).some(o=>o.value===old)) h.value=old;
    } catch (e) { $("rddVersionHint").textContent = `Version cache unavailable: ${e.message}`; }
  }
  function syncMode() { const m=$("rddVersionMode").value; $("rddCustomVersion").hidden=m!=="custom"; $("rddHistoryField").hidden=m!=="history"; fillVersionInfo(); }
  function updateSummary() {
    const b=$("summaryBinary"),c=$("summaryChannel"),v=$("summaryVersion"),per=$("permalinkPreview");
    if(b)b.textContent=form.binaryType.options[form.binaryType.selectedIndex].text;if(c)c.textContent=channelName(form.channel.value||form.channel.placeholder);
    if(v){const m=$("rddVersionMode").value;v.textContent=m==="custom"?(form.version.value||"Custom"):m==="history"?($("rddHistoryVersion").value||"History"):m[0].toUpperCase()+m.slice(1);}if(per)per.textContent=permalink();
  }

  function parseManifest(text) {
    const l=text.split(/\r?\n/).map(x=>x.trim()); if(l[0]!=="v0")throw new Error(`Unknown manifest format ${l[0]||"empty"}`); const out=[];
    for(let i=1;i+3<l.length;i+=4){if(!l[i])continue;out.push({name:l[i],md5:/^[0-9a-f]{32}$/i.test(l[i+1])?l[i+1].toLowerCase():null,compressed:+l[i+2]||0,expanded:+l[i+3]||0});}return out;
  }
  async function fetchManifest(cfg, version) {
    let base=channelBase(cfg.channel), prefix=`${base}${cfg.blob}${version}-`, r=await fetch(prefix+"rbxPkgManifest.txt",{cache:"no-store"});
    if(!r.ok){base=`${CDN}/channel/common`;prefix=`${base}${cfg.blob}${version}-`;r=await fetch(prefix+"rbxPkgManifest.txt",{cache:"no-store"});}
    if(!r.ok)throw new Error(`manifest HTTP ${r.status}`);return {records:parseManifest(await r.text()),prefix};
  }
  function selectedRecords(records,cfg){
    let z=records.filter(x=>x.name.endsWith(".zip"));if(cfg.preset==="custom"&&cfg.packages.length){if(cfg.packages.includes("__none__"))return[];const a=new Set(cfg.packages);return z.filter(x=>a.has(x.name));}
    if(cfg.preset==="content")return z.filter(x=>/^(content-|extracontent-|studiocontent-)/i.test(x.name));if(cfg.preset==="core")return z.filter(x=>!/^(content-|extracontent-|studiocontent-)/i.test(x.name));
    if(cfg.preset==="minimal"){const a=new Set(["RobloxApp.zip","RobloxStudio.zip","redist.zip","ssl.zip","shaders.zip","Libraries.zip","LibrariesQt5.zip","WebView2.zip","WebView2RuntimeInstaller.zip"]);return z.filter(x=>a.has(x.name));}return z;
  }

  async function inspectManifest(){
    const cfg=queryConfig();showStatus("running","Inspecting");progress(3,"Resolving version...");
    try{const ver=await resolveVersion(cfg),info=types[cfg.type];if(info.archive){inspectorRecords=[{name:info.archive,compressed:0,expanded:0}];renderInspector(ver,cfg.type);showStatus("done","Inspected");progress(100,"Mac archive ready");return;}
      const m=await fetchManifest(cfg,ver);inspectorRecords=m.records.filter(x=>x.name.endsWith(".zip"));renderInspector(ver,cfg.type);showStatus("done","Inspected");progress(100,"Manifest loaded");}
    catch(e){log(`[!] Inspector: ${e.message}`);showStatus("error","Failed");progress(0,e.message);}
  }
  function renderInspector(ver,type){const box=$("rddManifest"),list=$("rddPackages"),meta=$("rddManifestMeta");box.hidden=false;list.innerHTML="";const c=inspectorRecords.reduce((s,x)=>s+x.compressed,0),d=inspectorRecords.reduce((s,x)=>s+x.expanded,0);meta.textContent=`${type} • ${ver} • ${inspectorRecords.length} packages • ${fmt(c)} compressed • ${fmt(d)} extracted`;
    inspectorRecords.forEach(r=>{const l=document.createElement("label");l.className="rdd-package";l.innerHTML=`<input type="checkbox" data-pkg="${r.name}" checked><span>${r.name}</span><span>${r.compressed?fmt(r.compressed):"archive"}</span>`;list.appendChild(l);});updateSummary();}

  function xhr(url,onProgress){return new Promise((resolve,reject)=>{let n=0;const go=()=>{if(cancelled)return reject(new Error("Download cancelled"));n++;const x=new XMLHttpRequest();active.add(x);x.open("GET",url,true);x.responseType="arraybuffer";x.onprogress=e=>onProgress&&onProgress(e.loaded||0,e.lengthComputable?e.total:0);x.onload=()=>{active.delete(x);if(x.status===200&&x.response)return resolve(x.response);if(n<=RETRIES+1){log(`[!] HTTP ${x.status} retry ${n}/${RETRIES+1}`);return setTimeout(go,250*n);}reject(new Error(`HTTP ${x.status}`));};x.onerror=()=>{active.delete(x);if(n<=RETRIES+1)return setTimeout(go,250*n);reject(new Error("Network error"));};x.onabort=()=>{active.delete(x);reject(new Error("Download cancelled"));};x.send();};go();});}
  function cancel(){cancelled=true;active.forEach(x=>{try{x.abort()}catch(_){}});active.clear();activeZip=null;showStatus("error","Cancelled");progress(0,"Download cancelled");log("[!] Download cancelled by user.");}

  function md5(buffer){
    const bytes=new Uint8Array(buffer),n=bytes.length,bits=n*8,len=(((n+8)>>6)+1)*64,p=new Uint8Array(len);p.set(bytes);p[n]=128;const lo=bits>>>0,hi=Math.floor(bits/0x100000000)>>>0;for(let i=0;i<4;i++){p[len-8+i]=(lo>>>(8*i))&255;p[len-4+i]=(hi>>>(8*i))&255;}
    const s=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21],k=new Uint32Array(64);for(let i=0;i<64;i++)k[i]=Math.floor(Math.abs(Math.sin(i+1))*0x100000000)>>>0;
    let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;const rot=(x,c)=>((x<<c)|(x>>>(32-c)))>>>0;
    for(let o=0;o<len;o+=64){const m=new Uint32Array(16);for(let i=0;i<16;i++){const j=o+i*4;m[i]=(p[j]|p[j+1]<<8|p[j+2]<<16|p[j+3]<<24)>>>0;}let a=a0,b=b0,c=c0,d=d0;for(let i=0;i<64;i++){let f,g;if(i<16){f=(b&c)|(~b&d);g=i}else if(i<32){f=(d&b)|(~d&c);g=(5*i+1)%16}else if(i<48){f=b^c^d;g=(3*i+5)%16}else{f=c^(b|~d);g=(7*i)%16}const t=d;d=c;c=b;b=(b+rot((a+f+k[i]+m[g])>>>0,s[i]))>>>0;a=t;}a0=(a0+a)>>>0;b0=(b0+b)>>>0;c0=(c0+c)>>>0;d0=(d0+d)>>>0;}
    const h=x=>[0,1,2,3].map(i=>((x>>>(8*i))&255).toString(16).padStart(2,"0")).join("");return h(a0)+h(b0)+h(c0)+h(d0);
  }
  async function verify(rec,data,enabled){if(rec.compressed&&data.byteLength!==rec.compressed)throw new Error(`Size mismatch ${rec.name}`);if(enabled&&rec.md5){await new Promise(r=>setTimeout(r,0));const d=md5(data);if(d!==rec.md5)throw new Error(`MD5 mismatch ${rec.name}`);}}

  function saveFile(name,data,cfg,ver){const blob=new Blob([data],{type:"application/zip"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.style.display="none";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},30000);recordRecent({binaryType:cfg.type,channel:cfg.channel,version:ver,fileName:name,time:new Date().toISOString()});}
  async function download(){
    cancelled=false;const cfg=queryConfig(),info=types[cfg.type];if(!info)throw new Error("Unsupported binary type");cfg.blob=String(cfg.blob||info.blob);if(!cfg.blob.startsWith("/"))cfg.blob="/"+cfg.blob;if(!cfg.blob.endsWith("/"))cfg.blob+="/";
    showStatus("running","Resolving");progress(1,"Resolving deployment version...");const ver=await resolveVersion(cfg);log(`[+] ${cfg.type} @ ${cfg.channel} ${ver}`);const base=channelBase(cfg.channel),prefix=`${base}${cfg.blob}${ver}-`;
    if(info.archive){showStatus("running","Downloading");const data=await xhr(prefix+info.archive,(l,t)=>progress(t?l/t*98:45,`Downloading ${info.archive} — ${fmt(l)}${t?` / ${fmt(t)}`:""}`));if(cancelled)return;progress(100,"Download ready");showStatus("done","Completed");saveFile(`${cfg.channel}-${cfg.type}-${ver}.zip`,data,cfg,ver);toast("Download ready.");return;}
    progress(4,"Fetching package manifest...");const man=await fetchManifest(cfg,ver),records=selectedRecords(man.records,cfg);if(!records.length)throw new Error("No ZIP packages selected.");const map=roots[info.kind],unknown=records.filter(r=>!(r.name in map));if(unknown.length){log(`[!] ${unknown.length} unknown package(s) will be preserved at root:`);unknown.forEach(r=>log(`    - ${r.name}`));}
    const total=records.reduce((s,r)=>s+r.compressed,0),loaded=new Map();let done=0,cursor=0;activeZip=new JSZip();activeZip.file("AppSettings.xml",'<?xml version="1.0" encoding="UTF-8"?>\n<Settings>\n\t<ContentFolder>content</ContentFolder>\n\t<BaseUrl>http://www.roblox.com</BaseUrl>\n</Settings>\n');
    const sync=label=>{let l=0;loaded.forEach(x=>l+=x);const dl=total?Math.min(1,l/total):done/records.length,ex=done/records.length;progress(Math.min(84,5+dl*60+ex*20),label||`${done}/${records.length} packages complete`);};
    async function one(rec){const data=await xhr(man.prefix+rec.name,(l)=>{loaded.set(rec.name,l);sync(`Downloading ${rec.name} — ${fmt(l)}${rec.compressed?` / ${fmt(rec.compressed)}`:""}`)});await verify(rec,data,cfg.verify);log(`[+] Verified ${rec.name}${cfg.verify&&rec.md5?" (MD5)":""}`);if(!(rec.name in map)){activeZip.file(rec.name,data);}else{progress(70,`Extracting ${rec.name}...`);const z=await JSZip.loadAsync(data),jobs=[];z.forEach((path,obj)=>{if(obj.dir||path.endsWith("/")||path.endsWith("\\"))return;jobs.push(obj.async("arraybuffer").then(b=>activeZip.file(map[rec.name]+path.replace(/\\/g,"/"),b)));});await Promise.all(jobs);}loaded.set(rec.name,rec.compressed||data.byteLength);done++;sync();}
    async function worker(){while(!cancelled){const i=cursor++;if(i>=records.length)return;await one(records[i]);}}
    showStatus("running","Downloading");await Promise.all(Array.from({length:Math.min(cfg.workers,records.length)},worker));if(cancelled)return;showStatus("running","Assembling");const out=await activeZip.generateAsync({type:"arraybuffer",compression:cfg.compress?"DEFLATE":"STORE",compressionOptions:{level:cfg.level}},m=>progress(85+m.percent*.14,`${cfg.compress?"Compressing":"Assembling"} final zip — ${m.percent.toFixed(1)}%`));activeZip=null;progress(100,"Download ready");showStatus("done","Completed");saveFile(`${cfg.channel}-${cfg.type}-${ver}.zip`,out,cfg,ver);toast("Download ready.");
  }

  function presetData(){return{binaryType:form.binaryType.value,channel:form.channel.value,mode:$("rddVersionMode").value,version:form.version.value,preset:$("rddPackagePreset").value,workers:$("rddWorkers").value,verify:$("rddVerify").checked,compress:form.compressZip.checked,level:form.compressionLevel.value};}
  function renderPresets(selected){const s=$("rddPreset"),p=readStore("rddPresets",{});s.innerHTML='<option value="">Saved presets...</option>';Object.keys(p).sort().forEach(n=>s.add(new Option(n,n)));if(selected&&p[selected])s.value=selected;}
  function savePreset(){const n=prompt("Preset name:");if(!n)return;const p=readStore("rddPresets",{});p[n]=presetData();localStorage.setItem("rddPresets",JSON.stringify(p));renderPresets(n);}
  function loadPreset(){const n=$("rddPreset").value,p=readStore("rddPresets",{})[n];if(!p)return;form.binaryType.value=p.binaryType;form.channel.value=p.channel;$("rddVersionMode").value=p.mode;form.version.value=p.version;$("rddPackagePreset").value=p.preset;$("rddWorkers").value=p.workers;$("rddVerify").checked=p.verify;form.compressZip.checked=p.compress;form.compressionLevel.value=p.level;syncMode();updateSummary();}
  function deletePreset(){const n=$("rddPreset").value;if(!n)return;const p=readStore("rddPresets",{});delete p[n];localStorage.setItem("rddPresets",JSON.stringify(p));renderPresets();}
  function recordRecent(x){const a=readStore("rddRecent",[]).filter(y=>!(y.binaryType===x.binaryType&&y.version===x.version));a.unshift(x);localStorage.setItem("rddRecent",JSON.stringify(a.slice(0,8)));renderRecent();}
  function renderRecent(){const box=$("rddRecent");if(!box)return;const a=readStore("rddRecent",[]);box.innerHTML=a.length?"":'<div class="rdd-help">No local download history yet.</div>';a.forEach(x=>{const r=document.createElement("div");r.className="rdd-recent-row";r.innerHTML=`<div><strong>${x.binaryType}</strong><span>${x.version} • ${x.channel}</span></div><button class="btn-ghost rdd-small" type="button">Again</button>`;q("button",r).onclick=()=>location.assign(`${basePath()}?channel=${encodeURIComponent(x.channel)}&binaryType=${encodeURIComponent(x.binaryType)}&versionMode=custom&version=${encodeURIComponent(x.version)}`);box.appendChild(r);});}

  async function boot() {
    enhanceUi();
    if (!form) return;
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(()=>{});
    await fillVersionInfo();
    const p=new URLSearchParams(location.search);if(p.has("binaryType")){
      if(types[p.get("binaryType")])form.binaryType.value=p.get("binaryType");if(p.get("channel"))form.channel.value=p.get("channel");if(p.get("version"))form.version.value=p.get("version");$("rddVersionMode").value=p.get("versionMode")||(p.get("version")?"custom":"latest");if(p.get("packagePreset"))$("rddPackagePreset").value=p.get("packagePreset");if(p.get("parallelism"))$("rddWorkers").value=p.get("parallelism");if(p.has("verifyPackages"))$("rddVerify").checked=p.get("verifyPackages")!=="false";syncMode();updateSummary();
      try{await download();}catch(e){if(!cancelled){log(`[!] ${e.stack||e.message}`);showStatus("error","Failed");progress(0,`Failed: ${e.message}`);}}
    }else{showStatus("idle","Idle");progress(0,"Waiting to start...");}
  }

  setTimeout(boot, 0);
})();
