// Conteúdo dinâmico localizado (PT/EN/ES) gerado no backend:
// narração de lances, fallback de insights do LLM, descrições de missões,
// diagnósticos e recomendações do relatório tático.

export function normalizarIdioma(code) {
  const c = (code || "pt").toString().toLowerCase();
  if (c.startsWith("en")) return "en";
  if (c.startsWith("es")) return "es";
  return "pt";
}

// Nome do idioma injetado no prompt do LLM para que os insights venham no idioma certo.
export const IDIOMA_LLM_NOME = { pt: "português do Brasil", en: "English", es: "español" };

// --- Narração de lances (gerarLances + cartões) ---
export const NARRACAO = {
  pt: {
    GOL: (n, m) => `Aos ${m}' - ${n} arma a jogada, o atacante finaliza e É GOOOOOL! A torcida explode!`,
    CHUTE_PERIGOSO: (n, m) => `Aos ${m}' - ${n} arrisca de longe, a bola passa raspando a trave!`,
    DEFESA: (n, m) => `Aos ${m}' - Contra-ataque de ${n}, mas o goleiro voa e faz defesa espetacular!`,
    CARTAO_AMARELO: (n, m) => `Aos ${m}' - Falta dura e o árbitro mostra cartão amarelo para ${n} 🟨.`,
    CARTAO_VERMELHO: (n, m) => `Aos ${m}' - Falta dura e o árbitro mostra cartão VERMELHO! ${n} fica com um a menos 🟥.`,
    CONTRA_ATAQUE: (n, m) => `Aos ${m}' - Recupera a bola e ${n} dispara em contra-ataque em velocidade!`,
    FALTA: (n, m) => `Aos ${m}' - Falta perigosa na entrada da área cobrada por ${n}... a bola passa perto!`,
  },
  en: {
    GOL: (n, m) => `At ${m}' - ${n} builds the play, the striker finishes and IT'S A GOOOOAL! The crowd goes wild!`,
    CHUTE_PERIGOSO: (n, m) => `At ${m}' - ${n} shoots from distance, the ball whistles past the post!`,
    DEFESA: (n, m) => `At ${m}' - ${n} counter-attacks, but the keeper flies and makes a spectacular save!`,
    CARTAO_AMARELO: (n, m) => `At ${m}' - Hard foul and the referee shows a yellow card to ${n} 🟨.`,
    CARTAO_VERMELHO: (n, m) => `At ${m}' - Hard foul and the referee shows a RED card! ${n} is down to ten 🟥.`,
    CONTRA_ATAQUE: (n, m) => `At ${m}' - Wins the ball back and ${n} breaks away on a lightning counter-attack!`,
    FALTA: (n, m) => `At ${m}' - Dangerous free kick just outside the box taken by ${n}... just wide!`,
  },
  es: {
    GOL: (n, m) => `A los ${m}' - ${n} arma la jugada, el delantero remata y ¡GOOOOOL! La afición estalla!`,
    CHUTE_PERIGOSO: (n, m) => `A los ${m}' - ${n} remata de lejos, ¡el balón pasa rozando el palo!`,
    DEFESA: (n, m) => `A los ${m}' - ¡Contraataque de ${n}, pero el portero vuela y hace una parada espectacular!`,
    CARTAO_AMARELO: (n, m) => `A los ${m}' - Falta dura y el árbitro muestra tarjeta amarilla a ${n} 🟨.`,
    CARTAO_VERMELHO: (n, m) => `A los ${m}' - Falta dura y el árbitro muestra tarjeta ROJA. ¡${n} se queda con uno menos 🟥!`,
    CONTRA_ATAQUE: (n, m) => `A los ${m}' - Recupera el balón y ${n} arranca en contraataque veloz.`,
    FALTA: (n, m) => `A los ${m}' - Falta peligrosa en la entrada del área cobrada por ${n}... ¡el balón pasa cerca!`,
  },
};

export function narrar(tipo, nome, minuto, idioma) {
  const lang = NARRACAO[normalizarIdioma(idioma)] || NARRACAO.pt;
  const fn = lang[tipo] || NARRACAO.pt[tipo];
  return fn ? fn(nome, minuto) : `${minuto}' - ${nome}`;
}

// --- Fallback de insights (quando a chamada do LLM falha) ---
export function fallbackInsights(desafiante, desafiado, dom, vencedor, idioma) {
  const lang = normalizarIdioma(idioma);
  const nH = desafiante.nome_clube, nA = desafiado.nome_clube;
  const dh = dom.dominancia_home, da = dom.dominancia_away;
  const xh = dom.xg_home, xa = dom.xg_away;
  const xgV = vencedor === "home" ? xh : xa;
  const nomeV = vencedor === "home" ? nH : nA;
  if (lang === "en") return [
    `${nH} had ${dh}% dominance against ${da}% of the opponent.`,
    vencedor === "empate" ? "The match ended in a draw with a balanced scoreline." : `${nomeV} was more efficient in xG (${xgV}).`,
    `A final xG of ${xh} x ${xa} reflects the offensive output of both sides.`,
  ];
  if (lang === "es") return [
    `${nH} tuvo ${dh}% de dominio contra ${da}% del rival.`,
    vencedor === "empate" ? "El partido terminó en empate, con marcador equilibrado." : `${nomeV} fue más eficiente en xG (${xgV}).`,
    `Un xG final de ${xh} x ${xa} refleja la producción ofensiva de ambos equipos.`,
  ];
  return [
    `${nH} teve ${dh}% de dominância contra ${da}% do adversário.`,
    vencedor === "empate" ? "A partida terminou em empate, com placar equilibrado." : `${nomeV} foi mais eficiente no xG (${xgV}).`,
    `xG final de ${xh} x ${xa} reflete a produção ofensiva dos dois times.`,
  ];
}

// --- Descrições de missões diárias ---
export const DESC_MISSAO = {
  pt: {
    PARTIDAS: (n) => `Jogar ${n} partida(s)`,
    GOLS: (n) => `Marcar ${n} gol(s)`,
    EVOLUIR: (n) => `Evoluir ${n} atributo(s) tático(s)`,
    VENCER_DESAFIO: (n) => `Vencer ${n} partida(s) no Modo Desafio`,
  },
  en: {
    PARTIDAS: (n) => `Play ${n} match(es)`,
    GOLS: (n) => `Score ${n} goal(s)`,
    EVOLUIR: (n) => `Upgrade ${n} tactical attribute(s)`,
    VENCER_DESAFIO: (n) => `Win ${n} Challenge Mode match(es)`,
  },
  es: {
    PARTIDAS: (n) => `Jugar ${n} partido(s)`,
    GOLS: (n) => `Marcar ${n} gol(es)`,
    EVOLUIR: (n) => `Evolucionar ${n} atributo(s) táctico(s)`,
    VENCER_DESAFIO: (n) => `Ganar ${n} partido(s) en Modo Desafío`,
  },
};

export function descMissao(tipo, n, idioma) {
  const lang = DESC_MISSAO[normalizarIdioma(idioma)] || DESC_MISSAO.pt;
  return (lang[tipo] || DESC_MISSAO.pt[tipo])(n);
}

// --- Relatório tático: nome do perfil por idioma ---
export const PERFIL_NOME = {
  pt: { EQUILIBRADO: "Equilibrado", PRESSAO: "Pressão", POSSE: "Posse de Bola", CONTRA_ATAQUE: "Contra-Ataque" },
  en: { EQUILIBRADO: "Balanced", PRESSAO: "Pressing", POSSE: "Possession", CONTRA_ATAQUE: "Counter-Attack" },
  es: { EQUILIBRADO: "Equilibrado", PRESSAO: "Presión", POSSE: "Posesión", CONTRA_ATAQUE: "Contraataque" },
};

export const SEM_CONFRONTOS = {
  pt: "Sem confrontos registrados neste perfil.",
  en: "No matches recorded against this profile.",
  es: "Sin enfrentamientos registrados en este perfil.",
};

const DIAG = {
  pt: {
    PRESSAO_POSSE: (n, p) => `Perda excessiva de bola na saída defensiva sob pressão alta — apenas ${p}% de posse contra times de ${n}.`,
    PRESSAO_GC: (n, gc) => `A pressão alta provoca erros defensivos: você sofre em média ${gc} gols contra ${n}.`,
    PRESSAO_DEF: (n) => `Dificuldade em sair jogando sob a pressão de times de ${n}.`,
    CONTRA_GP: (n, gp) => `Baixa conversão de chances contra blocos baixos — média de apenas ${gp} gols a favor contra ${n}.`,
    CONTRA_GC: (n, gc) => `Vulnerabilidade em transições defensivas: sofre ${gc} gols por jogo em contra-ataques de ${n}.`,
    CONTRA_DEF: (n) => `O time é pego no contra-ataque de ${n} com frequência.`,
    POSSE_POSSE: (n, p) => `Perde a disputa de posse contra times de ${n} (apenas ${p}% de posse).`,
    POSSE_GP: (n) => `Dificuldade em criar chances contra a posse cadenciada de ${n}.`,
    POSSE_DEF: (n) => `O controle de bola do adversário (${n}) domina o jogo.`,
    EQ_GP: () => `Baixa conversão ofensiva contra times equilibrados.`,
    EQ_GC: (gc) => `Defesa cede gols demais contra times equilibrados (${gc}/jogo).`,
    EQ_DEF: (n) => `Rendimento equilibrado, mas sem superioridade clara contra ${n}.`,
  },
  en: {
    PRESSAO_POSSE: (n, p) => `Too many turnovers playing out from the back under high press — only ${p}% possession against ${n} sides.`,
    PRESSAO_GC: (n, gc) => `The high press causes defensive mistakes: you concede on average ${gc} goals against ${n}.`,
    PRESSAO_DEF: (n) => `Struggles to play out under the press of ${n} teams.`,
    CONTRA_GP: (n, gp) => `Low chance conversion against low blocks — only ${gp} goals per game against ${n}.`,
    CONTRA_GC: (n, gc) => `Vulnerable in defensive transitions: you concede ${gc} goals per game on ${n} counters.`,
    CONTRA_DEF: (n) => `The team gets caught on the ${n} counter time and again.`,
    POSSE_POSSE: (n, p) => `Loses the possession battle against ${n} sides (only ${p}% possession).`,
    POSSE_GP: (n) => `Struggles to create chances against the patient possession of ${n}.`,
    POSSE_DEF: (n) => `The opponent's ball control (${n}) dictates the game.`,
    EQ_GP: () => `Low offensive conversion against balanced teams.`,
    EQ_GC: (gc) => `Defense concedes too many goals against balanced teams (${gc}/game).`,
    EQ_DEF: (n) => `Balanced output, but no clear edge against ${n}.`,
  },
  es: {
    PRESSAO_POSSE: (n, p) => `Pérdida excesiva de balón saliendo desde atrás bajo presión alta — solo ${p}% de posesión contra equipos de ${n}.`,
    PRESSAO_GC: (n, gc) => `La presión alta provoca errores defensivos: recibes de media ${gc} goles contra ${n}.`,
    PRESSAO_DEF: (n) => `Dificultad para salir jugando bajo la presión de equipos de ${n}.`,
    CONTRA_GP: (n, gp) => `Baja conversión de ocasiones contra bloques bajos — solo ${gp} goles a favor contra ${n}.`,
    CONTRA_GC: (n, gc) => `Vulnerabilidad en transiciones defensivas: recibes ${gc} goles por partido en contraataques de ${n}.`,
    CONTRA_DEF: (n) => `El equipo cae en el contraataque de ${n} con frecuencia.`,
    POSSE_POSSE: (n, p) => `Pierde la disputa de posesión contra equipos de ${n} (solo ${p}% de posesión).`,
    POSSE_GP: (n) => `Dificultad para crear ocasiones contra la posesión pausada de ${n}.`,
    POSSE_DEF: (n) => `El control de balón del rival (${n}) domina el partido.`,
    EQ_GP: () => `Baja conversión ofensiva contra equipos equilibrados.`,
    EQ_GC: (gc) => `La defensa recibe demasiados goles contra equipos equilibrados (${gc}/partido).`,
    EQ_DEF: (n) => `Rendimiento equilibrado, pero sin superioridad clara contra ${n}.`,
  },
};

export function gerarDiagnosticoLocalizado(perfil, gpMed, gcMed, posse, nome, idioma) {
  const L = DIAG[normalizarIdioma(idioma)] || DIAG.pt;
  const gp = gpMed.toFixed(1), gc = gcMed.toFixed(1), ps = Math.round(posse);
  if (perfil === "PRESSAO") {
    if (posse < 45) return L.PRESSAO_POSSE(nome, ps);
    if (gcMed > 1.3) return L.PRESSAO_GC(nome, gc);
    return L.PRESSAO_DEF(nome);
  }
  if (perfil === "CONTRA_ATAQUE") {
    if (gpMed < 1) return L.CONTRA_GP(nome, gp);
    if (gcMed > 1.3) return L.CONTRA_GC(nome, gc);
    return L.CONTRA_DEF(nome);
  }
  if (perfil === "POSSE") {
    if (posse < 45) return L.POSSE_POSSE(nome, ps);
    if (gpMed < 1) return L.POSSE_GP(nome);
    return L.POSSE_DEF(nome);
  }
  if (gpMed < 1) return L.EQ_GP();
  if (gcMed > 1.3) return L.EQ_GC(gc);
  return L.EQ_DEF(nome);
}

const AJUSTE = {
  pt: {
    CONTRA_ATAQUE: "Adote o estilo Pressão para recuperar a bola mais cedo e cortar as transições, ou reforce a defesa investindo no Auxiliar Tático.",
    PRESSAO: "Adote o estilo Posse para cadenciar e escapar da pressão alta, e invista no Preparador Físico para sustentar a saída de bola.",
    POSSE: "Adote o estilo Pressão ou Contra-Ataque para roubar a bola do time de posse e puni-lo em transição rápida.",
    EQUILIBRADO: "Equilibre ataque e defesa; evolua o Auxiliar Tático para reforçar o atributo mais forte do seu elenco.",
  },
  en: {
    CONTRA_ATAQUE: "Adopt the Pressing style to win the ball back earlier and cut out transitions, or shore up the defense by investing in the Tactical Assistant.",
    PRESSAO: "Adopt the Possession style to dictate tempo and escape the high press, and invest in the Fitness Coach to sustain playing out from the back.",
    POSSE: "Adopt the Pressing or Counter-Attack style to steal the ball from the possession side and punish them on the break.",
    EQUILIBRADO: "Balance attack and defense; upgrade the Tactical Assistant to reinforce your squad's strongest attribute.",
  },
  es: {
    CONTRA_ATAQUE: "Adopta el estilo Presión para recuperar el balón antes y cortar las transiciones, o refuerza la defensa invirtiendo en el Asistente Táctico.",
    PRESSAO: "Adopta el estilo Posesión para marcar el tempo y escapar de la presión alta, e invierte en el Preparador Físico para sostener la salida de balón.",
    POSSE: "Adopta el estilo Presión o Contraataque para robar el balón al equipo de posesión y castigarlo en transición rápida.",
    EQUILIBRADO: "Equilibra ataque y defensa; evoluciona el Asistente Táctico para reforzar el atributo más fuerte de tu plantilla.",
  },
};

export function ajusteRecomendacao(perfil, idioma) {
  return (AJUSTE[normalizarIdioma(idioma)] || AJUSTE.pt)[perfil] || AJUSTE.pt[perfil];
}