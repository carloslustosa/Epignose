import type { Metadata } from 'next'
import { StaticPage } from '@/components/layout/static-page'

export const metadata: Metadata = { title: 'Diretrizes de revisão' }

export default function DiretrizesPage() {
  return (
    <StaticPage
      title="Diretrizes de revisão"
      subtitle="Como criticar um trabalho de forma útil"
    >
      <p>
        A qualidade da plataforma depende inteiramente da qualidade das críticas. Um
        comentário genérico ocupa espaço sem produzir informação. Estas diretrizes valem para
        toda crítica publicada aqui.
      </p>

      <h2>Seja específico</h2>
      <p>
        Aponte o trecho. Use a citação de trecho para amarrar sua crítica ao ponto exato do
        texto. &ldquo;A amostra parece pequena&rdquo; ajuda pouco; &ldquo;22 entrevistados
        distribuídos em 9 tribunais deixa 1 a 2 por instituição, o que torna a conclusão
        sensível à cultura local&rdquo; ajuda muito.
      </p>

      <h2>Separe o tipo de objeção</h2>
      <p>
        Um problema metodológico, um pedido de referência e uma discordância teórica pedem
        respostas diferentes do autor. Classifique sua crítica corretamente — isso permite que
        o autor priorize e que outros revisores encontrem o que procuram.
      </p>

      <h2>Proponha o conserto</h2>
      <p>
        Sempre que possível, diga o que tornaria o trabalho melhor. Uma objeção acompanhada de
        caminho é uma contribuição; uma objeção sozinha é apenas um obstáculo.
      </p>

      <h2>Critique o trabalho, não a pessoa</h2>
      <p>
        Ataques ao autor, insinuações sobre competência e ironia são removidos. Discordância
        forte é bem-vinda; desrespeito não.
      </p>

      <h2>Declare conflitos de interesse</h2>
      <p>
        Se você tem relação com o autor, com a instituição financiadora ou interesse
        comercial no resultado, diga isso na própria crítica.
      </p>
    </StaticPage>
  )
}
