// Bloques mínimos
if (!window.Blockly) { alert('Blockly not loaded'); }

Blockly.Blocks['digital_write_pin'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("escribir pin")
      .appendField(new Blockly.FieldNumber(13, 0, 100, 1), "PIN")
      .appendField("a")
      .appendField(new Blockly.FieldDropdown([["ALTO","HIGH"],["BAJO","LOW"]]), "STATE");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(180);
  }
};

Blockly.Blocks['delay_ms'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("esperar (ms)")
      .appendField(new Blockly.FieldNumber(1000, 0, 600000, 10), "MS");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(180);
  }
};

Blockly.Blocks['analog_read_pin'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("leer analógico")
      .appendField(new Blockly.FieldDropdown([["A0","A0"],["A1","A1"],["A2","A2"],["A3","A3"]]), "APIN");
    this.setOutput(true, "Number");
    this.setColour(210);
  }
};
