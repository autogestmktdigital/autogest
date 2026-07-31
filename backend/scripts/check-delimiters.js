const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const templatesDir = path.join(__dirname, '../templates');

function checkDelimiters(name) {
  const templatePath = path.join(templatesDir, name);
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const docXml = zip.file('word/document.xml').asText();
  
  const hasDouble = docXml.includes('{{');
  const hasSingle = docXml.includes('{') && !docXml.includes('{{');
  
  console.log(`${name}:`);
  console.log(`  Duplas {{ }}: ${hasDouble ? 'SIM' : 'NÃO'}`);
  console.log(`  Simples { }: ${hasSingle ? 'SIM' : 'NÃO'}`);
  
  // Mostrar uma tag de exemplo
  const match = docXml.match(/\{\{?[^}]+\}\}?/);
  if (match) {
    console.log(`  Exemplo: ${match[0]}`);
  }
  console.log('');
}

checkDelimiters('contrato_venda.docx');
checkDelimiters('recibo_venda.docx');
checkDelimiters('termo_garantia.docx');
