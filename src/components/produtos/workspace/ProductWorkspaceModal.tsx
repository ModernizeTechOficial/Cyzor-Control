import ProductContent from './ProductContent';

interface ProductWorkspaceModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (p: any) => void;
  onDelete?: (id: any) => void;
  companies?: any[];
}

export default function ProductWorkspaceModal({ product, isOpen, onClose, onSave, onDelete, companies }: ProductWorkspaceModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FFFFFF] w-full h-full sm:h-[98vh] sm:w-[98vw] max-w-[1600px] sm:rounded-[32px] border border-[#0F172A0F] shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-[0.98] duration-300 relative">
        <ProductContent product={product} onSave={onSave} onDelete={onDelete} companies={companies} onClose={onClose} />
      </div>
    </div>
  );
}
