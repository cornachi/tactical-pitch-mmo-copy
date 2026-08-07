import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ConvertAccountModal from '@/components/ConvertAccountModal';

export default function Layout({ children }) {
  const { user } = useAuth();
  const [showConvertModal, setShowConvertModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Banner de Aviso e Conversão de Conta para Convidado */}
      {user?.isGuest && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs sm:text-sm text-amber-200">
          <span>🎮 Modo Convidado ativo (Progresso temporário)</span>
          <button
            onClick={() => setShowConvertModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded shadow transition-colors"
          >
            💾 Criar Conta e Salvar
          </button>
        </div>
      )}

      {/* Conteúdo principal das páginas do jogo */}
      <main className="flex-1">{children}</main>

      {/* Modal de Conversão */}
      <ConvertAccountModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
      />
    </div>
  );
}
