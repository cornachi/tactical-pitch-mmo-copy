// Gera a "Voz da Torcida" — reação cômica e irônica pós-jogo, baseada nas
// estatísticas reais da partida. Conteúdo localizado (PT/EN/ES).

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

function norm(c) {
  const s = (c || "pt").toString().toLowerCase();
  if (s.startsWith("en")) return "en";
  if (s.startsWith("es")) return "es";
  return "pt";
}

function fmt(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? "" : vars[k]));
}

const VOZ = {
  pt: {
    goleada: [
      "Os torcedores vaiaram o time aos 30' do primeiro tempo e organizaram um churrasco do lado de fora do estádio antes do apito final.",
      "A torcida pediu autógrafos para o goleiro adversário — foi o único que teve trabalho na partida.",
      "Metade da arquibancada já estava no estacionamento quando o árbitro encerrou o massacre de {maior} a {menor}.",
      "Foi de lamber a badge: {maior} a {menor} e a torcida já ensaiando o \"olé\" no segundo tempo.",
    ],
    expulsao2: [
      "Tentar jogar com {n} a menos virou piada: a torcida sugeriu trocar o técnico por um aluno de kart — pelo menos lá 2 rodas funcionam.",
      "O árbitro distribuiu mais cartões do que a torcida distribuiu panfletos na entrada. Com {n} expulsões, o time virou piada pronta.",
      "Com {n} expulsões, a arquibancada gritou \"sobe o goleiro pra centroavante\" — e não era piada, era o plano de jogo. Sobrou {maior} na rede.",
      "O plantão de ambulância atendeu mais jogadores do que a cantina do estádio. O time tentou jogar deitado e levou {maior} a {menor} de cortesia.",
    ],
    expulsao1: [
      "Com um a menos, o time tentou virar herói de filme B — a torcida já pede a comédia na sequência.",
      "Jogar com 10 é feio; jogar com 10 e ainda retrancar é obra de arte moderna que a arquibancada não entendeu.",
      "Expulso e o técnico faz cara de quem previu tudo. A torcida respondeu com vaia prevista também.",
    ],
    vitSuada: [
      "A torcida comemora o resultado, mas 30% do estádio precisou de atendimento médico por ansiedade após a mudança de postura nos últimos 15 minutos!",
      "Vitória suada! A mudança de postura no 2º tempo levou {dom}% da torcida ao cardiofrequencímetro — e o resto à respiração ofegante.",
      "Ganhou, mas o técnico trocou de postura e o estádio trocou de remédio. {menor} a {maior} (para o lado certo).",
    ],
    empate: [
      "Empate que cheira a \"tudo bem, mas podia ser melhor\". A torcida foi embora reclamando do árbitro, como manda o figurino.",
      "Placar igualado, nervos à flor da pele. A torcida se dividiu entre os que vaiaram e os que aplaudiram a \"garra\".",
      "{ph} a {pa} e ninguém saiu feliz de verdade — só o vendedor de pipoca.",
    ],
    dominante: [
      "Domínio de {dom}%! A torcida chegou a cantar o hino da Copa antes do apito final — sobrou tempo e bola.",
      "Com {dom}% de posse/território, o adversário virou convidado da partida. A arquibancada gostou do show.",
      "{dom}% de dominância e o adversário sumiu do radar. A torcida aproveitou para tirar selfie.",
    ],
    equilibrado: [
      "Partida equilibrada que terminou em {ph} a {pa}. A torcida saiu com a sensação de \"era um jogo, ponto final\".",
      "Sem muitos motivos para lágrimas ou samba — {ph} a {pa} e a vida que segue.",
      "Jogo de meio-termo: {ph} a {pa}, aplausos educados e ar condicionado do estádio no talo.",
    ],
  },
  en: {
    goleada: [
      "The fans booed the team at 30' of the first half and organized a barbecue outside the stadium before the final whistle.",
      "The crowd asked the opposing keeper for autographs — he was the only one who actually had work to do.",
      "Half the stands were already in the parking lot when the referee ended the {maior}-{menor} rout.",
      "A thrashing to savor: {maior} to {menor} and the crowd already practicing the 'olé' in the second half.",
    ],
    expulsao2: [
      "Trying to play with {n} men down became a joke: the crowd suggested swapping the manager for a go-kart student — at least there two wheels work.",
      "The referee handed out more cards than the crowd handed out flyers at the gate. With {n} sendings-off, the team became a ready-made joke.",
      "With {n} red cards the stands screamed 'put the keeper up front' — and it wasn't a joke, it was the game plan. {maior} ended up in the net.",
      "The ambulance ward treated more players than the stadium canteen. The team tried to play lying down and took {maior} to {menor} as a courtesy.",
    ],
    expulsao1: [
      "Down to ten, the team tried to be the hero of a B-movie — the crowd now asks for the comedy sequel.",
      "Playing with 10 is ugly; playing with 10 and still parking the bus is modern art the stands didn't understand.",
      "Sent off and the manager makes the face of someone who saw it coming. The crowd replied with a predicted boo as well.",
    ],
    vitSuada: [
      "The crowd celebrates the result, but 30% of the stadium needed medical care for anxiety after the stance change in the last 15 minutes!",
      "Squeaky-bum win! The stance change in the 2nd half took {dom}% of the crowd to the heart-rate monitor — and the rest to panting breaths.",
      "Won, but the manager switched stance and the stadium switched medication. {menor} to {maior} (the right way).",
    ],
    empate: [
      "A draw that smells of 'it's fine, but it could've been better.' The crowd left complaining about the referee, as the script demands.",
      "Level scoreline, nerves on edge. The crowd split between those who booed and those who applauded the 'grit'.",
      "{ph} to {pa} and nobody left truly happy — except the popcorn vendor.",
    ],
    dominante: [
      "{dom}% dominance! The crowd even sang the Cup anthem before the final whistle — there was time and ball to spare.",
      "With {dom}% of possession/territory, the opponent became a guest of the match. The stands enjoyed the show.",
      "{dom}% dominance and the opponent vanished from the radar. The crowd took the chance to snap a selfie.",
    ],
    equilibrado: [
      "A balanced match that ended {ph} to {pa}. The crowd left with a feeling of 'it was a game, full stop.'",
      "Not much reason for tears or samba — {ph} to {pa} and life goes on.",
      "A middle-of-the-road game: {ph} to {pa}, polite applause and the stadium AC on full blast.",
    ],
  },
  es: {
    goleada: [
      "La afición abucheó al equipo a los 30' del primer tiempo y organizó un asado a las afueras del estadio antes del pitido final.",
      "La afición pidió autógrafos al portero rival — fue el único que tuvo trabajo en el partido.",
      "La mitad de la grada ya estaba en el aparcamiento cuando el árbitro puso fin a la goleada de {maior} a {menor}.",
      "Fue para relamerse: {maior} a {menor} y la afición ensayando el \"olé\" en el segundo tiempo.",
    ],
    expulsao2: [
      "Intentar jugar con {n} menos se volvió un chiste: la afición sugirió cambiar al técnico por un alumno de karting — al menos allá dos ruedas funcionan.",
      "El árbitro repartió más tarjetas que la afición panfletos en la entrada. Con {n} expulsiones, el equipo se volvió chiste listo.",
      "Con {n} expulsiones, la grada gritó \"sube al portero de delantero\" — y no era broma, era el plan de juego. Quedaron {maior} en la red.",
      "La sala de ambulancia atendió a más jugadores que la cantina del estadio. El equipo intentó jugar acostado y se llevó {maior} a {menor} de cortesía.",
    ],
    expulsao1: [
      "Con uno menos, el equipo intentó ser el héroe de una película B — la afición ya pide la comedia en secuela.",
      "Jugar con 10 es feo; jugar con 10 y aun así replegarse es arte moderno que la grada no entendió.",
      "Expulsado y el técnico pone cara de quien lo previó todo. La afición respondió con abucheó previsto también.",
    ],
    vitSuada: [
      "La afición celebra el resultado, pero el 30% del estadio necesitó atención médica por ansiedad tras el cambio de postura en los últimos 15 minutos.",
      "¡Victoria sufrida! El cambio de postura en el 2º tiempo llevó al {dom}% de la afición al monitor de frecuencia cardíaca — y al resto al jadeo.",
      "Ganó, pero el técnico cambió de postura y el estadio cambió de medicina. {menor} a {maior} (para el lado correcto).",
    ],
    empate: [
      "Un empate que huele a \"está bien, pero podría ser mejor\". La afición se fue quejándose del árbitro, como manda el figurín.",
      "Marcador igualado, nervios a flor de piel. La afición se dividió entre los que abuchearon y los que aplaudieron la \"garra\".",
      "{ph} a {pa} y nadie salió realmente feliz — salvo el vendedor de palomitas.",
    ],
    dominante: [
      "¡Dominio del {dom}%! La afición llegó a cantar el himno de la Copa antes del pitido final — sobró tiempo y balón.",
      "Con el {dom}% de posesión/territorio, el rival se convirtió en invitado del partido. La grada disfrutó el espectáculo.",
      "{dom}% de dominio y el rival desapareció del radar. La afición aprovechó para tomarse una selfie.",
    ],
    equilibrado: [
      "Partido equilibrado que terminó {ph} a {pa}. La afición se fue con la sensación de \"era un partido, punto final\".",
      "Sin muchos motivos para lágrimas ni samba — {ph} a {pa} y la vida que sigue.",
      "Partido de término medio: {ph} a {pa}, aplausos educados y el aire acondicionado del estadio a tope.",
    ],
  },
};

export function gerarVozTorcida(ctx = {}, idioma = "pt") {
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
  const vars = { n: nExpulsoes, maior, menor, dom: domMaior, ph: placarHome, pa: placarAway };
  const P = (VOZ[norm(idioma)] || VOZ.pt);

  let categoria;
  if (goleada) categoria = "goleada";
  else if (nExpulsoes >= 2) categoria = "expulsao2";
  else if (nExpulsoes === 1) categoria = "expulsao1";
  else if (!empate && mudou && diff <= 1) categoria = "vitSuada";
  else if (empate) categoria = "empate";
  else if (dominante) categoria = "dominante";
  else categoria = "equilibrado";

  return fmt(pick(P[categoria]), vars);
}