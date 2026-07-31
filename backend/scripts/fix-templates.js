const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

function fixDocxTags(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'binary');
  const zip = new PizZip(content);
  
  // Ler o document.xml
  const docXml = zip.file('word/document.xml').asText();
  
  // O problema é que o Word divide o texto em múltiplos <w:t> tags
  // Precisamos juntar os textos que estão entre {{ e }}
  
  // Estratégia: encontrar todas as ocorrências de {{...}} que estão divididas
  // e juntá-las em um único <w:t>
  
  let fixedXml = docXml;
  
  // Padrão para encontrar tags quebradas: {{ seguido de qualquer coisa até }}
  // Mas como elas podem estar em múltiplos <w:t>, precisamos de uma abordagem diferente
  
  // Abordagem simples: substituir padrões comuns quebrados
  const replacements = [
    // Nome do Cliente
    { broken: /\{\{Nome\}\}/g, fixed: '{{Nome do Cliente}}' },
    
    // CPF
    { broken: /\{\{CPF\}/g, fixed: '{{CPF}}' },
    { broken: /\{CPF\}\}/g, fixed: '{{CPF}}' },
    
    // Rua/Av
    { broken: /\{\{Rua\/\}/g, fixed: '{{Rua/Av}}' },
    { broken: /\{\{Rua\}\}/g, fixed: '{{Rua/Av}}' },
    
    // Número
    { broken: /\{\{Núme\}/g, fixed: '{{Número}}' },
    { broken: /\{mero\}\}/g, fixed: '{{Número}}' },
    
    // Bairro
    { broken: /\{\{Bair\}/g, fixed: '{{Bairro}}' },
    { broken: /\{irro\}\}/g, fixed: '{{Bairro}}' },
    
    // Cidade
    { broken: /\{\{Cida\}/g, fixed: '{{Cidade}}' },
    { broken: /\{dade\}\}/g, fixed: '{{Cidade}}' },
    
    // Estado
    { broken: /\{\{Esta\}/g, fixed: '{{Estado}}' },
    { broken: /\{ado\}\}/g, fixed: '{{Estado}}' },
    
    // CEP
    { broken: /\{\{Cep\}\}/g, fixed: '{{Cep}}' },
    { broken: /\{\{CEP\}\}/g, fixed: '{{Cep}}' },
  ];
  
  replacements.forEach(({ broken, fixed }) => {
    fixedXml = fixedXml.replace(broken, fixed);
  });
  
  // Salvar o XML corrigido de volta no zip
  zip.file('word/document.xml', fixedXml);
  
  // Gerar o novo arquivo
  const newContent = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, newContent);
  
  console.log(`Template reparado: ${outputPath}`);
}

// Reparar os 3 templates
const templatesDir = path.join(__dirname, '../templates');

fixDocxTags(
  path.join(templatesDir, 'contrato_venda.docx'),
  path.join(templatesDir, 'contrato_venda.docx')
);

fixDocxTags(
  path.join(templatesDir, 'recibo_venda.docx'),
  path.join(templatesDir, 'recibo_venda.docx')
);

fixDocxTags(
  path.join(templatesDir, 'termo_garantia.docx'),
  path.join(templatesDir, 'termo_garantia.docx')
);

console.log('Todos os templates foram reparados!');
