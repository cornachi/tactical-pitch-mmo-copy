import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Cria um desafio pendente: calcula a aposta All-In (mínimo entre os saldos,
// respeitando o teto de 1.000 moedas), reserva o valor do desafiante e notifica o desafiado.
export const TETO_APOSTA = 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { desafiado_id } = await req.json();
    if (!desafiado_id) return Response.json({ error: 'desafiado_id é obrigatório' }, { status: 400 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const desafiante = clubes[0];
    if (!desafiante) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (desafiante.id === desafiado_id) return Response.json({ error: 'Você não pode desafiar a si mesmo' }, { status: 400 });

    if ((desafiante.energia_desafio || 0) < 1) {
      return Response.json({ error: 'Energia de desafio insuficiente' }, { status: 400 });
    }

    const desafiado = await base44.asServiceRole.entities.Clube.get(desafiado_id);
    if (!desafiado) return Response.json({ error: 'Clube desafiado não encontrado' }, { status: 404 });

    const aposta = Math.min(desafiante.moedas || 0, desafiado.moedas || 0, TETO_APOSTA);
    if (aposta <= 0) return Response.json({ error: 'Saldo insuficiente para criar o desafio' }, { status: 400 });

    // Reserva (bloqueia) a aposta do desafiante.
    await base44.asServiceRole.entities.Clube.update(desafiante.id, {
      moedas: (desafiante.moedas || 0) - aposta,
    });

    const desafio = await base44.asServiceRole.entities.DesafioPendente.create({
      desafiante_id: desafiante.id,
      desafiado_id: desafiado.id,
      aposta_moedas: aposta,
      status: 'PENDENTE',
    });

    await base44.asServiceRole.entities.Notificacao.create({
      clube_id: desafiado.id,
      titulo: 'Novo Desafio!',
      mensagem: `${desafiante.nome_clube} te desafiou apostando ${aposta.toLocaleString('pt-BR')} moedas (All-In). Acesse "Desafios" para aceitar ou recusar.`,
      lida: false,
    });

    return Response.json({
      success: true,
      desafio_id: desafio.id,
      aposta_moedas: aposta,
      desafiado: { id: desafiado.id, nome_clube: desafiado.nome_clube },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}