import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Definição das conquistas destraváveis do jogo.
const CONQUISTAS = [
  { id: 'primeira_vitoria', titulo: 'Primeira Vitória', descricao: 'Vença sua primeira partida', recompensa_moedas: 500, recompensa_xp: 200, meta: 1, tipo: 'vitorias' },
  { id: 'imparavel', titulo: 'Imparável', descricao: 'Alcance Win Streak de 5', recompensa_moedas: 2500, recompensa_xp: 500, meta: 5, tipo: 'win_streak' },
  { id: 'ataque_avassalador', titulo: 'Ataque Avassalador', descricao: 'Marque 50 gols acumulados', recompensa_moedas: 5000, recompensa_xp: 1000, meta: 50, tipo: 'gols' },
  { id: 'mestre_tatico', titulo: 'Mestre Tático', descricao: 'Evolua 1 atributo para Nível 20', recompensa_moedas: 10000, recompensa_xp: 2000, meta: 20, tipo: 'atributo_max' },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const acao = body.acao || 'status';
    const clube_id = body.clube_id;
    if (!clube_id) return Response.json({ error: 'clube_id obrigatório' }, { status: 400 });

    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (clube.user_id !== user.id) return Response.json({ error: 'Acesso negado' }, { status: 403 });

    const [home, away, attrs, resgatadas] = await Promise.all([
      base44.asServiceRole.entities.HistoricoPartida.filter({ desafiante_id: clube_id }, '-created_date', 1000),
      base44.asServiceRole.entities.HistoricoPartida.filter({ desafiado_id: clube_id }, '-created_date', 1000),
      base44.asServiceRole.entities.AtributoTatico.filter({ clube_id }),
      base44.asServiceRole.entities.Conquista.filter({ clube_id }),
    ]);

    let vitorias = 0, golsPro = 0;
    [...home, ...away].forEach((p) => {
      const souHome = p.desafiante_id === clube_id;
      const meuGol = souHome ? (p.placar_home || 0) : (p.placar_away || 0);
      const golAdv = souHome ? (p.placar_away || 0) : (p.placar_home || 0);
      golsPro += meuGol;
      if (meuGol > golAdv) vitorias++;
    });
    let atributoMax = 0;
    attrs.forEach((a) => { if ((a.nivel || 1) > atributoMax) atributoMax = a.nivel || 1; });

    const valores = {
      vitorias,
      win_streak: clube.win_streak || 0,
      gols: golsPro,
      atributo_max: atributoMax,
    };

    const resgatadasSet = new Set(resgatadas.map((r) => r.titulo_obtido));

    if (acao === 'resgatar') {
      const alvo = CONQUISTAS.find((c) => c.id === body.titulo || c.titulo === body.titulo);
      if (!alvo) return Response.json({ error: 'Conquista inválida' }, { status: 400 });
      if (resgatadasSet.has(alvo.titulo)) return Response.json({ error: 'Conquista já resgatada' }, { status: 400 });
      if (valores[alvo.tipo] < alvo.meta) return Response.json({ error: 'Critério ainda não atingido' }, { status: 400 });

      const novoSaldo = (clube.moedas || 0) + alvo.recompensa_moedas;
      const novoXp = (clube.xp || 0) + alvo.recompensa_xp;
      await base44.asServiceRole.entities.Clube.update(clube_id, { moedas: novoSaldo, xp: novoXp });
      await base44.asServiceRole.entities.Conquista.create({
        clube_id,
        titulo_obtido: alvo.titulo,
        data_desbloqueio: new Date().toISOString().slice(0, 10),
      });
      return Response.json({
        success: true,
        titulo: alvo.titulo,
        moedas_ganhas: alvo.recompensa_moedas,
        xp_ganhos: alvo.recompensa_xp,
        novo_saldo: novoSaldo,
      });
    }

    const lista = CONQUISTAS.map((c) => {
      const atual = Math.min(valores[c.tipo], c.meta);
      return {
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao,
        recompensa_moedas: c.recompensa_moedas,
        recompensa_xp: c.recompensa_xp,
        atual,
        meta: c.meta,
        desbloqueada: valores[c.tipo] >= c.meta,
        resgatada: resgatadasSet.has(c.titulo),
      };
    });
    return Response.json({ conquistas: lista });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}