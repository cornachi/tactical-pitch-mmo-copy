import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClubeHeader from "@/components/clube/ClubeHeader";
import IdentidadeClube from "@/components/clube/IdentidadeClube";
import {
  ATRIBUTOS_INICIAIS,
  CATEGORIAS,
  CATEGORIA_POR_ATRIBUTO,
  CATEGORIA_DA_ESPECIALIZACAO,
  calcularCustoEvolucao,
} from "@/lib/tactical";

export default function Equipe() {
  const [clube, setClube] = useState(null);
  const [atributos, setAtributos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [evoluindo, setEvoluindo] = useState("");

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      const c = clubes[0];
      setClube(c);
      if (c) {
        const attrs = await base44.entities.AtributoTatico.filter({ clube_id: c.id });
        setAtributos(attrs);
      }
    } catch (e) {
      setErro(e.message || "Erro ao carregar equipe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const nivelDe = (nome) =>
    atributos.find((a) => a.nome_atributo === nome)?.nivel || 1;

  const evoluir = async (nome) => {
    setEvoluindo(nome);
    setErro("");
    try {
      await base44.functions.invoke("evoluirAtributo", {
        clube_id: clube.id,
        nome_atributo: nome,
      });
      await carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro ao evoluir atributo");
    } finally {
      setEvoluindo("");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (erro && !clube) return <div className="p-8 text-center text-destructive">{erro}</div>;
  if (!clube) return (
    <div className="p-8 text-center">
      <p className="mb-4 text-muted-foreground">Você ainda não tem um clube.</p>
      <Link to="/" className="text-primary underline">Voltar</Link>
    </div>
  );

  const catFav = CATEGORIA_DA_ESPECIALIZACAO[clube.especializacao];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Dashboard
      </Link>

      <ClubeHeader clube={clube} />
      <IdentidadeClube clube={clube} onSalvo={carregar} />

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {CATEGORIAS.map((cat) => (
        <div key={cat.key} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{cat.label}</h2>
            {catFav === cat.key && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                -10% (especialização)
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ATRIBUTOS_INICIAIS.filter((a) => a.categoria === cat.key).map((a) => {
              const nivel = nivelDe(a.nome);
              const custo = calcularCustoEvolucao(nivel, a.nome, clube.especializacao);
              const comDesconto = catFav === a.categoria;
              const podePagar = (clube.moedas || 0) >= custo;
              return (
                <Card key={a.nome} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">Nível {nivel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center text-sm font-medium">
                      <Coins className="w-4 h-4 mr-1 text-amber-500" />
                      {custo}
                      {comDesconto && <span className="text-emerald-600 text-xs ml-1">(-10%)</span>}
                    </span>
                    <Button
                      size="sm"
                      disabled={!podePagar || evoluindo === a.nome}
                      onClick={() => evoluir(a.nome)}
                    >
                      {evoluindo === a.nome ? "..." : "Evoluir"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}