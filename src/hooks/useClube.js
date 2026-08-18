import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export const CLUBE_KEY = ["clube"];

// Fallback exibido no Modo Convidado para que Equipe/Estádio/Missões/Ranking
// não fiquem sem dados nem quebrem com clube null.
export const GUEST_CLUBE_FALLBACK = {
  id: "guest_club_1",
  nome_clube: "Time Convidado FC",
  pais: "Brasil",
  moedas: 1000,
  xp: 0,
  pontos_ranking: 0,
  energia_matchmaking: 6,
  energia_desafio: 3,
  win_streak: 0,
  total_partidas: 0,
  vitorias: 0,
  empates: 0,
  derrotas: 0,
  gols_pro: 0,
  gols_contra: 0,
  especializacao: "EQUILIBRADO",
  estadio_nivel: 0,
  ct_nivel: 0,
  medico_nivel: 0,
  comissao_prep_fisico: 0,
  comissao_analista: 0,
  comissao_auxiliar_tatico: 0,
  termometro_torcida: 50,
};

async function fetchMeuClube() {
  const user = await base44.auth.me();
  const clubes = await base44.entities.Clube.filter({ user_id: user.id });
  return clubes[0] || null;
}

// Query compartilhada do clube do usuário (single source of truth entre telas).
export function useClube() {
  const { user } = useAuth();
  const isGuest = !!user?.isGuest;
  return useQuery({
    queryKey: CLUBE_KEY,
    queryFn: async () => (isGuest ? GUEST_CLUBE_FALLBACK : await fetchMeuClube()),
  });
}

// Evolução de atributo tático com UI otimista: desconta moedas e sobe o nível
// instantaneamente, antes da confirmação do backend (rollback em erro).
export function useEvoluirAtributo(clubeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome_atributo }) => {
      const res = await base44.functions.invoke("evoluirAtributo", { clube_id: clubeId, nome_atributo });
      return res?.data ?? res;
    },
    onMutate: async ({ nome_atributo, custo }) => {
      await qc.cancelQueries({ queryKey: CLUBE_KEY });
      await qc.cancelQueries({ queryKey: ["atributos", clubeId] });
      const prevClube = qc.getQueryData(CLUBE_KEY);
      const prevAttrs = qc.getQueryData(["atributos", clubeId]);
      if (prevClube) {
        qc.setQueryData(CLUBE_KEY, { ...prevClube, moedas: Math.max(0, (prevClube.moedas || 0) - custo) });
      }
      if (prevAttrs) {
        const existe = prevAttrs.some((a) => a.nome_atributo === nome_atributo);
        qc.setQueryData(
          ["atributos", clubeId],
          existe
            ? prevAttrs.map((a) => (a.nome_atributo === nome_atributo ? { ...a, nivel: (a.nivel || 1) + 1 } : a))
            : [...prevAttrs, { nome_atributo, nivel: 2 }]
        );
      }
      return { prevClube, prevAttrs };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevClube) qc.setQueryData(CLUBE_KEY, ctx.prevClube);
      if (ctx?.prevAttrs) qc.setQueryData(["atributos", clubeId], ctx.prevAttrs);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CLUBE_KEY });
      qc.invalidateQueries({ queryKey: ["atributos", clubeId] });
    },
  });
}

// Evolução de instalação/comissão com UI otimista: desconta moedas e sobe o nível
// do campo correspondente no clube instantaneamente (rollback em erro).
export function useEvoluirInstalacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clube_id, tipo }) => {
      const res = await base44.functions.invoke("evoluirInstalacao", { clube_id, tipo });
      return res?.data ?? res;
    },
    onMutate: async ({ custo, campo }) => {
      await qc.cancelQueries({ queryKey: CLUBE_KEY });
      const prev = qc.getQueryData(CLUBE_KEY);
      if (prev) {
        qc.setQueryData(CLUBE_KEY, {
          ...prev,
          xp: Math.max(0, (prev.xp || 0) - custo),
          [campo]: (prev[campo] || 0) + 1,
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(CLUBE_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: CLUBE_KEY }),
  });
}