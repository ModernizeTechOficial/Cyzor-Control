import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export default function Company360View() {
  const { globalFilters } = useNavigation();
  const companyId = globalFilters.companyId;

  return (
    <div className="w-full flex flex-col gap-6 p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold">Empresa 360</h1>
      <p>Company ID: {companyId}</p>
    </div>
  );
}
