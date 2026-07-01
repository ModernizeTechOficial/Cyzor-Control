
export interface TourStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  order: number;
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    selector: 'body',
    title: 'Bem-vindo ao Cyzor Control',
    description: 'Estamos felizes em ter você aqui! Vamos fazer um tour rápido para você conhecer as principais funcionalidades da plataforma.',
    placement: 'center',
    order: 1
  },
  {
    id: 'sidebar',
    selector: '#sidebar-nav',
    title: 'Menu Lateral',
    description: 'Aqui você encontra todos os módulos do sistema, como Projetos, Financeiro, Clientes e Documentação.',
    placement: 'right',
    order: 2
  },
  {
    id: 'dashboard',
    selector: '#main-dashboard',
    title: 'Painel Geral',
    description: 'O Dashboard principal mostra suas métricas de desempenho, status de projetos e resumo financeiro em tempo real.',
    placement: 'center',
    order: 3
  },
  {
    id: 'notifications',
    selector: '#notifications-btn',
    title: 'Notificações',
    description: 'Fique por dentro de tudo! Alertas sobre prazos, novos comentários e eventos importantes aparecerão aqui.',
    placement: 'bottom',
    order: 4
  },
  {
    id: 'user-profile',
    selector: '#user-profile-btn',
    title: 'Perfil e Configurações',
    description: 'Aqui você pode gerenciar seu perfil, alterar sua senha e acessar as configurações da sua conta e workspace.',
    placement: 'left',
    order: 5
  },
  {
    id: 'help-center',
    selector: '#help-center-btn',
    title: 'Central de Ajuda',
    description: 'Precisa de suporte? Acesse nossa documentação completa ou entre em contato com nosso time.',
    placement: 'left',
    order: 6
  },
  {
    id: 'finish',
    selector: 'body',
    title: 'Tudo Pronto!',
    description: 'Agora você já conhece o básico. Sinta-se à vontade para explorar e começar a gerenciar seus negócios com o Cyzor.',
    placement: 'center',
    order: 7
  }
];
