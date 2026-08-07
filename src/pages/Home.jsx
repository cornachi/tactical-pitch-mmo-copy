import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user } = useAuth();

  // Exemplo de query do React Query / Base44
  const { data, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: fetchUserData,
    enabled: !!user && !user.isGuest, // Desativa a requisição se for guest
  });

  // Se for convidado, utilize dados fictícios (mock) locais
  const profileData = user?.isGuest
    ? { name: user.name, level: 1, coins: 500, matches: 0 }
    : data;

  return (
    <div className="p-6">
      {user?.isGuest && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
          <span>🎮 Você está jogando no modo <strong>Convidado</strong>. O progresso não será salvo no servidor.</span>
        </div>
      )}
      
      <h1 className="text-2xl font-bold">Painel do Treinador: {profileData?.name}</h1>
    </div>
  );
}
