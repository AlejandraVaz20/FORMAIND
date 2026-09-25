import React, { useEffect, useState } from 'react';
import { getAllDrafts, deleteDraftFromDB } from '../utils/offlineStorage';

export function RecordsView() {
  const [activeTab, setActiveTab] = useState<'completados' | 'borradores'>('borradores');
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'borradores') {
      loadDrafts();
    }
  }, [activeTab]);

  const loadDrafts = async () => {
    try {
      const data = await getAllDrafts();
      setDrafts(data);
    } catch (error) {
      console.error('Error cargando borradores:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDraftFromDB(id);
    loadDrafts();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Registros y Borradores</h2>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('completados')}
            className={`${activeTab === 'completados' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Registros Completados
          </button>
          <button
            onClick={() => setActiveTab('borradores')}
            className={`${activeTab === 'borradores' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            Borradores Guardados
            <span className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white py-0.5 px-2 rounded-full text-xs">
              {drafts.length}
            </span>
          </button>
        </nav>
      </div>

      {activeTab === 'borradores' && (
        <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {drafts.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No hay borradores guardados localmente.
              </li>
            ) : (
              drafts.map((draft) => (
                <li key={draft.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                        {draft.tipo === 'inspeccion' ? 'Formato de Inspección' : 'Formato de Recepción'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Última modificación: {new Date(draft.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                        Continuar Edición
                      </button>
                      <button 
                        onClick={() => handleDelete(draft.id)}
                        className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}