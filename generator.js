// Generador C++ simple para Arduino
const Arduino = new Blockly.Generator('Arduino');

Arduino.addReservedWords('setup,loop,if,while,for,int,float,boolean,digitalWrite,digitalRead,analogRead,pinMode,delay,OUTPUT,INPUT');

Arduino.init = function(workspace) {
  Arduino.setups_ = Object.create(null);
};

Arduino.finish = function(code) {
  const setupLines = Object.values(Arduino.setups_).join('');
  return `#include <Arduino.h>

void setup() {
${setupLines}}

void loop() {
${code}}
`;
};

Arduino.scrub_ = function(block, code) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = Arduino.blockToCode(nextBlock);
  return code + nextCode;
};

Arduino['digital_write_pin'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  Arduino.setups_['pin_'+pin+'_out'] = `  pinMode(${pin}, OUTPUT);\n`;
  return `  digitalWrite(${pin}, ${state});\n`;
};

Arduino['delay_ms'] = function(block) {
  const t = block.getFieldValue('MS');
  return `  delay(${t});\n`;
};

Arduino['analog_read_pin'] = function(block) {
  const apin = block.getFieldValue('APIN');
  const code = `analogRead(${apin})`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

window.Arduino = Arduino;
