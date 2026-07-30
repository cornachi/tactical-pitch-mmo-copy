import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { simularCore } from "../../shared/simulacao.ts";

// Simulação direta — usada pelo matchmaking (PartidaRápida).
// O fluxo de desafio agora passa por criarDesafio + responderDesafio.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { desafiante_id, desafiado_id, tipo_partida, modelo_jogo, clima, idioma } = await req.json();
    if (!desafiante_id || !desafiado_id) {
      return Response.json({ error: 'desafiante_id e desafiado_id são obrigatórios' }, { status: 400 });
    }
    if (desafiante_id === desafiado_id) {
      return Response.json({ error: 'Desafiante e desafiado não podem ser o mesmo clube' }, { status: 400 });
    }
    if (!['MATCHMAKING', 'DESAFIO'].includes(tipo_partida)) {
      return Response.json({ error: 'tipo_partida inválido (use MATCHMAKING ou DESAFIO)' }, { status: 400 });
    }

    const desafiante = await base44.asServiceRole.entities.Clube.get(desafiante_id);
    const desafiado = await base44.asServiceRole.entities.Clube.get(desafiado_id);
    if (!desafiante || !desafiado) {
      return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    }
    if (desafiante.user_id !== user.id) {
      return Response.json({ error: 'Você só pode jogar com o seu próprio clube' }, { status: 403 });
    }

    if (tipo_partida === 'DESAFIO') {
      return Response.json({ error: 'Desafios devem ser criados pela Central de Desafios (/desafios)' }, { status: 400 });
    }

    if ((desafiante.energia_matchmaking || 0) < 1) {
      return Response.json({ error: 'Energia de matchmaking insuficiente' }, { status: 400 });
    }

    const result = await simularCore(base44, {
      desafiante,
      desafiado,
      desafianteId: desafiante_id,
      desafiadoId: desafiado_id,
      tipoPartida: tipo_partida,
      aposta: 0,
      consumirEnergia: true,
      potReservado: false,
      modeloJogoHome: modelo_jogo,
      clima,
      idioma,
    });

    result.viewer_side = 'home';
    result.viewer_moedas = result.moedas_ganhas;
    result.viewer_elo = result.novo_elo_desafiante;
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}