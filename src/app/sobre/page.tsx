import type { Metadata } from 'next'
import { StaticPage } from '@/components/layout/static-page'

export const metadata: Metadata = { title: 'Sobre' }

export default function SobrePage() {
  return (
    <StaticPage title="Sobre o Epignose" subtitle="O que a plataforma é e o que ela não é">
      <p>
        O Epignose é um repositório interativo de publicações acadêmicas. Pesquisadores
        publicam seus trabalhos em PDF ou DOCX, e cada publicação vira um objeto de debate
        aberto: qualquer pesquisador pode criticar o método, pedir uma referência, questionar
        uma conclusão ou avaliar o trabalho por critérios explícitos.
      </p>

      <h2>Por que revisão aberta</h2>
      <p>
        A revisão por pares tradicional é lenta e invisível. Um parecer valioso morre no
        arquivo da revista, e o leitor nunca sabe o que foi objetado nem como o autor
        respondeu. Aqui a crítica é pública, assinada e permanente — ela acompanha o artigo.
        O autor pode marcar uma crítica como endereçada, e essa troca fica no registro.
      </p>

      <h2>O que a plataforma não substitui</h2>
      <p>
        O Epignose não é uma revista e não confere indexação. Uma avaliação alta aqui não
        equivale a aprovação editorial. O que a plataforma oferece é circulação rápida e
        crítica qualificada antes, durante ou depois da submissão formal.
      </p>

      <h2>Originalidade</h2>
      <p>
        Todo arquivo enviado recebe uma assinatura SHA-256 e tem seu texto comparado com o
        acervo já publicado. Documentos idênticos são recusados; similaridade parcial acima do
        limiar fica sinalizada na publicação. Os metadados originais do arquivo — autor,
        data de criação, programa produtor — são preservados como registro de autoria.
      </p>
    </StaticPage>
  )
}
