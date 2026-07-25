import ModalContainer from './layout/ModalContainer.tsx';
import CompanyContent from './CompanyContent';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  company?: any;
}

export default function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
  if (!isOpen && !company) return null;

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth={company ? 'max-w-7xl' : 'max-w-xl'}>
      <CompanyContent company={company} onSuccess={onSuccess} onClose={onClose} />
    </ModalContainer>
  );
}
