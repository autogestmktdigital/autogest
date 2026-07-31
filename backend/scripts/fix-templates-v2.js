const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

function fixDocxTags(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'binary');
  const zip = new PizZip(content);
  
  // Ler o document.xml
  let docXml = zip.file('word/document.xml').asText();
  
  // O Word divide o texto em múltiplos <w:t> tags dentro de <w:r> (runs)
  // Precisamos juntar todos os <w:t> consecutivos dentro do mesmo parágrafo <w:p>
  
  // Estratégia: para cada parágrafo <w:p>, juntar todos os <w:t> em um único <w:t>
  // mantendo apenas um <w:r>
  
  // Regex para encontrar parágrafos
  const paragraphRegex = /<w:p\b[^>]*>([-\uffff]*?)<\/w:p>/g;
  
  docXml = docXml.replace(paragraphRegex, (match, paragraphContent) => {
    // Verificar se o parágrafo contém tags {{ ou }}
    if (!paragraphContent.includes('{{') && !paragraphContent.includes('}}')) {
      return match; // Não há tags, manter como está
    }
    
    // Extrair todos os textos dos <w:t>
    const textMatches = [...paragraphContent.matchAll(/<w:t(?:\s+xml:space="preserve")?>([-\uffff]*?)<\/w:t>/g)];
    
    if (textMatches.length <= 1) {
      return match; // Apenas um texto, não precisa juntar
    }
    
    // Juntar todos os textos
    const fullText = textMatches.map(m => m[1]).join('');
    
    // Verificar se há tags quebradas
    if (!fullText.includes('{{') && !fullText.includes('}}')) {
      return match; // Não há tags após juntar
    }
    
    // Criar um novo parágrafo com um único <w:r> e <w:t>
    // Preservar as propriedades do primeiro <w:r>
    const firstRunMatch = paragraphContent.match(/<w:r\b[^>]*>/);
    const firstRunStart = firstRunMatch ? firstRunMatch[0] : '<w:r>';
    
    // Preservar propriedades de execução (<w:rPr>) se existirem
    const rPrMatch = paragraphContent.match(/<w:rPr>[-\uffff]*?<\/w:rPr>/);
    const rPr = rPrMatch ? rPrMatch[0] : '';
    
    // Criar o novo parágrafo
    const newParagraph = `<w:p>${paragraphContent.match(/<w:pPr>[-\uffff]*?<\/w:pPr>/)?.[0] || ''}${firstRunStart}${rPr}<w:t xml:space="preserve">${fullText}</w:t></w:r></w:p>`;
    
    return newParagraph;
  });
  
  // Salvar o XML corrigido de volta no zip
  zip.file('word/document.xml', docXml);
  
  // Gerar o novo arquivo
  const newContent = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, newContent);
  
  console.log(`Template reparado: ${outputPath}`);
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

console.log('Todos os templates foram reparados!');
