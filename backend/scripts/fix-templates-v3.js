const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

function fixDocxTags(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'binary');
  const zip = new PizZip(content);
  
  // Ler o document.xml
  let docXml = zip.file('word/document.xml').asText();
  
  // O Word divide o texto em múltiplos <w:t> tags dentro de <w:r> (runs)
  // Estratégia: juntar TODOS os <w:t> consecutivos em um único <w:t>
  // independente de estarem no mesmo parágrafo ou não
  
  // Primeiro, vamos processar cada <w:r> (run) individualmente
  // Se um <w:r> contém apenas <w:t> (sem <w:rPr> complexo), podemos juntar
  
  // Regex para encontrar runs que contêm apenas w:t
  const runRegex = /<w:r\b[^\u003e]*>([-\uffff]*?)<\/w:r>/g;
  
  // Estratégia mais simples: substituir todas as ocorrências de </w:t></w:r><w:r><w:t>
  // por nada, efetivamente juntando os textos
  
  let prevXml;
  let iterations = 0;
  const maxIterations = 100;
  
  do {
    prevXml = docXml;
    iterations++;
    
    // Padrão: </w:t></w:r><w:r><w:t> (com ou sem xml:space)
    // Isso junta textos consecutivos em runs diferentes
    docXml = docXml.replace(
      /<\/w:t><\/w:r><w:r\b[^\u003e]*>(?:<w:rPr>[-\uffff]*?<\/w:rPr>)?<w:t(?:\s+xml:space="preserve")?>/g,
      ''
    );
    
    // Também juntar quando há proofErr entre os runs
    docXml = docXml.replace(
      /<\/w:t><\/w:r><w:proofErr\s+w:type="[^"]+"\s*\/\u003e<w:r\b[^\u003e]*>(?:<w:rPr>[-\uffff]*?<\/w:rPr>)?<w:t(?:\s+xml:space="preserve")?>/g,
      ''
    );
    
  } while (docXml !== prevXml && iterations < maxIterations);
  
  console.log(`Iterações: ${iterations}`);
  
  // Verificar se ainda há tags quebradas
  const brokenTags = docXml.match(/\{\{[^}]*\}\}/g) || [];
  const problematicTags = brokenTags.filter(tag => 
    tag.includes('</w:t>') || tag.includes('<w:t>') || 
    tag.includes('<w:r>') || tag.includes('</w:r>') ||
    !tag.match(/^\{\{[^\u003c\u003e{}]+\}\}$/)
  );
  
  if (problematicTags.length > 0) {
    console.log('Ainda há tags problemáticas:');
    problematicTags.slice(0, 10).forEach(tag => console.log('  ' + tag.substring(0, 100)));
  } else {
    console.log('Todas as tags foram corrigidas!');
  }
  
  // Salvar o XML corrigido de volta no zip
  zip.file('word/document.xml', docXml);
  
  // Gerar o novo arquivo
  const newContent = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, newContent);
  
  console.log(`Template reparado: ${outputPath}`);
  console.log('');
}

// Reparar os 3 templates
const templatesDir = path.join(__dirname, '../templates');

fixDocxTags(
  path.join(templatesDir, 'contrato_venda.docx'),
  path.join(templatesDir, 'contrato_venda_fixed.docx')
);

fixDocxTags(
  path.join(templatesDir, 'recibo_venda.docx'),
  path.join(templatesDir, 'recibo_venda_fixed.docx')
);

fixDocxTags(
  path.join(templatesDir, 'termo_garantia.docx'),
  path.join(templatesDir, 'termo_garantia_fixed.docx')
);

console.log('Todos os templates foram processados!');
