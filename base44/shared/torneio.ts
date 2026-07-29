// Lógica de chaveamento de mata-mata de 8 para Torneios de Amigos.
// Rodadas: "Quartas de Final" (4 partidas), "Semifinal" (2) e "Final" (1).

export const ORDEM_RODADAS = ["Quartas de Final", "Semifinal", "Final"];
const PROXIMA_RODADA = { "Quartas de Final": "Semifinal", "Semifinal": "Final" };

export function gerarCodigoConvite() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function novaPartida() {
  return { home_id: null, away_id: null, placar_home: 0, placar_away: 0, vencedor_id: null, dominancia_home: 0, bye: false };
}

function avancar(rodadas, rodadaKey, matchIndex, vencedorId) {
  const prox = PROXIMA_RODADA[rodadaKey];
  if (!prox) return;
  const slot = Math.floor(matchIndex / 2);
  const side = matchIndex % 2; // 0 = home, 1 = away
  const m = rodadas[prox][slot];
  if (side === 0) m.home_id = vencedorId;
  else m.away_id = vencedorId;
}

// Resolve WOs em cascata: partida com apenas um lado definido avança
// automaticamente. Percorre as rodadas em ordem para cascatear os byes.
export function resolverByesAuto(rodadas) {
  for (const key of ORDEM_RODADAS) {
    const matches = rodadas[key] || [];
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (m.vencedor_id) continue;
      if (m.home_id && !m.away_id) {
        m.vencedor_id = m.home_id;
        m.bye = true;
        avancar(rodadas, key, i, m.home_id);
      } else if (m.away_id && !m.home_id) {
        m.vencedor_id = m.away_id;
        m.bye = true;
        avancar(rodadas, key, i, m.away_id);
      }
    }
  }
}

// Monta a chave de quartas a partir dos participantes (até 8). Preenche null
// nos slots vazios e resolve WOs imediatos.
export function gerarChaveamento(participantes) {
  const slots = [];
  for (let i = 0; i < 8; i++) slots.push(participantes[i] || null);
  const quartas = [];
  for (let i = 0; i < 4; i++) {
    const p = novaPartida();
    p.home_id = slots[i * 2];
    p.away_id = slots[i * 2 + 1];
    quartas.push(p);
  }
  const semifinal = [novaPartida(), novaPartida()];
  const final = [novaPartida()];
  const rodadas = { "Quartas de Final": quartas, "Semifinal": semifinal, "Final": final };
  resolverByesAuto(rodadas);
  return rodadas;
}

// Verifica se a final foi decidida e devolve campeão/vice.
export function finalDecidida(rodadas) {
  const f = rodadas["Final"]?.[0];
  if (!f || !f.vencedor_id) return null;
  const campeao = f.vencedor_id;
  const vice = f.home_id === campeao ? f.away_id : f.home_id;
  return { campeao_id: campeao, vice_id: vice || null };
}