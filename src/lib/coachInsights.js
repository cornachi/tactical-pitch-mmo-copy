// Geração de recomendações do Coach Insight com base nos eventos/estatísticas
// da partida. Usa EXATAMENTE os nomes dos atributos e categorias do jogo
// (ver src/lib/tactical.js e base44/shared/tactical.ts).
//
// dados (normalizado): {
//   placar: { home, away }, xg: { home, away }, dominancia: { home, away },
//   posse: { home, away }, chutesGol: { home, away },
//   faltas: { home, away }, amarelos: { home, away }, vermelhos: { home, away },
//   atributos: [{ atributo, sucesso: { home, away } }],
//   momentum: [{ inicio, fim, dominancia_pct: { home, away }, eventos: [{ tipo, lado, minuto }] }],
// }
import { CATEGORIA_POR_ATRIBUTO } from "@/lib/tactical";

const FRASES = {
  pt: {
    pouca_criacao: "Pouca criação de jogadas e posse improdutiva — o time não consegue armar jogadas claras.",
    chute_sem_converter: "Muitos chutes a gol sem converter — aproveitamento ofensivo baixo.",
    pouco_perigo_bolas_paradas: "Pouco perigo criado em escanteios e faltas ofensivas.",
    dificuldade_passes: "Dificuldade para quebrar linhas adversárias com passes.",
    leitura_ruim: "Leitura de jogo ruim — erros no ritmo de ataque.",
    ca_lento: "Contra-ataques lentos ou ineficientes ao recuperar a bola.",
    opp_constroi: "O adversário constrói jogadas facilmente após recuperar a bola.",
    perda_duelos: "Perda frequente de divididas e confrontos individuais.",
    queda_fisico: "Queda drástica de rendimento e físico no 2º tempo.",
    amarelou: "O time 'amarelou' após sofrer gol ou teve queda mental.",
    gols_desorganizacao: "Gols sofridos por desorganização tática da linha defensiva.",
    opp_tempo_bola: "Jogadores adversários com muito tempo para pensar com a bola.",
    gols_bolas_paradas: "Gols sofridos em escanteios ou faltas alçadas na área.",
    bolas_costas: "Bolas enfiadas nas costas da zaga — falta de cobertura.",
    erros_fase_final: "Erros bobos e desatenção defensiva na fase final do jogo.",
  },
  en: {
    pouca_criacao: "Little chance creation and unproductive possession — the team can't build clear plays.",
    chute_sem_converter: "Many shots on target without converting — low offensive efficiency.",
    pouco_perigo_bolas_paradas: "Little danger created from corners and offensive free kicks.",
    dificuldade_passes: "Struggles to break the opposition lines with passes.",
    leitura_ruim: "Poor game reading — mistakes in the tempo of attack.",
    ca_lento: "Slow or inefficient counter-attacks when recovering the ball.",
    opp_constroi: "The opponent builds plays easily after winning the ball back.",
    perda_duelos: "Frequent losses of duels and individual confrontations.",
    queda_fisico: "Sharp drop in performance and physical level in the 2nd half.",
    amarelou: "The team 'bottled it' after conceding or had a mental drop.",
    gols_desorganizacao: "Goals conceded from defensive line disorganization.",
    opp_tempo_bola: "Opposition players with too much time on the ball.",
    gols_bolas_paradas: "Goals conceded from corners or crosses into the area.",
    bolas_costas: "Through balls behind the defensive line — lack of cover.",
    erros_fase_final: "Silly mistakes and defensive lapses in the final stage of the game.",
  },
  es: {
    pouca_criacao: "Poca creación de jugadas y posesión improductiva — el equipo no arma jugadas claras.",
    chute_sem_converter: "Muchos tiros a puerta sin convertir — bajo aprovechamiento ofensivo.",
    pouco_perigo_bolas_paradas: "Poco peligro creado en córners y faltas ofensivas.",
    dificuldade_passes: "Dificultad para romper líneas rivales con pases.",
    leitura_ruim: "Mala lectura de juego — errores en el ritmo de ataque.",
    ca_lento: "Contraataques lentos o ineficientes al recuperar el balón.",
    opp_constroi: "El rival construye jugadas con facilidad tras recuperar el balón.",
    perda_duelos: "Pérdida frecuente de duelos y confrontaciones individuales.",
    queda_fisico: "Caída drástica de rendimiento y físico en el 2º tiempo.",
    amarelou: "El equipo se 'amarronó' tras encajar o tuvo una bajada mental.",
    gols_desorganizacao: "Goles encajados por desorganización táctica de la línea defensiva.",
    opp_tempo_bola: "Jugadores rivales con mucho tiempo para pensar con el balón.",
    gols_bolas_paradas: "Goles encajados en córners o faltas al área.",
    bolas_costas: "Pases filtrados a la espalda de la zaga — falta de cobertura.",
    erros_fase_final: "Errores tontos y desatención defensiva en la fase final del partido.",
  },
};

function langOf(idioma) {
  const c = (idioma || "pt").toString().toLowerCase();
  if (c.startsWith("en")) return "en";
  if (c.startsWith("es")) return "es";
  return "pt";
}

export function gerarRecomendacoesCoach(dados, viewerSide = "home", idioma = "pt") {
  const lang = langOf(idioma);
  const F = FRASES[lang];
  const me = viewerSide === "away" ? "away" : "home";
  const opp = me === "home" ? "away" : "home";

  const v = (obj, side) => (obj && typeof obj[side] === "number" ? obj[side] : 0);
  const placarMe = v(dados.placar, me);
  const placarOpp = v(dados.placar, opp);
  const xgMe = v(dados.xg, me);
  const xgOpp = v(dados.xg, opp);
  const domMe = v(dados.dominancia, me) || 50;
  const domOpp = v(dados.dominancia, opp) || 50;
  const posseMe = v(dados.posse, me) || 50;
  const posseOpp = v(dados.posse, opp) || 50;
  const chutesGolMe = v(dados.chutesGol, me);
  const faltasMe = v(dados.faltas, me);
  const faltasOpp = v(dados.faltas, opp);
  const amarelosMe = v(dados.amarelos, me);
  const vermelhosMe = v(dados.vermelhos, me);

  const attrsMap = {};
  (dados.atributos || []).forEach((a) => {
    if (a && a.atributo) attrsMap[a.atributo] = a.sucesso?.[me] ?? null;
  });
  const succ = (nome) => attrsMap[nome];
  const fraco = (nome) => {
    const s = succ(nome);
    return s != null && s < 45;
  };

  const mom = dados.momentum || [];
  const avgDom = (arr) =>
    arr.length ? arr.reduce((s, b) => s + (b.dominancia_pct?.[me] ?? 50), 0) / arr.length : 50;
  const domPrim = avgDom(mom.slice(0, 3));
  const domFin = avgDom(mom.slice(3));
  const queda2t = mom.length >= 4 && domPrim - domFin >= 12;
  const golSofrido2t = mom.some(
    (b) => (b.inicio ?? 0) >= 46 &&
      (b.eventos || []).some((e) => e.tipo === "gol" && e.lado === opp)
  );

  const recs = [];
  const add = (id, ...atributos) => {
    for (const nome of atributos) {
      if (!recs.some((r) => r.atributo === nome)) {
        recs.push({ id, problema: F[id], atributo: nome, categoria: CATEGORIA_POR_ATRIBUTO[nome] });
      }
    }
  };

  // 1. Possession & Build-up
  if (posseMe < 45 || (xgMe < 1.0 && chutesGolMe <= 2)) {
    add("pouca_criacao", "Organização Ofensiva", "Ataque Posicional");
  }
  if (chutesGolMe >= 5 && placarMe <= 2) {
    add("chute_sem_converter", "Eficácia de Finalização");
  }
  if (faltasMe <= 2) {
    add("pouco_perigo_bolas_paradas", "Bolas Paradas Ofensivas");
  }
  if (fraco("Passe Entre Linhas")) {
    add("dificuldade_passes", "Passe Entre Linhas");
  }
  if (fraco("Leitura de Jogo")) {
    add("leitura_ruim", "Leitura de Jogo");
  }

  // 2. Transition & Counter-Attack
  if (fraco("Transição Ofensiva")) {
    add("ca_lento", "Transição Ofensiva");
  }
  if (domOpp > 55 || posseOpp > 58) {
    add("opp_constroi", "Transição Defensiva (Perda-Pressiona)", "Intensidade de Pressão");
  }
  if (fraco("Força de Duelo Individual")) {
    add("perda_duelos", "Força de Duelo Individual");
  }
  if (queda2t) {
    add("queda_fisico", "Resistência Física");
  }
  if (amarelosMe >= 3 || vermelhosMe >= 1) {
    add("amarelou", "Liderança / Resiliência");
  }

  // 3. Pressing & Tackling
  if (placarOpp >= 2) {
    add("gols_desorganizacao", "Organização Defensiva");
  }
  if (posseOpp > 58) {
    add("opp_tempo_bola", "Pressão no Portador", "Defesa de Funil");
  }
  if (faltasOpp >= 4 && placarOpp >= 1) {
    add("gols_bolas_paradas", "Bolas Paradas Defensivas");
  }
  if (xgOpp >= 1.8 || fraco("Bloco Baixo / Cobertura")) {
    add("bolas_costas", "Bloco Baixo / Cobertura");
  }
  if (golSofrido2t) {
    add("erros_fase_final", "Concentração Tática");
  }

  return recs;
}