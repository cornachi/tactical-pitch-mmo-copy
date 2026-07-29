// Missões diárias — geração, reset por data e registro de progresso.
// O reset é automático: ao acessar ou registrar progresso, se a data
// (America/Sao_Paulo) das missões existentes for diferente de hoje, elas
// são recriadas com novos objetivos.

export const TIPOS_MISSAO = {
  PARTIDAS: { tipo: "PARTIDAS", desc: (n) => `Jogar ${n} partida(s)`, objMin: 2, objMax: 4, recompensa: 120 },
  GOLS: { tipo: "GOLS", desc: (n) => `Marcar ${n} gol(s)`, objMin: 2, objMax: 4, recompensa: 150 },
  EVOLUIR: { tipo: "EVOLUIR", desc: (n) => `Evoluir ${n} atributo(s) tático(s)`, objMin: 1, objMax: 2, recompensa: 130 },
  VENCER_DESAFIO: { tipo: "VENCER_DESAFIO", desc: (n) => `Vencer ${n} partida(s) no Modo Desafio`, objMin: 1, objMax: 2, recompensa: 200 },
};

export const RECOMPENSA_BONUS_DIARIO = 300;

export function hojeSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function gerarMissoesDiarias(client, clube_id) {
  await client.entities.MissaoDiaria.deleteMany({ clube_id });
  const hoje = hojeSaoPaulo();
  const tipos = Object.values(TIPOS_MISSAO);
  const escolhidos = tipos.sort(() => Math.random() - 0.5).slice(0, 3);
  const registros = escolhidos.map((t) => {
    const objetivo = randInt(t.objMin, t.objMax);
    return {
      clube_id,
      tipo: t.tipo,
      descricao: t.desc(objetivo),
      objetivo,
      progresso: 0,
      concluida: false,
      resgatada: false,
      recompensa_moedas: t.recompensa,
      bonus_resgatado: false,
      data: hoje,
    };
  });
  return client.entities.MissaoDiaria.bulkCreate(registros);
}

export async function getMissoesDiarias(client, clube_id) {
  const hoje = hojeSaoPaulo();
  const existentes = await client.entities.MissaoDiaria.filter({ clube_id });
  const precisaGerar = existentes.length === 0 || existentes.some((m) => m.data !== hoje);
  if (precisaGerar) {
    return gerarMissoesDiarias(client, clube_id);
  }
  return existentes;
}

export async function registrarProgresso(client, clube_id, tipo, quantidade) {
  if (!quantidade || quantidade <= 0) return;
  const missoes = await getMissoesDiarias(client, clube_id);
  for (const m of missoes) {
    if (m.tipo !== tipo || m.resgatada) continue;
    const novoProgresso = Math.min(m.objetivo, (m.progresso || 0) + quantidade);
    const update = { progresso: novoProgresso };
    if (novoProgresso >= m.objetivo) update.concluida = true;
    await client.entities.MissaoDiaria.update(m.id, update);
  }
}