// Generador C++ para Arduino (con control/logic/math básicos)
const Arduino = new Blockly.Generator('Arduino');

Arduino.ORDER_ATOMIC = 0;

Arduino.addReservedWords('setup,loop,if,while,for,int,float,bool,boolean,digitalWrite,digitalRead,analogRead,pinMode,delay,OUTPUT,INPUT,true,false');

Arduino.init = function(workspace) {
  Arduino.setups_ = Object.create(null);
};

Arduino.finish = function(code) {
  const setupLines = Object.values(Arduino.setups_).join('') || '';
  const loopBody = code || '  // (vacío)\n';
  return `#include <Arduino.h>

void setup() {
${setupLines}}

void loop() {
${loopBody}}`;
};

Arduino.scrub_ = function(block, code) {
  const nextBlock = block && block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = Arduino.blockToCode(nextBlock);
  return code + (nextCode || '');
};

Arduino.statementToCode = function(block, name) {
  const target = block && block.getInputTargetBlock && block.getInputTargetBlock(name);
  let code = Arduino.blockToCode(target);
  if (Array.isArray(code)) code = code[0];
  return code ? code : '';
};
Arduino.valueToCode = function(block, name) {
  const target = block && block.getInputTargetBlock && block.getInputTargetBlock(name);
  let code = Arduino.blockToCode(target);
  if (Array.isArray(code)) code = code[0];
  return code || '';
};

/* Bloques propios */
Arduino['digital_write_pin'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  Arduino.setups_['pin_'+pin+'_out'] = `  pinMode(${pin}, OUTPUT);\n`;
  return `  digitalWrite(${pin}, ${state});\n`;
};
Arduino['delay_ms'] = function(block) {
  const t = block.getFieldValue('MS') || 0;
  return `  delay(${t});\n`;
};
Arduino['analog_read_pin'] = function(block) {
  const apin = block.getFieldValue('APIN') || 'A0';
  return [`analogRead(${apin})`, Arduino.ORDER_ATOMIC];
};

/* Control / lógica / math básicos */
Arduino['controls_repeat_ext'] = function(block) {
  let repeats = Arduino.valueToCode(block, 'TIMES') || block.getFieldValue('TIMES') || '10';
  const branch = Arduino.statementToCode(block, 'DO');
  return `  for (int _i=0; _i<(${repeats}); _i++) {\n${branch}  }\n`;
};
Arduino['controls_if'] = function(block) {
  let n = 0, code = '', cond, branch;
  do {
    cond = Arduino.valueToCode(block, 'IF' + n) || 'false';
    branch = Arduino.statementToCode(block, 'DO' + n);
    code += (n === 0 ? '  if' : '  else if') + ` (${cond}) {\n${branch}  }\n`;
    n++;
  } while (block.getInput('IF' + n));
  if (block.getInput('ELSE')) {
    branch = Arduino.statementToCode(block, 'ELSE');
    code += `  else {\n${branch}  }\n`;
  }
  return code;
};
Arduino['logic_compare'] = function(block) {
  const OPS = {EQ:'==',NEQ:'!=',LT:'<',LTE:'<=',GT:'>',GTE:'>='};
  const op = OPS[block.getFieldValue('OP')] || '==';
  const A = Arduino.valueToCode(block, 'A') || '0';
  const B = Arduino.valueToCode(block, 'B') || '0';
  return [`(${A} ${op} ${B})`, Arduino.ORDER_ATOMIC];
};
Arduino['logic_boolean'] = function(block) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', Arduino.ORDER_ATOMIC];
};
Arduino['math_number'] = function(block) {
  return [block.getFieldValue('NUM') || '0', Arduino.ORDER_ATOMIC];
};

window.Arduino = Arduino;
