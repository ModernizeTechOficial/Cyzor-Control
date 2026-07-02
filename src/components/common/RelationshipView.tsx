import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  sourceType: string;
  sourceId: number;
}

export const RelationshipView: React.FC<Props> = ({ sourceType, sourceId }) => {
  const { fetchWithAuth } = useAuth();
  const [relationships, setRelationships] = useState<any[]>([]);

  useEffect(() => {
    fetchRelationships();
  }, [sourceType, sourceId]);

  const fetchRelationships = async () => {
    try {
      const res = await fetchWithAuth(`/api/relationships/${sourceType}/${sourceId}`);
      if (res.ok) {
        const data = await res.json();
        setRelationships(data);
      }
    } catch (err) {
      console.error("Failed to fetch relationships:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#0F172A0F]">
      <h3 className="text-sm font-bold text-[#111111] mb-4">Relacionamentos</h3>
      {relationships.length === 0 ? (
        <p className="text-xs text-[#64748B]">Nenhum relacionamento encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {relationships.map((rel: any) => (
            <li key={rel.id} className="text-xs text-[#111111] p-2 bg-[#FAFAFA] rounded-lg">
              {rel.relationshipType}: {rel.targetType} (ID: {rel.targetId})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
