import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Calcula o retrospecto de um clube (geral) ou o confronto direto entre dois clubes (H2H).
// Sem clube_b_id: retorna retrospecto geral + arma secreta (atributo de maior nível).
// Com clube_b_id: retorna apenas o histórico de confrontos diretos.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clube_a_id, clube_b_id } = await req.json();
    if (!clube_a_id) return Response.json({ error: 'clube_a_id obrigatório' }, { status: 400 });

    const clubeA = await base44.asServiceRole.entities.Clube.get(clube_a_id);
    if (!clubeA) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });

    const [home, away] = await Promise.all([
      base44.asServiceRole.entities.HistoricoPartida.filter({ desafiante_id: clube_a_id }, '-created_date', 1000),
      base44.asServiceRole.entities.HistoricoPartida.filter({ desafiado_id: clube_a_id }, '-created_date', 1000),
    ]);

    const partidas = [...home, ...away].sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    );

    const relevant = clube_b_id
      ? partidas.filter((p) => p.desafiante_id === clube_b_id || p.desafiado_id === clube_b_id)
      : partidas;

    let vitorias = 0, empates = 0, derrotas = 0, golsPro = 0, golsContra = 0;
    const forma = [];
    relevant.forEach((p) => {
      const souHome = p.desafiante_id === clube_a_id;
      const meuGol = souHome ? (p.placar_home || 0) : (p.placar_away || 0);
      const golAdv = souHome ? (p.placar_away || 0) : (p.placar_home || 0);
      golsPro += meuGol;
      golsContra += golAdv;
      if (meuGol > golAdv) { vitorias++; forma.push('V'); }
      else if (meuGol < golAdv) { derrotas++; forma.push('D'); }
      else { empates++; forma.push('E'); }
    });

    const jogos = relevant.length;
    const aproveitamento = jogos > 0 ? Math.round(((vitorias + empates * 0.5) / jogos) * 100) : 0;

    const result = {
      jogos, vitorias, empates, derrotas,
      gols_pro: golsPro, gols_contra: golsContra,
      saldo: golsPro - golsContra, aproveitamento,
      forma: forma.slice(0, 5),
    };

    if (!clube_b_id) {
      const attrs = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: clube_a_id });
      let arma = null;
      attrs.forEach((a) => {
        if (!arma || (a.nivel || 1) > (arma.nivel || 1)) arma = a;
      });
      result.arma_secreta = arma ? { nome: arma.nome_atributo, nivel: arma.nivel || 1 } : null;
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}