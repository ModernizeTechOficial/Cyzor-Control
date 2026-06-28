const fs = require('fs');
const files = [
  'src/components/CodeEditorProfessional.tsx',
  'src/components/settings/SecPerfilGeral.tsx',
  'src/components/settings/SecAdminModulos.tsx',
  'src/components/DocEditorModal.tsx',
  'src/components/ConfiguracoesView.tsx',
  'src/components/PdfViewerProfessional.tsx',
  'src/utils/projectMockData.ts',
  'src/context/AuthContext.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/PostgreSQL/g, 'SQLite')
                     .replace(/postgres/g, 'sqlite')
                     .replace(/Postgres/g, 'SQLite')
                     .replace(/Cloud SQL/g, 'Local Database');
    fs.writeFileSync(file, content);
  }
}
console.log('Replaced all DB terms in UI');
