import type { Metadata } from 'next'
import { StaticPage } from '@/components/layout/static-page'

export const metadata: Metadata = { title: 'Privacidade' }

export default function PrivacidadePage() {
  return (
    <StaticPage title="Política de Privacidade" subtitle="Quais dados coletamos e por quê">
      <p>
        Este é um texto-base do scaffold. Antes de colocar a plataforma no ar, submeta-o a
        revisão jurídica e adeque-o à LGPD (Lei nº 13.709/2018) e à realidade do seu
        tratamento de dados.
      </p>

      <h2>Dados que coletamos</h2>
      <p>
        Dados de cadastro (nome, e-mail, instituição, ORCID quando informado); conteúdo que
        você publica (arquivos, títulos, resumos, comentários e avaliações); metadados
        técnicos dos arquivos enviados (autor, datas e programa produtor, extraídos do próprio
        documento); e registros de uso necessários à segurança do serviço.
      </p>

      <h2>Por que tratamos esses dados</h2>
      <p>
        Para operar a plataforma, atribuir autoria corretamente, executar a verificação de
        originalidade e exibir a produção de cada pesquisador. As buscas feitas no Buscador de
        Referências ficam registradas na sua conta para que você possa retomá-las.
      </p>

      <h2>Compartilhamento com terceiros</h2>
      <p>
        O tema que você digita no Buscador de Referências é enviado ao provedor de modelo de
        linguagem e ao provedor de busca na web configurados pela plataforma, exclusivamente
        para executar aquela consulta. Arquivos publicados ficam armazenados no provedor de
        storage configurado.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados. A
        exclusão da conta remove seus arquivos do storage; críticas já publicadas podem ser
        mantidas de forma anonimizada para preservar a integridade do registro de revisão.
      </p>
    </StaticPage>
  )
}
