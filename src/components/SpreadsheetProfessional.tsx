import { useState, useEffect } from 'react';
import { 
  X, Save, FileSpreadsheet, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, 
  HelpCircle, Settings, Calculator, Sparkles, Filter, Download, LayoutGrid, 
  TrendingUp, BarChart2, PieChart as PieIcon, RefreshCw, Layers, Sliders, CheckSquare 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

interface SpreadsheetProps {
  doc: {
    id?: number;
    title: string;
    content?: string; // Stored spreadsheet cell state or JSON package
    size?: string;
    folder?: string;
  };
  onSave: (updatedDoc: any) => void;
  onClose: () => void;
}

export default function SpreadsheetProfessional({ doc, onSave, onClose }: SpreadsheetProps) {
  // Multicolumn headers A..J
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  // Rows list
  const rowCount = 20;
  const rows = Array.from({ length: rowCount }, (_, i) => i + 1);

  // Cell state mapping: { 'A1': 'Item', 'B1': 'Qtd', 'C1': 'Preço', 'D1': 'Total', 'A2': 'SaaS Hub', 'B2': '12', 'C2': '150', 'D2': '=B2*C2' }
  const [cells, setCells] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<string>('A1');
  const [editValue, setEditValue] = useState<string>('');
  const [formulaBarInput, setFormulaBarInput] = useState<string>('');
  
  // Custom formulas evaluated mapping: { 'D2': '1800' }
  const [evaluatedCells, setEvaluatedCells] = useState<Record<string, string>>({});

  // Sorting/Filter column states
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);

  // Dynamic Chart Generation
  const [showChartCreator, setShowChartCreator] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [chartXRange, setChartXRange] = useState<string>('A2:A6'); // Categorias
  const [chartYRange, setChartYRange] = useState<string>('C2:C6'); // Valores
  const [liveChartData, setLiveChartData] = useState<any[]>([]);

  // Pivot Table Modal/State (Tabela Dinâmica)
  const [showPivotCreator, setShowPivotCreator] = useState(false);
  const [pivotRowField, setPivotRowField] = useState<string>('A'); // Column A (Category)
  const [pivotValField, setPivotValField] = useState<string>('C'); // Column C (Value)
  const [pivotData, setPivotData] = useState<any[]>([]);

  // Local notifications
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Initial Seed Data if document is empty
  useEffect(() => {
    let initialCells: Record<string, string> = {};
    if (doc.content && doc.content.startsWith('{')) {
      try {
        const parsed = JSON.parse(doc.content);
        if (parsed.cells) {
          initialCells = parsed.cells;
          if (parsed.chartXRange) setChartXRange(parsed.chartXRange);
          if (parsed.chartYRange) setChartYRange(parsed.chartYRange);
          if (parsed.chartType) setChartType(parsed.chartType);
        }
      } catch (e) {
        console.error('Failed to parse saved spreadsheet cells layout', e);
      }
    } else {
      // Create rich demo corporate data
      initialCells = {
        'A1': 'Serviços/Módulos', 'B1': 'Vendas (Qtd)', 'C1': 'Preço Unitário ($)', 'D1': 'Faturamento Esperado', 'E1': 'Margem Líquida',
        'A2': 'CRM Enterprise', 'B2': '155', 'C2': '450', 'D2': '=B2*C2', 'E2': '32%',
        'A3': 'Financeiro Automático', 'B3': '210', 'C3': '290', 'D3': '=B3*C3', 'E3': '24%',
        'A4': 'API Gateway Premium', 'B4': '94', 'C4': '600', 'D4': '=B4*C4', 'E4': '45%',
        'A5': 'IA Agente Integrado', 'B5': '340', 'C5': '199', 'D5': '=B5*C5', 'E5': '60%',
        'A6': 'Dashboard Executivo', 'B6': '125', 'C6': '350', 'D6': '=B6*C6', 'E6': '18%',
        'A8': 'Total Consolidado', 'B8': '=SOMA(B2:B6)', 'C8': '', 'D8': '=SOMA(D2:D6)', 'E8': '=MEDIA(E2:E6)'
      };
    }
    setCells(initialCells);
    recalculateAllCells(initialCells);
  }, [doc]);

  // Handle active cell changes
  useEffect(() => {
    const rawVal = cells[activeCell] || '';
    setEditValue(rawVal);
    setFormulaBarInput(rawVal);
  }, [activeCell, cells]);

  // Core formula parser engine
  const evaluateValue = (val: string, currentCells: Record<string, string>): string => {
    if (!val || typeof val !== 'string') return '';
    if (!val.startsWith('=')) return val;

    try {
      const formula = val.substring(1).toUpperCase().trim();

      // Helper function to resolve single cell value (e.g. "B2" -> 155)
      const resolveCell = (cName: string): number => {
        const raw = currentCells[cName] || '';
        if (raw.startsWith('=')) {
          return parseFloat(evaluateValue(raw, currentCells)) || 0;
        }
        return parseFloat(raw) || 0;
      };

      // Resolve cell ranges (e.g. "B2:B6" -> [155, 210, 94, 340, 125])
      const resolveRange = (rangeStr: string): number[] => {
        const parts = rangeStr.split(':');
        if (parts.length !== 2) return [];
        const start = parts[0];
        const end = parts[1];

        const startCol = start.charCodeAt(0);
        const startRow = parseInt(start.substring(1));
        const endCol = end.charCodeAt(0);
        const endRow = parseInt(end.substring(1));

        const values: number[] = [];
        for (let c = startCol; c <= endCol; c++) {
          for (let r = startRow; r <= endRow; r++) {
            const cellKey = `${String.fromCharCode(c)}${r}`;
            const rawVal = currentCells[cellKey] || '';
            const num = rawVal.startsWith('%') || rawVal.endsWith('%') 
              ? parseFloat(rawVal.replace('%', '')) / 100 
              : parseFloat(rawVal) || 0;
            values.push(num);
          }
        }
        return values;
      };

      // SUM Function: =SOMA(B2:B6) or =SUM(B2:B6)
      if (formula.startsWith('SOMA(') || formula.startsWith('SUM(')) {
        const inner = formula.substring(formula.indexOf('(') + 1, formula.lastIndexOf(')'));
        const rangeVals = resolveRange(inner);
        const sum = rangeVals.reduce((acc, curr) => acc + curr, 0);
        return String(sum.toFixed(2));
      }

      // AVERAGE Function: =MEDIA(B2:B6) or =AVERAGE(B2:B6)
      if (formula.startsWith('MEDIA(') || formula.startsWith('AVERAGE(')) {
        const inner = formula.substring(formula.indexOf('(') + 1, formula.lastIndexOf(')'));
        const rangeVals = resolveRange(inner);
        if (rangeVals.length === 0) return '0.00';
        const avg = rangeVals.reduce((acc, curr) => acc + curr, 0) / rangeVals.length;
        return String((avg * 100).toFixed(1)) + '%'; // formatted as percentage
      }

      // MULTIPLICATION cell * cell: =B2*C2
      if (formula.includes('*')) {
        const parts = formula.split('*');
        if (parts.length === 2) {
          const v1 = resolveCell(parts[0].trim());
          const v2 = resolveCell(parts[1].trim());
          return String((v1 * v2).toFixed(2));
        }
      }

      // DIVISION cell / cell: =B2/C2
      if (formula.includes('/')) {
        const parts = formula.split('/');
        if (parts.length === 2) {
          const v1 = resolveCell(parts[0].trim());
          const v2 = resolveCell(parts[1].trim());
          return v2 === 0 ? 'DIV#0!' : String((v1 / v2).toFixed(2));
        }
      }

      // General fallback math parser
      return 'CALC_ERROR';
    } catch (e) {
      return '#FORMULA!';
    }
  };

  const recalculateAllCells = (targetCells: Record<string, string>) => {
    const updatedEvaluated: Record<string, string> = {};
    Object.keys(targetCells).forEach(key => {
      const orig = targetCells[key];
      if (orig && orig.startsWith('=')) {
        updatedEvaluated[key] = evaluateValue(orig, targetCells);
      } else {
        updatedEvaluated[key] = orig;
      }
    });
    setEvaluatedCells(updatedEvaluated);
    updateLiveChart(targetCells, updatedEvaluated);
    updatePivotData(targetCells, updatedEvaluated);
  };

  const handleCellSaveInput = (val: string) => {
    const updated = { ...cells, [activeCell]: val };
    setCells(updated);
    recalculateAllCells(updated);
  };

  // Re-generate visual chart using dynamic selected ranges of row/cells
  const updateLiveChart = (curCells: Record<string, string>, curEvaluatedCells: Record<string, string>) => {
    try {
      const parseRange = (range: string): string[] => {
        const parts = range.split(':');
        if (parts.length !== 2) return [];
        const start = parts[0];
        const end = parts[1];
        const startCol = start.charCodeAt(0);
        const startRow = parseInt(start.substring(1));
        const endCol = end.charCodeAt(0);
        const endRow = parseInt(end.substring(1));
        
        const cellNames: string[] = [];
        for (let c = startCol; c <= endCol; c++) {
          for (let r = startRow; r <= endRow; r++) {
            cellNames.push(`${String.fromCharCode(c)}${r}`);
          }
        }
        return cellNames;
      };

      const xCells = parseRange(chartXRange);
      const yCells = parseRange(chartYRange);

      const count = Math.min(xCells.length, yCells.length);
      const data: any[] = [];
      for (let i = 0; i < count; i++) {
        const labelCell = xCells[i];
        const valCell = yCells[i];
        
        const label = curEvaluatedCells[labelCell] || curCells[labelCell] || `Linha ${i+1}`;
        const rawVal = curEvaluatedCells[valCell] || curCells[valCell] || '0';
        const numVal = parseFloat(rawVal.replace('%', '')) || 0;
        
        data.push({ name: label, valor: numVal, original: rawVal });
      }
      setLiveChartData(data);
    } catch (e) {
      console.warn('Cant generate live sheet chart', e);
    }
  };

  // Pivot Table Generation (Tabela Dinâmica)
  const updatePivotData = (curCells: Record<string, string>, curEvaluatedCells: Record<string, string>) => {
    const tableData: Record<string, number> = {};
    // Loop through row data 2 to 6 to sum aggregated categories
    for (let r = 2; r <= 6; r++) {
      const catVal = curEvaluatedCells[`${pivotRowField}${r}`] || curCells[`${pivotRowField}${r}`] || 'Outros';
      const measureRaw = curEvaluatedCells[`${pivotValField}${r}`] || curCells[`${pivotValField}${r}`] || '0';
      const measureNum = parseFloat(measureRaw.replace('%', '')) || 0;
      
      tableData[catVal] = (tableData[catVal] || 0) + measureNum;
    }

    const compiledList = Object.keys(tableData).map(key => ({
      categoria: key,
      total: parseFloat(tableData[key].toFixed(2))
    }));
    setPivotData(compiledList);
  };

  // Filter application helper
  const isRowFiltered = (rowNum: number): boolean => {
    // Check if any column filter excludes this row's values
    let filteredOut = false;
    Object.keys(filters).forEach(col => {
      const filterText = filters[col].toLowerCase();
      const cellKey = `${col}${rowNum}`;
      const cellVal = (evaluatedCells[cellKey] || cells[cellKey] || '').toLowerCase();
      if (filterText && !cellVal.includes(filterText)) {
        filteredOut = true;
      }
    });
    return filteredOut;
  };

  // CSV Exporter Action
  const exportToCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      for (let r = 1; r <= rowCount; r++) {
        const rowValues: string[] = [];
        columns.forEach(col => {
          const cellKey = `${col}${r}`;
          const val = evaluatedCells[cellKey] || cells[cellKey] || '';
          // wrap in quotes to escape commas
          rowValues.push(`"${val.replace(/"/g, '""')}"`);
        });
        csvContent += rowValues.join(",") + "\r\n";
      }
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${doc.title || 'Planilha_SaaS'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setAlertMsg("Não foi possível gerar download instantâneo de CSV na sandbox de iFrame.");
    }
  };

  const handleSaveSpreadsData = () => {
    const compiledOutput = {
      ...doc,
      content: JSON.stringify({ cells, chartXRange, chartYRange, chartType }),
      size: `${Math.round(JSON.stringify(cells).length / 100) / 10} KB`,
      folder: doc.folder || 'Comercial',
      updatedAt: new Date().toISOString()
    };
    onSave(compiledOutput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] text-slate-900 border border-[#DEE2E6]/60 w-full h-[95vh] sm:rounded-[28px] max-w-7xl shadow-2xl flex flex-col overflow-hidden relative text-left">
        
        {/* Top Header bar */}
        <header className="h-16 px-6 border-b border-[#DEE2E6]/60 flex items-center justify-between bg-[#FAFAFA] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate max-w-xs">{doc.title}</h3>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                Editor de Planilhas Profissional (Excel-SaaS Hibrido)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChartCreator(!showChartCreator)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showChartCreator ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-[#DEE2E6] bg-white hover:bg-neutral-50 text-neutral-600'
              }`}
            >
              <BarChart2 size={13} />
              <span>{showChartCreator ? 'Esconder Gráfico' : 'Exibir Gráficos'}</span>
            </button>

            <button
              onClick={() => setShowPivotCreator(!showPivotCreator)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showPivotCreator ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-[#DEE2E6] bg-white hover:bg-neutral-50 text-neutral-600'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Tabela Dinâmica</span>
            </button>

            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 border border-[#DEE2E6] bg-white hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Exportar CSV</span>
            </button>

            <div className="w-px h-6 bg-[#DEE2E6] mx-1"></div>

            <button 
              onClick={handleSaveSpreadsData}
              className="bg-[#111111] hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              Salvar Planilha
            </button>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg text-[#111111]"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        {/* Formula Bar Section */}
        <section className="h-10 px-4 bg-white border-b border-[#DEE2E6]/50 flex items-center gap-2 bg-neutral-50/50">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#64748B] bg-[#FAFAFA] px-2 py-1 border border-[#DEE2E6] rounded">
            <Calculator size={11} />
            <span className="font-mono">{activeCell}</span>
          </div>
          <span className="text-neutral-300 font-light">|</span>
          <span className="font-mono text-xs text-neutral-400 font-bold">fx</span>
          <input
            type="text"
            value={formulaBarInput}
            onChange={(e) => {
              setFormulaBarInput(e.target.value);
              setCells(prev => ({ ...prev, [activeCell]: e.target.value }));
            }}
            onBlur={() => recalculateAllCells(cells)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellSaveInput(formulaBarInput);
                e.currentTarget.blur();
              }
            }}
            placeholder="Digite valores ou formulas como =SOMA(B2:B6) ou =B2*C2"
            className="flex-1 bg-transparent px-2 py-1 text-xs outline-none font-mono text-slate-800 font-medium"
          />
        </section>

        {/* Feedback notices alert bar */}
        {alertMsg && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HelpCircle size={13} className="text-amber-600" />
              <span>{alertMsg}</span>
            </div>
            <button onClick={() => setAlertMsg(null)} className="text-amber-800 hover:text-black">X</button>
          </div>
        )}

        {/* Main interactive area: split into grid table and chart panel helper */}
        <div className="flex-grow flex overflow-hidden">
          
          {/* S1. Cell Grid Workspace Table */}
          <div className="flex-1 overflow-auto scrollbar-thin relative bg-white">
            <table className="w-full border-collapse text-left border-0 select-text">
              <thead>
                <tr className="bg-neutral-50 border-b border-[#DEE2E6]/60 sticky top-0 z-10">
                  {/* First corner index cell */}
                  <th className="w-10 bg-neutral-100 border-r border-[#DEE2E6] text-center p-1 font-mono text-[10px] text-neutral-500 sticky left-0 z-20"></th>
                  {columns.map(col => (
                    <th key={col} className="p-1.5 font-mono text-xs text-neutral-600 border-r border-[#DEE2E6] text-center min-w-[120px] relative">
                      <div className="flex items-center justify-center gap-1">
                        <span>{col}</span>
                        <button
                          onClick={() => setShowFilterDropdown(showFilterDropdown === col ? null : col)}
                          className="hover:bg-neutral-200 p-0.5 rounded text-neutral-400 hover:text-black shrink-0"
                        >
                          <Filter size={10} />
                        </button>
                      </div>

                      {/* Filter Modal Dropdown menu */}
                      {showFilterDropdown === col && (
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-white border border-[#DEE2E6] rounded-xl shadow-xl p-3 z-30 min-w-[200px] text-left">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Filtrar Coluna {col}</p>
                          <input
                            type="text"
                            value={filters[col] || ''}
                            onChange={(e) => {
                              const newFilters = { ...filters, [col]: e.target.value };
                              setFilters(newFilters);
                            }}
                            placeholder="Buscar termos..."
                            className="bg-[#FAFAFA] border border-[#DEE2E6] rounded-lg p-1.5 outline-none text-xs w-full mb-2 font-medium"
                          />
                          <div className="flex justify-between items-center mt-2.5">
                            <button
                              onClick={() => {
                                const copy = { ...filters };
                                delete copy[col];
                                setFilters(copy);
                                setShowFilterDropdown(null);
                              }}
                              className="text-[9px] font-bold text-neutral-400 hover:text-black uppercase"
                            >
                              Limpar
                            </button>
                            <button
                              onClick={() => setShowFilterDropdown(null)}
                              className="bg-neutral-900 text-white rounded px-2.5 py-1 text-[9px] font-bold uppercase transition"
                            >
                              Ok
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE2E6]/40">
                {rows.map(rowNum => {
                  if (Object.keys(filters).length > 0 && isRowFiltered(rowNum)) {
                    return null; // Row filtered out
                  }

                  return (
                    <tr key={rowNum} className="hover:bg-neutral-50/50 group">
                      {/* Row Left-Index number */}
                      <td className="bg-neutral-50 border-r border-[#DEE2E6] text-center font-mono text-[10px] text-neutral-400 p-1 font-bold sticky left-0 z-5 z-index-2">{rowNum}</td>
                      
                      {columns.map(col => {
                        const cellKey = `${col}${rowNum}`;
                        const raw = cells[cellKey] || '';
                        const evaluated = evaluatedCells[cellKey] || '';
                        const hasFormula = raw.startsWith('=');
                        const isSelectedStatus = activeCell === cellKey;

                        return (
                          <td
                            key={cellKey}
                            onClick={() => {
                              setActiveCell(cellKey);
                              setEditValue(cells[cellKey] || '');
                            }}
                            className={`p-1 border-r border-b border-[#DEE2E6]/40 min-w-[125px] transition-all relative ${
                              isSelectedStatus 
                                ? 'ring-2 ring-emerald-600/60 bg-emerald-50/15 z-5' 
                                : 'group-hover:bg-[#FAFAFA]'
                            }`}
                          >
                            {isSelectedStatus ? (
                              <input
                                type="text"
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellSaveInput(editValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellSaveInput(editValue);
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-full bg-white border border-emerald-400 outline-none px-1 py-0.5 rounded text-xs font-medium font-mono text-zinc-900"
                              />
                            ) : (
                              <div className="flex items-center justify-between min-h-[1.5rem] px-1 text-xs">
                                <span className={`font-medium ${hasFormula ? 'font-mono text-emerald-700 font-bold' : 'text-neutral-800'}`}>
                                  {evaluated || '\u00A0'}
                                </span>
                                {hasFormula && (
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 opacity-40 group-hover:opacity-100" title="Contém formula calculada" />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* S2. Visual Charts Right Overlay Panel */}
          {showChartCreator && (
            <div className="w-80 border-l border-[#DEE2E6]/70 bg-neutral-50/45 p-5 flex flex-col gap-6 overflow-y-auto animate-in slide-in-from-right duration-250 shrink-0">
              <div className="flex justify-between items-center border-b border-[#DEE2E6] pb-2">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-emerald-600" /> Painel de Gráficos
                </h4>
                <button onClick={() => setShowChartCreator(false)} className="text-neutral-400 hover:text-black">X</button>
              </div>

              <div className="flex flex-col gap-3 text-xs bg-white p-3 border border-[#DEE2E6] rounded-2xl shadow-xs">
                <p className="font-bold uppercase tracking-wider text-[10px] text-neutral-405">Configuração do Gráfico</p>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-neutral-600">Tipo de Gráfico</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'bar', label: 'Barras', icon: BarChart2 },
                      { id: 'line', label: 'Linhas', icon: RefreshCw },
                      { id: 'area', label: 'Área', icon: Sliders },
                      { id: 'pie', label: 'Pizza', icon: PieIcon },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setChartType(type.id as any)}
                        className={`p-1.5 border rounded-lg flex flex-col items-center gap-1 font-bold text-[9px] transition-all text-center ${
                          chartType === type.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-[#DEE2E6] text-neutral-500'
                        }`}
                      >
                        <type.icon size={11} />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="font-semibold text-neutral-600">Categoria (Células X)</label>
                  <input
                    type="text"
                    value={chartXRange}
                    onChange={(e) => setChartXRange(e.target.value)}
                    placeholder="Ex: A2:A6"
                    className="bg-[#FAFAFA] border border-[#DEE2E6] rounded-xl p-2 font-mono text-zinc-900 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-neutral-600">Valores (Células Y)</label>
                  <input
                    type="text"
                    value={chartYRange}
                    onChange={(e) => setChartYRange(e.target.value)}
                    placeholder="Ex: C2:C6"
                    className="bg-[#FAFAFA] border border-[#DEE2E6] rounded-xl p-2 font-mono text-zinc-900 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => updateLiveChart(cells, evaluatedCells)}
                  className="w-full bg-[#111111] hover:bg-neutral-900 text-white py-2 rounded-xl text-xs font-bold uppercase transition mt-1"
                >
                  Regerar Gráfico
                </button>
              </div>

              {/* RENDER GRAPHICS COMPONENT WITH RECHARTS */}
              <div className="flex-1 min-h-[225px] bg-white border border-[#DEE2E6] p-4 rounded-3xl flex flex-col justify-center items-center shadow-xs">
                {liveChartData.length > 0 ? (
                  <div className="w-full h-full min-h-[180px] text-[10px]">
                    <p className="font-bold text-center text-neutral-800 uppercase tracking-widest text-[9px] mb-2.5">
                      Indicadores de Desempenho
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                      {chartType === 'bar' ? (
                        <BarChart data={liveChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip wrapperStyle={{ fontFamily: 'Inter', fontSize: 10 }} />
                          <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : chartType === 'line' ? (
                        <LineChart data={liveChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip wrapperStyle={{ fontFamily: 'Inter', fontSize: 10 }} />
                          <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} activeDot={{ r: 4 }} />
                        </LineChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={liveChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip wrapperStyle={{ fontFamily: 'Inter', fontSize: 10 }} />
                          <Area type="monotone" dataKey="valor" stroke="#10b981" fill="#4ade80" />
                        </AreaChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={liveChartData}
                            dataKey="valor"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={50}
                            fill="#10b981"
                          >
                            {liveChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip wrapperStyle={{ fontFamily: 'Inter', fontSize: 10 }} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-neutral-400 text-center text-xs">Aguardando dados da série B2:B6...</p>
                )}
              </div>
            </div>
          )}

          {/* S3. Live Pivot Aggregator Creator Panel (Tabela Dinâmica) */}
          {showPivotCreator && (
            <div className="w-[300px] border-l border-[#DEE2E6]/70 bg-neutral-50 p-5 flex flex-col gap-6 overflow-y-auto animate-in slide-in-from-right duration-250 shrink-0">
              <div className="flex justify-between items-center border-b border-[#DEE2E6] pb-2">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5">
                  <LayoutGrid size={13} className="text-indigo-600" /> Tabela Dinâmica
                </h4>
                <button onClick={() => setShowPivotCreator(false)} className="text-neutral-400 hover:text-black">X</button>
              </div>

              <div className="flex flex-col gap-3 text-xs bg-white p-3 border border-[#DEE2E6] rounded-2xl shadow-xs">
                <p className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">Campos Organizadores</p>
                
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-600">Linha (Coluna Agrupadora)</label>
                  <select
                    value={pivotRowField}
                    onChange={(e) => setPivotRowField(e.target.value)}
                    className="bg-[#FAFAFA] border border-[#DEE2E6] p-2 rounded-xl"
                  >
                    <option value="A">Coluna A (Serviços/Módulos)</option>
                    <option value="B">Coluna B (Vendas / Qtd)</option>
                    <option value="E">Coluna E (Margem Líquida)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-600">Valores (Coluna de Medida)</label>
                  <select
                    value={pivotValField}
                    onChange={(e) => setPivotValField(e.target.value)}
                    className="bg-[#FAFAFA] border border-[#DEE2E6] p-2 rounded-xl"
                  >
                    <option value="B">Coluna B (Quantidade)</option>
                    <option value="C">Coluna C (Preço Unitário)</option>
                    <option value="D">Coluna D (Faturamento)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => updatePivotData(cells, evaluatedCells)}
                  className="w-full bg-[#111111] hover:bg-neutral-900 text-white py-2 rounded-xl text-xs font-bold uppercase transition mt-1"
                >
                  Atualizar Tabela
                </button>
              </div>

              {/* Aggregated Output table */}
              <div className="bg-white border border-[#DEE2E6] rounded-2xl p-4 shadow-sm flex-1 flex flex-col gap-3 text-left">
                <p className="font-bold uppercase text-[9px] tracking-widest text-[#64748B] border-b pb-1.5">Consolidação de Dados</p>
                
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-neutral-400 font-bold">
                        <th className="py-1 text-left">Linha</th>
                        <th className="py-1 text-right">Soma de Valores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-neutral-700 font-medium">
                      {pivotData.map((item, index) => (
                        <tr key={index}>
                          <td className="py-1.5 text-slate-800 font-semibold">{item.categoria}</td>
                          <td className="py-1.5 text-right font-mono font-bold text-emerald-700">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
