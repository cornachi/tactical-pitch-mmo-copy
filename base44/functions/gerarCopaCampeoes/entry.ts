import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { simularConfrontoCopa } from "../../shared/copa.ts";

// Gera a Copa dos Campeões Semanal: classifica os 16 melhores por ELO, monta o
// mata-mata com seed padrão e simula todas as rodadas até o campeão. Premia o
// campeão (2000 moedas + conquista) e o vice (1000 moedas). Notifica o campeão.
const PREMIO_CAMPEAO = 2000;
const PREMIO_VICE = 1000;
// Seed padrão de chave de 16 (1ºx16º, 8ºx9º, 4ºx13º, 5ºx12º, ...).
const SEED_16 = [0, 15, 7, 8, 3, 12, 4, 11, 1, 14, 6, 9, 2, 13, 5, 10];

function isoWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const semanaAno = isoWeek(new Date());
    const existente = await base44.asServiceRole.entities.CopaCampeoes.filter({ semana_ano: semanaAno });
    if (existente.length > 0) {
      return Response.json({ error: 'Copa desta semana já foi gerada', semana_ano: semanaAno }, { status: 409 });
    }

    const clubes = await base44.asServiceRole.entities.Clube.list("-ranking_elo", 10000);
    if (clubes.length < 2) return Response.json({ error: 'Clubes insuficientes para a Copa' }, { status: 400 });

    const classificados = clubes.slice(0, 16);
    const clubesMap = {};
    classificados.forEach((c) => { clubesMap[c.id] = c; });

    // Monta a chave: aplica seed de 16 se houver 16 classificados; senão usa a ordem do ELO.
    let chave;
    if (classificados.length === 16) {
      chave = SEED_16.map((i) => classificados[i]).filter(Boolean);
    } else {
      chave = classificados.slice();
    }

    const simularRodada = async (participantes) => {
      const jogos = [];
      const vencedores = [];
      for (let i = 0; i < participantes.length; i += 2) {
        const a = participantes[i];
        const b = participantes[i + 1];
        if (!b) {
          jogos.push({ home_id: a.id, away_id: null, placar_home: 0, placar_away: 0, vencedor_id: a.id, bye: true });
          vencedores.push(a);
          continue;
        }
        const r = await simularConfrontoCopa(base44, a, b);
        jogos.push({ home_id: a.id, away_id: b.id, placar_home: r.placar_home, placar_away: r.placar_away, vencedor_id: r.vencedor_id });
        vencedores.push(r.vencedor_id === a.id ? a : b);
      }
      return { jogos, vencedores };
    };

    const rodadas = {};
    let participantes = chave;
    const nomesRodada = ["Oitavas de Final", "Quartas de Final", "Semifinal", "Final"];
    for (let r = 0; r < nomesRodada.length && participantes.length > 1; r++) {
      const { jogos, vencedores } = await simularRodada(participantes);
      rodadas[nomesRodada[r]] = jogos;
      participantes = vencedores;
    }
    const campeao = participantes[0] || null;

    const finalJogo = rodadas["Final"]?.[0];
    let viceId = null;
    if (finalJogo) {
      viceId = finalJogo.vencedor_id === finalJogo.home_id ? finalJogo.away_id : finalJogo.home_id;
    }

    // Premiação
    if (campeao) {
      await base44.asServiceRole.entities.Clube.update(campeao.id, { moedas: (campeao.moedas || 0) + PREMIO_CAMPEAO });
    }
    if (viceId) {
      const vice = clubesMap[viceId] || await base44.asServiceRole.entities.Clube.get(viceId);
      if (vice) await base44.asServiceRole.entities.Clube.update(viceId, { moedas: (vice.moedas || 0) + PREMIO_VICE });
    }

    // Conquista + notificação do campeão
    if (campeao) {
      try {
        await base44.asServiceRole.entities.Conquista.create({
          clube_id: campeao.id,
          titulo_obtido: 'Campeão da Copa dos Campeões',
          data_desbloqueio: new Date().toISOString().slice(0, 10),
        });
      } catch (e) { /* best-effort */ }
      if (!campeao.is_bot) {
        try {
          await base44.asServiceRole.entities.Notificacao.create({
            clube_id: campeao.id,
            titulo: '🏆 Campeão da Copa dos Campeões!',
            mensagem: `Você venceu a Copa dos Campeões Semanal e ganhou ${PREMIO_CAMPEAO.toLocaleString('pt-BR')} moedas!`,
            lida: false,
          });
        } catch (e) { /* best-effort */ }
      }
    }

    const copa = await base44.asServiceRole.entities.CopaCampeoes.create({
      semana_ano: semanaAno,
      status: 'CONCLUIDO',
      classificados: classificados.map((c) => c.id),
      rodadas,
      campeao_id: campeao?.id || null,
      vice_id: viceId || null,
      premio_moedas: PREMIO_CAMPEAO,
    });

    return Response.json({
      success: true,
      semana_ano: semanaAno,
      campeao: campeao?.nome_clube || null,
      vice_id: viceId,
      copa_id: copa.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}