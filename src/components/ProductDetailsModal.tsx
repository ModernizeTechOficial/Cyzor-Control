import ProductWorkspaceModal from './produtos/workspace/ProductWorkspaceModal';

export default function ProductDetailsModal({ 
  product, 
  isOpen, 
  onClose,
  onSave,
  onDelete,
  companies = []
}: { 
  product: any, 
  isOpen: boolean, 
  onClose: () => void,
  onSave?: (p: any) => void,
  onDelete?: (id: any) => void,
  companies?: any[]
}) {
  return (
    <ProductWorkspaceModal 
      product={product}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      companies={companies}
    />
  );
}
