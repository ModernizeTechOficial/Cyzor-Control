import { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { useBranding } from '../hooks/useBranding';
import MetricCard from './MetricCard';
import StandardHeader from './layout/StandardHeader';
import { AIActionDropdown } from './common/AIActionsComponent';
import FinanceEntryModal from './FinanceEntryModal';
import { useAuth } from '../context/AuthContext';
import { useFinance, useProjects, useCompanies } from '../hooks/useCyzorQueries';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, Server, Globe, Key, Database, MoreHorizontal, Edit3, Layers, ChevronRight, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#111111', '#475569', '#94A3B8', '#CBD5E1', '#E2E8F0'];

import { useNavigation } from "../context/NavigationContext";

export default function FinanceiroView() {
  const { globalFilters } = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'TODOS' | 'PAGAS' | 'DIVIDAS' | 'RECEBIDAS' | 'A_RECEBER'>('TODOS');

  const { data: financeData, isLoading: isFinanceLoading } = useFinance();
  const { data: projectsData } = useProjects();
  const { data: companiesData } = useCompanies();

  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => { if (financeData) setEntries(financeData); }, [financeData]);
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const { iconUrl, appName } = useBranding();
  
  const fetchData = async () => {
    if (!activeWorkspace) return;
    try {
      const [finRes, projRes] = await Promise.all([
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/projects')
      ]);
      if (finRes.ok) setEntries(await finRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspace]);

  const handleEditClick = (entry: any) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  // Derived calculations
  const {
    revenueMensal,
    revenueAnual,
    custoMensal,
    lucroEstimado,
    projetoRevenue,
    chartRevenueData,
    companyData,
    tableData,
    totalPago,
    totalAPagar,
    totalRecebido,
    totalAReceber,
    totalPagoMes,
    totalAPagarMes,
    totalRecebidoMes,
    totalAReceberMes
  } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let rMensal = 0;
    let rAnual = 0;
    let cMensal = 0;
    let pRevenue = 0;

    let tPago = 0;
    let tAPagar = 0;
    let tRecebido = 0;
    let tAReceber = 0;

    let tPagoMes = 0;
    let tAPagarMes = 0;
    let tRecebidoMes = 0;
    let tAReceberMes = 0;
    
    // Project budgets
    projects.forEach(p => {
      pRevenue += Number(p.budget || 0);
    });

    // Revenue array by month for chart (0-11)
    const monthlyRevenue = Array(12).fill(0);
    const companyRevenue: Record<string, number> = {};

    const filteredEntries = globalFilters.companyId 
      ? entries.filter((e: any) => e.companyId?.toString() === globalFilters.companyId?.toString())
      : entries;

    filteredEntries.forEach((e: any) => {
      const d = new Date(e.date || Date.now());
      const amount = Number(e.amount) || 0;
      const isPaid = e.status === 'PAGO';
      const isCurrentMonth = d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      
      if (e.type === 'RECEITA') {
        if (d.getFullYear() === currentYear) {
          rAnual += amount;
          monthlyRevenue[d.getMonth()] += amount;
        }
        if (isCurrentMonth) {
          rMensal += amount;
        }

        if (isPaid) {
          tRecebido += amount;
          if (isCurrentMonth) tRecebidoMes += amount;
        } else {
          tAReceber += amount;
          if (isCurrentMonth) tAReceberMes += amount;
        }
        
        // Group by company
        const comp = e.company || 'Outros';
        companyRevenue[comp] = (companyRevenue[comp] || 0) + amount;
      } else { // DESPESA
        if (isCurrentMonth) {
          cMensal += amount;
        }

        if (isPaid) {
          tPago += amount;
          if (isCurrentMonth) tPagoMes += amount;
        } else {
          tAPagar += amount;
          if (isCurrentMonth) tAPagarMes += amount;
        }
      }
    });

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const chartRev = monthNames.map((name, i) => ({
      name,
      value: monthlyRevenue[i]
    })).slice(0, currentMonth + 1); // Only show up to current month

    const compData = Object.entries(companyRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // Calculate percentages for company pie chart
    const totalCompanyRevenue = compData.reduce((acc, curr) => acc + curr.value, 0);
    const companyDataWithPercentage = compData.map(c => ({
      ...c,
      percentage: totalCompanyRevenue > 0 ? Math.round((c.value / totalCompanyRevenue) * 100) : 0
    }));

    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date || Date.now()).getTime() - new Date(a.date || Date.now()).getTime());

    return {
      revenueMensal: rMensal,
      revenueAnual: rAnual,
      custoMensal: cMensal,
      lucroEstimado: rMensal - cMensal,
      projetoRevenue: pRevenue,
      chartRevenueData: chartRev.length > 0 ? chartRev : [{ name: monthNames[currentMonth], value: 0 }],
      companyData: companyDataWithPercentage,
      tableData: sortedEntries,
      totalPago: tPago,
      totalAPagar: tAPagar,
      totalRecebido: tRecebido,
      totalAReceber: tAReceber,
      totalPagoMes: tPagoMes,
      totalAPagarMes: tAPagarMes,
      totalRecebidoMes: tRecebidoMes,
      totalAReceberMes: tAReceberMes
    };
  }, [entries, projects, globalFilters.companyId]);

  const filteredByTab = useMemo(() => {
    switch (activeTab) {
      case 'PAGAS':
        return tableData.filter((e: any) => e.type === 'DESPESA' && e.status === 'PAGO');
      case 'DIVIDAS':
        return tableData.filter((e: any) => e.type === 'DESPESA' && e.status !== 'PAGO');
      case 'RECEBIDAS':
        return tableData.filter((e: any) => e.type === 'RECEITA' && e.status === 'PAGO');
      case 'A_RECEBER':
        return tableData.filter((e: any) => e.type === 'RECEITA' && e.status !== 'PAGO');
      default:
        return tableData;
    }
  }, [tableData, activeTab]);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const printTableHeader = (doc: jsPDF, currentY: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // #64748B
    
    doc.text("DATA", 20, currentY);
    doc.text("DESCRIÇÃO", 40, currentY);
    doc.text("CATEGORIA", 100, currentY);
    doc.text("EMPRESA", 135, currentY);
    doc.text("VALOR", 170, currentY, { align: "right" });
    doc.text("STATUS", 190, currentY, { align: "right" });
    
    doc.setDrawColor(226, 232, 240); // #E2E8F0
    doc.setLineWidth(0.4);
    doc.line(20, currentY + 2.5, 190, currentY + 2.5);
    return currentY + 7.5;
  };

  const getBase64Image = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = imgUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error('Canvas context is null'));
        }
      };
      img.onerror = (e) => reject(e);
    });
  };

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const now = new Date();
      const formattedDate = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Brand Icon / Logo & Title Shift
      let titleX = 20;
      let hasCustomImage = false;

      if (iconUrl) {
        try {
          const base64Img = await getBase64Image(iconUrl);
          doc.addImage(base64Img, 'PNG', 20, 18, 11, 11);
          hasCustomImage = true;
          titleX = 35; // Shift title text to right to balance layout
        } catch (e) {
          console.warn("Failed to load branding iconUrl, falling back to vector logo", e);
        }
      }

      if (!hasCustomImage) {
        // Draw elegant vector branding placeholder
        // Rounded dark card
        doc.setFillColor(17, 17, 17); // #111111
        doc.roundedRect(20, 18, 11, 11, 2.5, 2.5, "F");
        
        // Left accent bar inside logo
        doc.setFillColor(59, 130, 246); // Blue accent dot/bar #3B82F6
        doc.rect(20.5, 18.5, 1.2, 1.2, "F");

        // Dynamic first letter of appName
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const letter = (appName || "C").charAt(0).toUpperCase();
        doc.text(letter, 25.5, 26, { align: "center" });

        titleX = 35; // Shift title text to right to balance layout
      }

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17); // #111111
      doc.text((appName || "CYZOR CONTROL").toUpperCase(), titleX, 25);

      // Report Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // #64748B
      doc.text("Relatório de Saúde Financeira & Transações", titleX, 29.5);

      // Workspace Info & Date
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // #94A3B8
      doc.text(`Workspace: ${activeWorkspace?.name || 'Geral'}`, 190, 25, { align: 'right' });
      doc.text(`Gerado em: ${formattedDate}`, 190, 30, { align: 'right' });

      // Divider Line
      doc.setDrawColor(241, 245, 249); // #F1F5F9
      doc.setLineWidth(0.8);
      doc.line(20, 37, 190, 37);

      // KPI Section Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 17); // #111111
      doc.text("Resumo de Indicadores", 20, 48);

      // Render custom KPI Grid
      const kpis = [
        { label: "RECEITA MENSAL", val: formatCurrency(revenueMensal), color: [16, 185, 129] }, // emerald
        { label: "RECEITA ANUAL", val: formatCurrency(revenueAnual), color: [79, 70, 229] }, // indigo
        { label: "CUSTOS MENSAIS", val: formatCurrency(custoMensal), color: [225, 29, 72] }, // rose
        { label: "LUCRO LÍQUIDO", val: formatCurrency(lucroEstimado), color: [37, 99, 235] }, // blue
        { label: "PIPELINE PROJ.", val: formatCurrency(projetoRevenue), color: [71, 85, 105] } // slate
      ];

      let xOffset = 20;
      kpis.forEach((kpi) => {
        // Draw card background
        doc.setFillColor(250, 250, 251); // #FAFAFB
        doc.roundedRect(xOffset, 53, 31, 18, 3, 3, "F");

        // Top border accent
        doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.rect(xOffset, 53, 31, 1.5, "F");

        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139); // #64748B
        doc.text(kpi.label, xOffset + 2, 59);

        // Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(17, 17, 17); // #111111
        const valText = kpi.val.replace("R$ ", "");
        doc.text(`R$ ${valText}`, xOffset + 2, 66);

        xOffset += 35;
      });

      // Transaction Section Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 17); // #111111
      doc.text("Últimas Transações", 20, 85);

      // Table Header Setup
      let currentY = 92;
      currentY = printTableHeader(doc, currentY);

      // Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      
      tableData.forEach((row, index) => {
        // Check if page overflow
        if (currentY > 270) {
          doc.addPage();
          // Print page header on new page
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(17, 17, 17);
          doc.text("CYZOR CONTROL - Relatório de Transações (Cont.)", 20, 20);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Página ${doc.getNumberOfPages()}`, 190, 20, { align: 'right' });
          
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.5);
          doc.line(20, 23, 190, 23);

          currentY = printTableHeader(doc, 28);
        }

        const isPositive = row.type === 'RECEITA';
        const dateStr = new Date(row.date || Date.now()).toLocaleDateString('pt-BR');
        const descStr = row.description || '-';
        const categoryStr = row.category || 'Geral';
        const companyStr = row.company || '-';
        const amountStr = (isPositive ? '+ ' : '- ') + formatCurrency(Number(row.amount));

        // Background alternate row color
        if (index % 2 === 0) {
          doc.setFillColor(252, 252, 253); // #FCFCFD
          doc.rect(20, currentY - 5.5, 170, 7.5, "F");
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(17, 17, 17);
        doc.text(dateStr, 20, currentY);

        doc.setFont("helvetica", "normal");
        doc.text(descStr.length > 28 ? descStr.substring(0, 26) + "..." : descStr, 40, currentY);
        doc.text(categoryStr.length > 15 ? categoryStr.substring(0, 13) + "..." : categoryStr, 100, currentY);
        doc.text(companyStr.length > 18 ? companyStr.substring(0, 16) + "..." : companyStr, 135, currentY);

        // Valor
        doc.setFont("helvetica", "bold");
        if (isPositive) {
          doc.setTextColor(16, 185, 129); // Green
        } else {
          doc.setTextColor(225, 29, 72); // Rose
        }
        doc.text(amountStr, 170, currentY, { align: "right" });

        // Status
        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 185, 129);
        doc.text("Liquidado", 190, currentY, { align: "right" });

        currentY += 7.5;
      });

      // Footer signature
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // #94A3B8
      doc.text("Cyzor Control - Gestão Corporativa Avançada de Alta Performance", 105, 288, { align: 'center' });

      doc.save(`relatorio_financeiro_${activeWorkspace?.name?.toLowerCase().replace(/\s+/g, '_') || 'workspace'}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
      alert("Houve um erro ao gerar o relatório em PDF. Por favor, tente novamente.");
    }
  };

    return (
      <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative text-left px-4 sm:px-6 lg:px-10">
        <StandardHeader 
          title="Financeiro"
          subtitle="Saúde financeira, receitas e custos de infraestrutura do ecossistema."
          actions={[
            {
              label: 'Exportar',
              onClick: handleExportPDF,
              variant: 'secondary'
            },
            {
              label: 'Novo Lançamento',
              icon: Plus,
              onClick: () => setIsModalOpen(true),
              variant: 'primary'
            }
          ]}
        >
          <AIActionDropdown entityId="finance" actions={['createFinancialPlan']} />
        </StandardHeader>
      
      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <MetricCard 
          title="Receita Mensal" 
          value={formatCurrency(revenueMensal)} 
          sub="Lançamentos pagos" 
          icon={DollarSign} 
          trend="+12%" 
          trendUp={true}
          bg="bg-emerald-50/50"
          color="text-emerald-600"
        />
        <MetricCard 
          title="Receita Anual" 
          value={formatCurrency(revenueAnual)} 
          sub={`Ano Atual (${new Date().getFullYear()})`} 
          icon={TrendingUp} 
          trend="+8%" 
          trendUp={true}
          bg="bg-indigo-50/50"
          color="text-indigo-600"
        />
        <MetricCard 
          title="Custos Mensais" 
          value={formatCurrency(custoMensal)} 
          sub="Infraestrutura, APIs, etc." 
          icon={CreditCard} 
          trend="-2%" 
          trendUp={false}
          bg="bg-rose-50/50"
          color="text-rose-600"
        />
        <MetricCard 
          title="Pipeline Projetos" 
          value={formatCurrency(projetoRevenue)} 
          sub="Receita em andamento" 
          icon={Layers} 
          bg="bg-slate-100/60"
          color="text-slate-600"
        />
        <MetricCard 
          title="Lucro Líquido" 
          value={formatCurrency(lucroEstimado)} 
          sub="Mês atual" 
          icon={ArrowUpRight} 
          trend="+15%" 
          trendUp={true}
          bg="bg-blue-50/50"
          color="text-blue-600"
        />
      </section>

      {/* Detailed Cash Flow and Debt Ledger */}
      <section className="bg-slate-950 text-white rounded-[32px] p-6 sm:p-8 border border-slate-900 shadow-xl flex flex-col gap-6 relative overflow-hidden">
        {/* Subtle decorative mesh or radial highlight in the background */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Fluxo de Caixa Geral</h3>
            <p className="text-xs text-slate-400 mt-1">Visão completa de ativos realizados, compromissos financeiros e passivos acumulados.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Modo:</span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">Realizado + Previsto</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* Card 1: Recebido */}
          <div className="bg-slate-900/60 border border-slate-800/40 rounded-2xl p-5 flex flex-col gap-2 hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Receitas Realizadas</span>
              <span className="text-[10px] bg-indigo-950 border border-indigo-900 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full">Recebido</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight mt-1">{formatCurrency(totalRecebido)}</div>
            <div className="text-[10px] text-indigo-400 flex items-center gap-1">
              <span>{formatCurrency(totalRecebidoMes)} realizado este mês</span>
            </div>
          </div>

          {/* Card 2: Receitas a Receber */}
          <div className="bg-slate-900/60 border border-slate-800/40 rounded-2xl p-5 flex flex-col gap-2 hover:border-slate-700 transition-all duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">A Receber</span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2.5 py-0.5 rounded-full">Aberto</span>
            </div>
            <div className="text-2xl font-bold text-slate-200 tracking-tight mt-1">{formatCurrency(totalAReceber)}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{formatCurrency(totalAReceberMes)} previsto este mês</span>
            </div>
          </div>

          {/* Card 3: Despesas Quitadas */}
          <div className="bg-slate-900/60 border border-slate-800/40 rounded-2xl p-5 flex flex-col gap-2 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Contas Pagas</span>
              <span className="text-[10px] bg-emerald-950 border border-emerald-900 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">Quitado</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight mt-1">{formatCurrency(totalPago)}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span>{formatCurrency(totalPagoMes)} liquidado este mês</span>
            </div>
          </div>

          {/* Card 4: Dívidas / Contas a Pagar */}
          <div className="bg-slate-900/60 border border-slate-800/40 rounded-2xl p-5 flex flex-col gap-2 hover:border-rose-500/30 transition-all duration-300 relative group">
            {/* Soft pulse effect for debts card to draw professional attention */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full m-5 opacity-40" />
            
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Dívidas / Falta Pagar</span>
              <span className="text-[10px] bg-rose-950 border border-rose-900 text-rose-300 font-bold px-2.5 py-0.5 rounded-full">A Pagar</span>
            </div>
            <div className="text-2xl font-bold text-rose-400 tracking-tight mt-1">{formatCurrency(totalAPagar)}</div>
            <div className="text-[10px] text-rose-400/90 flex items-center gap-1 font-medium">
              <span>{formatCurrency(totalAPagarMes)} com vencimento no mês</span>
            </div>
          </div>

        </div>

        {/* Realized Cash Flow Balance footer row */}
        <div className="border-t border-slate-800 pt-5 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Saldo de Caixa Líquido (Realizado):</span>
              <span className={`ml-2 text-sm font-bold ${(totalRecebido - totalPago) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(totalRecebido - totalPago)}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Projeção Total (Previsto):</span>
              <span className={`ml-2 text-sm font-bold ${((totalRecebido + totalAReceber) - (totalPago + totalAPagar)) >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                {formatCurrency((totalRecebido + totalAReceber) - (totalPago + totalAPagar))}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            Dica: Lançamentos do fluxo de caixa podem ser gerenciados e filtrados na tabela de transações abaixo.
          </div>
        </div>
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Receita por Mês - Chart */}
        <div className="xl:col-span-2 bg-white rounded-[24px] border border-[#0F172A08] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-widest">Fluxo de Caixa (Receita Mês a Mês)</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <RechartsTooltip 
                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #0F172A0F', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Area type="monotone" dataKey="value" stroke="#111111" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Empresa - Chart */}
        <div className="bg-white rounded-[24px] border border-[#0F172A08] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-widest">Receitas por Empresa</h3>
          {companyData.length > 0 ? (
            <>
              <div className="h-[250px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={companyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {companyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #0F172A0F', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }} 
                      formatter={(value: any) => formatCurrency(Number(value))} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#111111]">100%</span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Total</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-auto">
                {companyData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-xs group cursor-default">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-bold text-[#475569] group-hover:text-[#111111] transition-colors">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#111111]">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs font-medium text-[#64748B]">Nenhuma receita registrada.</div>
          )}
        </div>
      </section>

      {/* Transactions Table */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold text-[#111111] flex items-center gap-2">
              <CreditCard size={20} className="text-[#111111]" /> Lançamentos e Movimentações
            </h2>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-slate-50 border border-[#0F172A08] px-3 py-1 rounded-full">
              {filteredByTab.length} registros
            </span>
          </div>
          
          {/* Interactive filter tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 max-w-full">
            <button
              onClick={() => setActiveTab('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === 'TODOS' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('PAGAS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === 'PAGAS' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Contas Pagas
            </button>
            <button
              onClick={() => setActiveTab('DIVIDAS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === 'DIVIDAS' ? 'bg-white text-rose-700 shadow-sm border border-rose-100' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Dívidas / A Pagar
            </button>
            <button
              onClick={() => setActiveTab('RECEBIDAS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === 'RECEBIDAS' ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Receitas Recebidas
            </button>
            <button
              onClick={() => setActiveTab('A_RECEBER')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === 'A_RECEBER' ? 'bg-white text-slate-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Receitas a Receber
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-[#0F172A08] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#0F172A08]">
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest whitespace-nowrap">Data / Vencimento</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Descrição</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Categoria</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Empresa</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest text-right">Valor</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F172A05]">
                {filteredByTab.length > 0 ? filteredByTab.map((row) => {
                  const isPositive = row.type === 'RECEITA';
                  return (
                    <tr 
                      key={row.id} 
                      className="group hover:bg-[#FAFAFA] transition-all cursor-pointer"
                      onClick={() => handleEditClick(row)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#111111]">
                            {new Date(row.date || Date.now()).toLocaleDateString('pt-BR')}
                          </span>
                          {row.status === 'PAGO' ? (
                            <span className="text-[10px] text-emerald-600 font-bold tracking-tight mt-0.5">
                              Pago em: {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('pt-BR') : new Date(row.date || Date.now()).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${row.status === 'ATRASADO' ? 'text-rose-500' : 'text-slate-500'}`}>
                              Vence: {row.dueDate ? new Date(row.dueDate).toLocaleDateString('pt-BR') : '-'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border border-[#0F172A05] ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          </div>
                          <span className="text-xs font-bold text-[#111111] truncate max-w-[200px]">{row.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-slate-50 border border-[#0F172A08] px-2.5 py-1 rounded-lg">
                          {row.category || 'Geral'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-[#475569]">{row.company || '-'}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`text-sm font-bold tracking-tight ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : '-'} {formatCurrency(Number(row.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {row.status === 'PAGO' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border border-emerald-200">
                            Pago
                          </span>
                        ) : row.status === 'ATRASADO' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border border-rose-200">
                            Atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border border-amber-200">
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-xs font-bold text-[#64748B] uppercase tracking-widest">
                      Nenhum lançamento encontrado para esta categoria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FinanceEntryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEntry(null); }} 
        onSuccess={fetchData} 
        entry={editingEntry}
      />
    </div>
  );
}

function ExpenseCard({ title, value, sub, icon: Icon }: { title: string, value: string, sub: string, icon: any }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 flex flex-col items-center justify-center text-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#64748B] mb-2">
        <Icon size={20} />
      </div>
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{title}</h4>
      <span className="text-2xl font-bold text-[#111111]">{value}</span>
      <span className="text-xs text-[#94A3B8] font-medium">{sub}</span>
    </div>
  );
}
