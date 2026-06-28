import { DatabaseAST, ValidationResult } from '../types';

export const validateDatabaseSchema = (ast: DatabaseAST): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: []
  };

  // Check for Primary Keys
  ast.tables.forEach(table => {
    const hasPK = table.columns.some(col => col.isPrimary);
    if (!hasPK) {
      result.isValid = false;
      result.errors.push({
        target: table.name,
        message: `Tabela "${table.name}" deve ter pelo menos uma Primary Key.`,
        severity: 'error'
      });
    }

    // Check for duplicate columns
    const columnNames = new Set<string>();
    table.columns.forEach(col => {
      if (columnNames.has(col.name)) {
        result.isValid = false;
        result.errors.push({
          target: table.name,
          message: `Tabela "${table.name}" possui colunas duplicadas: "${col.name}".`,
          severity: 'error'
        });
      }
      columnNames.add(col.name);
    });
  });

  // Check Relations
  ast.relations.forEach(rel => {
    const fromTable = ast.tables.find(t => t.name === rel.fromTable);
    const toTable = ast.tables.find(t => t.name === rel.toTable);

    if (!fromTable) {
      result.isValid = false;
      result.errors.push({
        target: rel.id,
        message: `Relacionamento referencia tabela inexistente: "${rel.fromTable}".`,
        severity: 'error'
      });
    }

    if (!toTable) {
      result.isValid = false;
      result.errors.push({
        target: rel.id,
        message: `Relacionamento referencia tabela inexistente: "${rel.toTable}".`,
        severity: 'error'
      });
    }

    if (fromTable && !fromTable.columns.find(c => c.name === rel.fromColumn)) {
      result.isValid = false;
      result.errors.push({
        target: rel.id,
        message: `Coluna "${rel.fromColumn}" não encontrada na tabela "${rel.fromTable}".`,
        severity: 'error'
      });
    }

    if (toTable && !toTable.columns.find(c => c.name === rel.toColumn)) {
      result.isValid = false;
      result.errors.push({
        target: rel.id,
        message: `Coluna "${rel.toColumn}" não encontrada na tabela "${rel.toTable}".`,
        severity: 'error'
      });
    }
  });

  return result;
};
