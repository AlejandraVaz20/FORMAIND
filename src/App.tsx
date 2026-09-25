import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FillFormatWizard } from './components/FillFormatWizard';
import { CatalogView } from './components/CatalogView';
import { RecordsView } from './components/RecordsView';
import { StatsView } from './components/StatsView';
import { ScannerModal } from './components/ScannerModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Footer } from './components/Footer';
import { INITIAL_FORMATS, ERP_RECORDS, INITIAL_INSPECTIONS } from './data/mockData';
import { FormatDefinition, ErpSampleRecord, InspectionRecord } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { initDB, saveInspection } from './utils/offlineStorage';
import { useOfflineSync } from './hooks/useOfflineSync';
import { CheckCircle2, CloudUpload } from 'lucide-react';

function MainAppContent() {
  const { currentProfile, updateCurrentProfile, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  const [formats] = useState<FormatDefinition[]>(INITIAL_FORMATS);
  const [erpRecords] = useState<ErpSampleRecord[]>(ERP_RECORDS);
  const [inspections, setInspections] = useState<InspectionRecord[]>(INITIAL_INSPECTIONS);
  
  const userProfile = currentProfile!;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [selectedFormatIdForWizard, setSelectedFormatIdForWizard] = useState<string | undefined>(undefined);
  
  // ESTADO NUEVO: Controla si estamos reanudando un borrador
  const [recordToEdit, setRecordToEdit] = useState<any | undefined>(undefined);
  
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [viewingRecord, setViewingRecord] = useState<InspectionRecord | null>(null);

  const [syncToast, setSyncToast] = useState<string | null>(null);

  const { 
    isOnline, 
    pendingCount, 
    isSyncing, 
    syncNow, 
    refreshPendingCount 
  } = useOfflineSync((syncedCount) => {
    setSyncToast(`¡Sincronización exitosa: ${syncedCount} registro(s) sincronizados con el ERP!`);
    setTimeout(() => setSyncToast(null), 4000);
  });

  useEffect(() => {
    initDB(INITIAL_INSPECTIONS).then((loaded) => {
      if (loaded && loaded.length > 0) {
        setInspections(loaded);
      }
    });
  }, []);

  const handleSaveProfile = (updated: typeof userProfile) => {
    updateCurrentProfile(updated);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsScannerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartFillFormat = (formatId: string) => {
    setSelectedFormatIdForWizard(formatId);
    setRecordToEdit(undefined); // Limpiamos borrador previo
    setCurrentTab('llenar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewRecord = () => {
    setSelectedFormatIdForWizard(undefined);
    setRecordToEdit(undefined); // Limpiamos borrador previo
    setCurrentTab('llenar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBarcodeDetected = (record: ErpSampleRecord) => {
    let targetFormat = formats[0].id;
    if (record.type === 'PO') targetFormat = 'for-alm-01'; 
    else if (record.type === 'LOTE') targetFormat = 'for-cal-04'; 
    else if (record.type === 'OF') targetFormat = 'for-alm-08'; 
    else if (record.type === 'EMBARQUE') targetFormat = 'for-log-11'; 

    setSelectedFormatIdForWizard(targetFormat);
    setRecordToEdit(undefined);
    setCurrentTab('llenar');
  };

  // FUNCIÓN NUEVA: Enviar los datos del borrador al wizard y abrir la pestaña
  const handleContinueEditing = (record: any) => {
    setRecordToEdit(record);
    setCurrentTab('llenar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-150">
      
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'llenar') {
            setSelectedFormatIdForWizard(undefined);
            setRecordToEdit(undefined);
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onNewRecord={handleNewRecord}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        unreadCount={2}
        isOnline={isOnline}
        pendingSyncCount={pendingCount}
        isSyncing={isSyncing}
        onSyncNow={syncNow}
        onLogout={logout}
      />

      {syncToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-3 duration-200 border border-emerald-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'inicio' && (
          <DashboardView
            formats={formats}
            inspections={inspections}
            onStartFillFormat={handleStartFillFormat}
            onOpenCatalog={() => setCurrentTab('formatos')}
            onOpenAllHistory={() => setCurrentTab('registros')}
            onViewRecord={(rec: any) => setViewingRecord(rec)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onNewRecord={handleNewRecord}
          />
        )}

        {currentTab === 'llenar' && (
          <FillFormatWizard
            setRoute={setCurrentTab}
            draftData={recordToEdit}
          />
        )}

        {currentTab === 'formatos' && (
          <CatalogView
            formats={formats}
            onStartFillFormat={handleStartFillFormat}
          />
        )}

        {currentTab === 'registros' && (
          <RecordsView
            onContinueEditing={handleContinueEditing}
            onViewRecord={(rec: any) => setViewingRecord(rec)}
          />
        )}

        {currentTab === 'estadisticas' && (
          <StatsView />
        )}

      </main>

      <Footer />

      <ScannerModal
        isOpen={isScannerOpen}
        erpRecords={erpRecords}
        onClose={() => setIsScannerOpen(false)}
        onBarcodeDetected={handleBarcodeDetected}
      />

      <RecordDetailModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

    </div>
  );
}

function AuthGate() {
  const { session, currentProfile, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !currentProfile) {
    return <LoginView />;
  }

  return <MainAppContent />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}