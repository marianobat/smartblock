import Daemon from 'arduino-create-agent-js-client';

const log = (...a) => {
  const el = document.getElementById('log');
  if (el) { el.textContent += a.join(' ') + '\n'; el.scrollTop = el.scrollHeight; }
  else console.log(...a);
};

const agent = new Daemon(); // Arduino Cloud Agent local

agent.agentFound.subscribe(found => {
  log('Agent encontrado:', found);
  const banner = document.getElementById('agent-banner');
  const btnDL = document.getElementById('btn-download-agent');
  if (banner && btnDL) {
    banner.style.display = 'block';
    btnDL.style.display = found ? 'none' : 'inline-block';
  }
});

agent.devicesList.subscribe(({ serial }) => {
  log('Puertos:', JSON.stringify(serial));
  const sel = document.getElementById('ports');
  if (!sel) return;
  sel.innerHTML = '';
  (serial || []).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.address || d.name || d.port || '';
    opt.textContent = `${d.address || d.name}${d.label ? ' ('+d.label+')':''}`;
    sel.appendChild(opt);
  });
});

document.getElementById('btn-list')?.addEventListener('click', async () => {
  await agent.refreshPorts?.();
  log('Puertos actualizados');
});

// Ejemplo: compilar en tu server local y subir con el Agent
async function compileOnLocalServer(ino, fqbn) {
  const r = await fetch('http://localhost:5055/compile', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ ino, fqbn })
  });
  const data = await r.json();
  if (!r.ok || !data.ok) throw new Error(data.error || 'Error en compilación');
  return data; // { outFormat, artifactBase64, fqbn, ... }
}

function blinkSketch() {
  return `void setup(){pinMode(13,OUTPUT);}
void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}`;
}

function toCompilationResult(compiled) {
  return {
    format: compiled.outFormat,      // 'hex' | 'bin'
    data: compiled.artifactBase64,   // base64
    fqbn: compiled.fqbn,
    sketchName: 'SmartBlockSketch',
  };
}

document.getElementById('btn-upload')?.addEventListener('click', async () => {
  const fqbn = document.getElementById('fqbn').value || 'arduino:avr:uno';
  const port = document.getElementById('ports').value;
  if (!port) return log('Elegí un puerto');

  try {
    log('Compilando…');
    const compiled = await compileOnLocalServer(blinkSketch(), fqbn);
    log('Compilado:', compiled.outFormat);

    const target = { board: fqbn, port, network: false };
    const result = toCompilationResult(compiled);

    log('Subiendo…');
    await agent.uploadSerial(target, 'SmartBlockSketch', result, false);
    log('✅ Upload OK');
  } catch (e) {
    log('❌', e.message || e);
  }
});