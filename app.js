// App web: Blockly + export .ino + WebSerial opcional
let workspace = null;
let port = null, writer = null, reader = null;

function logSerial(msg){
  const el = document.getElementById('serial-log');
  el.textContent += msg + "\n";
  el.scrollTop = el.scrollHeight;
}

function setupBlockly(){
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    scrollbars: true,
    trashcan: true
  });

  // Demo por defecto: blink LED13
  const xmlText = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="controls_repeat_ext" x="50" y="30">
    <value name="TIMES"><shadow type="math_number"><field name="NUM">100000</field></shadow></value>
    <statement name="DO">
      <block type="digital_write_pin">
        <field name="PIN">13</field><field name="STATE">HIGH</field>
        <next><block type="delay_ms"><field name="MS">1000</field>
          <next><block type="digital_write_pin">
            <field name="PIN">13</field><field name="STATE">LOW</field>
            <next><block type="delay_ms"><field name="MS">1000</field></block></next>
          </block></next>
        </block></next>
      </block>
    </statement>
  </block>
</xml>`;
  const dom = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(dom, workspace);
}

function generateSketch(){
  Arduino.init(workspace);
  const tops = workspace.getTopBlocks(true);
  let body = '';
  for (const b of tops) body += Arduino.blockToCode(b) || '';
  const final = Arduino.finish(body);
  document.getElementById('code').textContent = final;
  return final;
}

function downloadINO(name, content){
  const blob = new Blob([content], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function connectSerial(){
  if (!('serial' in navigator)) {
    alert('Tu navegador no soporta WebSerial. Usa Chrome/Edge bajo HTTPS o localhost.');
    return;
  }
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 115200 });
  writer = port.writable.getWriter();
  reader = port.readable.getReader();
  document.getElementById('port-label').textContent = 'conectado';

  // loop de lectura
  (async () => {
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) logSerial(decoder.decode(value));
      }
    } catch (e) {
      logSerial('Lectura detenida: ' + e.message);
    }
  })();
}

async function sendSerial(cmd){
  if (!writer) { alert('Primero conecta'); return; }
  const enc = new TextEncoder();
  await writer.write(enc.encode(cmd.trim() + "\n"));
  logSerial('> ' + cmd);
}

window.addEventListener('DOMContentLoaded', () => {
  setupBlockly();

  document.getElementById('btn-generate').addEventListener('click', generateSketch);
  document.getElementById('btn-download').addEventListener('click', () => {
    const sketch = generateSketch();
    downloadINO('sketch.ino', sketch);
  });
  document.getElementById('btn-connect').addEventListener('click', connectSerial);
  document.getElementById('serial-send').addEventListener('click', () => {
    const cmd = document.getElementById('serial-input').value;
    sendSerial(cmd);
  });
  document.getElementById('btn-test-led').addEventListener('click', async () => {
    await sendSerial('W 13 H');
    setTimeout(() => sendSerial('W 13 L'), 800);
  });
});
