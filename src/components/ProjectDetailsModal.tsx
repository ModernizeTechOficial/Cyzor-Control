import ModalContainer from './layout/ModalContainer.tsx';
import ProjectContent from './ProjectContent';

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (p: any) => void;
}

export default function ProjectDetailsModal({ project, isOpen, onClose, onSave }: ProjectDetailsModalProps) {
  if (!isOpen || !project) return null;

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl">
      <ProjectContent project={project} onSave={onSave} onClose={onClose} />
    </ModalContainer>
  );
}
