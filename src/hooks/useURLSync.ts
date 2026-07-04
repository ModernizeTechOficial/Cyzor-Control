import { useEffect, useRef } from 'react';
import { View } from '../types';

export function useURLSync(
  currentView: View | string,
  setCurrentView: (view: any) => void,
  globalFilters: any,
  setGlobalFilters: (filters: any) => void
) {
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isUpdatingRef.current = true;
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      
      let view: any = 'landing';
      let filters: any = {};

      if (parts.length === 0) {
        view = 'landing';
      } else if (parts[0] === 'login') {
        view = 'login';
      } else if (parts[0] === 'workspace') {
        view = 'dashboard';
        
        if (parts[1] === 'company' && parts[2]) {
          filters.companyId = parts[2];
          
          if (parts[3] === 'projects') view = 'projetos';
          else if (parts[3] === 'project' && parts[4]) { view = 'projetos'; filters.projectId = parts[4]; }
          else if (parts[3] === 'products') view = 'produtos';
          else if (parts[3] === 'product' && parts[4]) { view = 'produtos'; filters.productId = parts[4]; }
          else if (parts[3] === 'clients') view = 'clientes';
          else if (parts[3] === 'client' && parts[4]) { view = 'clientes'; filters.clientId = parts[4]; }
          else if (parts[3] === 'finance') view = 'financeiro';
          else if (parts[3] === 'docs') view = 'documentacao';
          else if (parts[3] === 'doc' && parts[4]) { view = 'documentacao'; filters.documentId = parts[4]; }
          else if (parts[3] === 'ideas') view = 'ideias';
          else if (parts[3] === 'idea' && parts[4]) { view = 'ideias'; filters.ideaId = parts[4]; }
          else view = 'empresas'; // Company 360
        } else if (parts[1]) {
          const viewMap: any = {
            'projects': 'projetos',
            'products': 'produtos',
            'clients': 'clientes',
            'finance': 'financeiro',
            'docs': 'documentacao',
            'team': 'equipe',
            'ideas': 'ideias',
            'ai': 'ia',
            'settings': 'configuracoes'
          };
          view = viewMap[parts[1]] || parts[1];
        }
      } else {
        view = parts[0];
      }

      setCurrentView(view);
      setGlobalFilters(filters);
      setTimeout(() => { isUpdatingRef.current = false; }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial load
    if (window.location.pathname !== '/' && window.location.pathname !== '/workspace') {
       handlePopState();
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentView, setGlobalFilters]);

  // Push state on changes
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    let url = '/';
    
    if (currentView === 'landing' || currentView === 'login' || currentView === 'privacy' || currentView === 'terms') {
      url = `/${currentView === 'landing' ? '' : currentView}`;
    } else if (currentView.startsWith('admin')) {
      url = `/${currentView}`;
    } else {
      url = '/workspace';
      
      const hasCompany = !!globalFilters.companyId;
      if (hasCompany) {
        url += `/company/${globalFilters.companyId}`;
        
        if (currentView === 'projetos') {
          if (globalFilters.projectId) url += `/project/${globalFilters.projectId}`;
          else url += `/projects`;
        } else if (currentView === 'produtos') {
          if (globalFilters.productId) url += `/product/${globalFilters.productId}`;
          else url += `/products`;
        } else if (currentView === 'clientes') {
          if (globalFilters.clientId) url += `/client/${globalFilters.clientId}`;
          else url += `/clients`;
        } else if (currentView === 'financeiro') {
          url += `/finance`;
        } else if (currentView === 'documentacao') {
          if (globalFilters.documentId) url += `/doc/${globalFilters.documentId}`;
          else url += `/docs`;
        } else if (currentView === 'ideias') {
          if (globalFilters.ideaId) url += `/idea/${globalFilters.ideaId}`;
          else url += `/ideas`;
        } else if (currentView !== 'empresas') {
          // If in company context but view is not explicitly mapped above
          const reverseMap: any = {
            'equipe': 'team',
            'ideias': 'ideas',
            'ia': 'ai',
            'configuracoes': 'settings'
          };
          if (reverseMap[currentView]) url += `/${reverseMap[currentView]}`;
          else url += `/${currentView}`;
        }
      } else {
         if (currentView !== 'dashboard') {
            const reverseMap: any = {
              'projetos': 'projects',
              'produtos': 'products',
              'clientes': 'clients',
              'financeiro': 'finance',
              'documentacao': 'docs',
              'equipe': 'team',
              'ideias': 'ideas',
              'ia': 'ai',
              'configuracoes': 'settings',
              'empresas': 'companies'
            };
            url += `/${reverseMap[currentView] || currentView}`;
         }
      }
    }
    
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
  }, [currentView, globalFilters]);
}
