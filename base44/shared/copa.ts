import { poderAtaque, poderDefesa, calcularDominancia, amostraPoisson } from "./tactical.ts";

// Simula um confronto único de mata-mata (sem LLM/histórico) para a Copa dos
// Campeões. Em caso de empate, vai a pênaltis simulados até desempatar.
export async function simularConfrontoCopa(base44, clubeA, clubeB) {
  const attrsA = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: clubeA.id });
  const attrsB = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: clubeB.id });
  const atkA = poderAtaque(attrsA);
  const defA = poderDefesa(attrsA);
  const atkB = poderAtaque(attrsB);
  const defB = poderDefesa(attrsB);
  const dom = calcularDominancia(atkA, defB, atkB, defA);
  let ph = amostraPoisson(dom.xg_home);
  let pa = amostraPoisson(dom.xg_away);
  // Prorrogação / pênaltis: não há empate no mata-mata.
  while (ph === pa) {
    ph += amostraPoisson(0.7);
    pa += amostraPoisson(0.7);
  }
  return {
    placar_home: ph,
    placar_away: pa,
    vencedor_id: ph > pa ? clubeA.id : clubeB.id,
    dominancia_home: dom.dominancia_home,
  };
}