import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CORES_VALIDAS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#64748b"];
const ICONES_VALIDOS = ["escudo", "estrela", "coroa", "chama", "espadas", "trofeu", "raio", "montanha", "ancora", "pena", "mira"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clube_id, cor_principal, cor_secundaria, icone_escudo } = await req.json();
    if (!clube_id) return Response.json({ error: 'clube_id obrigatório' }, { status: 400 });

    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (clube.user_id !== user.id) return Response.json({ error: 'Acesso negado' }, { status: 403 });

    const update = {};
    if (cor_principal && CORES_VALIDAS.includes(cor_principal)) update.cor_principal = cor_principal;
    if (cor_secundaria && CORES_VALIDAS.includes(cor_secundaria)) update.cor_secundaria = cor_secundaria;
    if (icone_escudo && ICONES_VALIDOS.includes(icone_escudo)) update.icone_escudo = icone_escudo;
    if (Object.keys(update).length === 0) return Response.json({ error: 'Nada para atualizar' }, { status: 400 });

    await base44.asServiceRole.entities.Clube.update(clube_id, update);
    return Response.json({ success: true, ...update });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}