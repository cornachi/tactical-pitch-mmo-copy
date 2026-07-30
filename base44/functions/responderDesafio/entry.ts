import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { simularCore } from "../../shared/simulacao.ts";

// Responde a um desafio pendente: aceitar (bloqueia aposta do desafiado, simula,
// transfere o pote ao vencedor e notifica o desafiante), recusar (devolve a aposta)
// ou cancelar (desafiante cancela seu próprio desafio pendente).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { desafio_id, acao, idioma } = await req.json();
    if (!desafio_id || !['aceitar', 'recusar', 'cancelar'].includes(acao)) {
      return Response.json({ error: 'desafio_id e acao (aceitar|recusar|cancelar) são obrigatórios' }, { status: 400 });
    }

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const meuClube = clubes[0];
    if (!meuClube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });

    const desafio = await base44.asServiceRole.entities.DesafioPendente.get(desafio_id);
    if (!desafio) return Response.json({ error: 'Desafio não encontrado' }, { status: 404 });
    if (desafio.status !== 'PENDENTE') {
      return Response.json({ error: 'Este desafio não está mais pendente' }, { status: 400 });
    }

    const aposta = desafio.aposta_moedas || 0;
    const desafiante = await base44.asServiceRole.entities.Clube.get(desafio.desafiante_id);
    const desafiado = await base44.asServiceRole.entities.Clube.get(desafio.desafiado_id);

    // RECUSAR: desafiado rejeita — devolve a aposta ao desafiante.
    if (acao === 'recusar') {
      if (desafio.desafiado_id !== meuClube.id) return Response.json({ error: 'Somente o desafiado pode recusar' }, { status: 403 });
      await base44.asServiceRole.entities.DesafioPendente.update(desafio_id, { status: 'RECUSADO' });
      await base44.asServiceRole.entities.Clube.update(desafio.desafiante_id, {
        moedas: (desafiante.moedas || 0) + aposta,
      });
      await base44.asServiceRole.entities.Notificacao.create({
        clube_id: desafio.desafiante_id,
        titulo: 'Desafio recusado',
        mensagem: `${desafiado.nome_clube} recusou seu desafio. ${aposta.toLocaleString('pt-BR')} moedas foram devolvidas ao seu saldo.`,
        lida: false,
      });
      return Response.json({ success: true, status: 'RECUSADO' });
    }

    // CANCELAR: desafiante cancela seu próprio desafio pendente — devolve a aposta.
    if (acao === 'cancelar') {
      if (desafio.desafiante_id !== meuClube.id) return Response.json({ error: 'Somente o desafiante pode cancelar' }, { status: 403 });
      await base44.asServiceRole.entities.DesafioPendente.update(desafio_id, { status: 'CANCELADO' });
      await base44.asServiceRole.entities.Clube.update(desafio.desafiante_id, {
        moedas: (desafiante.moedas || 0) + aposta,
      });
      return Response.json({ success: true, status: 'CANCELADO' });
    }

    // ACEITAR: desafiado aceita — bloqueia a aposta do desafiado e simula a partida.
    if (desafio.desafiado_id !== meuClube.id) return Response.json({ error: 'Somente o desafiado pode aceitar' }, { status: 403 });

    if ((desafiante.energia_desafio || 0) < 1) {
      // Desafiante sem energia: cancela e devolve a aposta.
      await base44.asServiceRole.entities.DesafioPendente.update(desafio_id, { status: 'CANCELADO' });
      await base44.asServiceRole.entities.Clube.update(desafio.desafiante_id, {
        moedas: (desafiante.moedas || 0) + aposta,
      });
      await base44.asServiceRole.entities.Notificacao.create({
        clube_id: desafio.desafiante_id,
        titulo: 'Desafio cancelado',
        mensagem: `Seu desafio contra ${desafiado.nome_clube} foi cancelado por falta de energia. ${aposta.toLocaleString('pt-BR')} moedas devolvidas.`,
        lida: false,
      });
      return Response.json({ error: 'O desafiante não tem energia de desafio suficiente. Desafio cancelado e aposta devolvida.' }, { status: 400 });
    }

    if ((desafiado.moedas || 0) < aposta) {
      return Response.json({ error: 'Saldo insuficiente para aceitar este desafio' }, { status: 400 });
    }

    // Bloqueia a aposta do desafiado e consome a energia de desafio do desafiante.
    await base44.asServiceRole.entities.Clube.update(desafio.desafiado_id, {
      moedas: (desafiado.moedas || 0) - aposta,
    });
    await base44.asServiceRole.entities.Clube.update(desafio.desafiante_id, {
      energia_desafio: (desafiante.energia_desafio || 0) - 1,
    });

    await base44.asServiceRole.entities.DesafioPendente.update(desafio_id, { status: 'ACEITO' });

    // Cópias com os saldos já ajustados para o núcleo de simulação.
    const desafianteAtualizado = { ...desafiante, energia_desafio: (desafiante.energia_desafio || 0) - 1 };
    const desafiadoAtualizado = { ...desafiado, moedas: (desafiado.moedas || 0) - aposta };

    const result = await simularCore(base44, {
      desafiante: desafianteAtualizado,
      desafiado: desafiadoAtualizado,
      desafianteId: desafio.desafiante_id,
      desafiadoId: desafio.desafiado_id,
      tipoPartida: 'DESAFIO',
      aposta,
      consumirEnergia: false,
      potReservado: true,
      idioma,
    });

    const vencedorId = result.vencedor === 'home' ? desafio.desafiante_id
      : result.vencedor === 'away' ? desafio.desafiado_id : null;

    await base44.asServiceRole.entities.DesafioPendente.update(desafio_id, {
      status: 'CONCLUIDO',
      partida_id: result.partida_id,
      vencedor_id: vencedorId,
      moedas_ganhas: result.moedas_ganhas,
    });

    const veredito = result.vencedor === 'empate'
      ? 'A partida terminou em empate e as apostas foram devolvidas.'
      : result.moedas_ganhas > 0
        ? `Você venceu e recebeu ${Math.abs(result.moedas_ganhas).toLocaleString('pt-BR')} moedas!`
        : `Você perdeu ${Math.abs(result.moedas_ganhas).toLocaleString('pt-BR')} moedas.`;

    await base44.asServiceRole.entities.Notificacao.create({
      clube_id: desafio.desafiante_id,
      partida_id: result.partida_id,
      titulo: '⚽ Desafio Concluído!',
      mensagem: `O jogo contra ${desafiado.nome_clube} terminou em ${result.placar_home} x ${result.placar_away}. Clique para ver o relatório completo!`,
      lida: false,
    });

    // Perspectiva do resultado: o desafiado (quem aceitou) está no lado "away".
    result.viewer_side = 'away';
    result.viewer_moedas = -result.moedas_ganhas;
    result.viewer_elo = desafiadoAtualizado.ranking_elo || 1000;
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}