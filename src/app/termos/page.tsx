import type { Metadata } from 'next'
import { StaticPage } from '@/components/layout/static-page'

export const metadata: Metadata = { title: 'Termos de uso' }

export default function TermosPage() {
  return (
    <StaticPage title="Termos de Uso" subtitle="Regras de publicação e responsabilidades">
      <p>
        Este é um texto-base do scaffold. Submeta-o a revisão jurídica antes de operar a
        plataforma publicamente.
      </p>

      <h2>Autoria e direitos</h2>
      <p>
        Você mantém todos os direitos sobre o que publica. Ao publicar, concede ao Epignose
        licença não exclusiva para hospedar, exibir e disponibilizar o arquivo para download
        pelos demais usuários. Você declara ter autorização para publicar o documento e para
        conceder essa licença.
      </p>

      <h2>Originalidade</h2>
      <p>
        É vedado publicar trabalho de terceiros como se fosse seu. A plataforma recusa
        automaticamente documentos idênticos a outros já publicados e sinaliza similaridade
        parcial relevante. Plágio confirmado leva à retratação da publicação e pode levar ao
        encerramento da conta.
      </p>

      <h2>Conduta na revisão</h2>
      <p>
        Críticas devem seguir as Diretrizes de revisão. Comentários com ataque pessoal,
        assédio ou desinformação deliberada são removidos.
      </p>

      <h2>Limitação de responsabilidade</h2>
      <p>
        O conteúdo publicado é de responsabilidade de quem o publica. A plataforma não realiza
        curadoria editorial prévia e não endossa as conclusões dos trabalhos hospedados. As
        respostas do Buscador de Referências são geradas por modelo de linguagem e devem ser
        conferidas na fonte original antes de qualquer uso acadêmico.
      </p>
    </StaticPage>
  )
}
