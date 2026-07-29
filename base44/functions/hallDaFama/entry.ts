import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcularHallDaFama } from "../../shared/trofeus.ts";

// Hall da Fama — Ranking Mundial de Maiores Campeões por Pontos de Glória.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const hall = await calcularHallDaFama(base44);
    return Response.json({ success: true, hall });
  } catch (error) {
    console.error("hallDaFama: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}