// Gera a "Voz da Torcida" — reação cômica e irônica pós-jogo, baseada nas
// estatísticas reais da partida (placar, dominância/posse, expulsões e
// mudança de postura no 2º tempo).
//
// ctx: {
//   placarHome, placarAway,
//   domHome, domAway,           // dominância percentual (0-100)
//   momentum,                   // array de blocos { inicio, fim, dominancia_pct: {home, away} }
//   expulsoes,                  // número OU array de lances/expulsões
// }

function contarExpulsoes(expulsoes) {
  if (typeof expulsoes === "number") return expulsoes;
  if (Array.isArray(expulsoes)) return expulsoes.length;
  return 0;
}

function mudouPosturaSegundoTempo(momentum) {
  if (!Array.isArray(momentum) || momentum.length < 2) return false;
  const p1 = momentum.filter((b) => (b.inicio ?? 0) < 45);
  const p2 = momentum.filter((b) => (b.inicio ?? 0) >= 45);
  if (!p1.length || !p2.length) return false;
  const avg = (arr) => arr.reduce((s, b) => s + (b.dominancia_pct?.home ?? 50), 0) / arr.length;
  return Math.abs(avg(p2) - avg(p1)) >= 20;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function gerarVozTorcida(ctx = {}) {
  const { placarHome = 0, placarAway = 0, domHome = 50, domAway = 50, momentum, expulsoes } = ctx;
  const diff = Math.abs(placarHome - placarAway);
  const empate = placarHome === placarAway;
  const goleada = diff >= 3;
  const domMaior = Math.max(domHome, domAway);
  const dominante = domMaior >= 75;
  const nExpulsoes = contarExpulsoes(expulsoes);
  const mudou = mudouPosturaSegundoTempo(momentum);
  const maior = Math.max(placarHome, placarAway);
  const menor = Math.min(placarHome, placarAway);

  if (goleada) {
    return pick([
      `Os torcedores vaiaram o time aos 30' do primeiro tempo e organizaram um churrasco do lado de fora do estádio antes do apito final.`,
      `A torcida pediu autógrafos para o goleiro adversário — foi o único que teve trabalho na partida.`,
      `Metade da arquibancada já estava no estacionamento quando o árbitro encerrou o massacre de ${maior} a ${menor}.`,
      `Foi de lamber a badge: ${maior} a ${menor} e a torcida já ensaiando o "olé" no segundo tempo.`,
    ]);
  }

  if (nExpulsoes >= 2) {
    return pick([
      `O árbitro distribuiu mais cartões hoje do que a torcida distribuiu panfletos na entrada do estádio.`,
      `Com ${nExpulsoes} expulsões, o jogo virou roleta russa — a torcida rezou mais do que torceu.`,
      `O plantão de ambulância atendeu mais jogadores do que a cantina do estádio. Sobrou ${maior} na rede.`,
    ]);
  }

  if (!empate && mudou && diff <= 1) {
    return pick([
      `A torcida comemora o resultado, mas 30% do estádio precisou de atendimento médico por ansiedade após a retranca/mudança de postura nos últimos 15 minutos!`,
      `Vitória suada! A mudança de postura no 2º tempo levou ${domMaior}% da torcida ao cardiofrequencímetro — e o resto à respiração ofegante.`,
      `Ganhou, mas o técnico trocou de postura e o estádio trocou de remédio. ${menor} a ${maior} (para o lado certo).`,
    ]);
  }

  if (empate) {
    return pick([
      `Empate que cheira a "tudo bem, mas podia ser melhor". A torcida foi embora reclamando do árbitro, como manda o figurino.`,
      `Placar igualado, nervos à flor da pele. A torcida se dividiu entre os que vaiaram e os que aplaudiram a "garra".`,
      `${placarHome} a ${placarAway} e ninguém saiu feliz de verdade — só o vendedor de pipoca.`,
    ]);
  }

  if (dominante) {
    return pick([
      `Domínio de ${domMaior}%! A torcida chegou a cantar o hino da Copa antes do apito final — sobrou tempo e bola.`,
      `Com ${domMaior}% de posse/território, o adversário virou convidado da partida. A arquibancada gostou do show.`,
      `${domMaior}% de dominância e o adversário sumiu do radar. A torcida aproveitou para tirar selfie.`,
    ]);
  }

  return pick([
    `Partida equilibrada que terminou em ${placarHome} a ${placarAway}. A torcida saiu com a sensação de "era um jogo, ponto final".`,
    `Sem muitos motivos para lágrimas ou samba — ${placarHome} a ${placarAway} e a vida que segue.`,
    `Jogo de meio-termo: ${placarHome} a ${placarAway}, aplausos educados e ar condicionado do estádio no talo.`,
  ]);
}