import type { ArticlePost, Author, PeerComment, ReferenceSearchResult } from '@/types'

// ---------------------------------------------------------------------------
// DADOS DE DEMONSTRACAO
//
// A aplicacao sobe e navega sem banco, sem storage e sem chaves de IA usando
// estes dados. Assim que voce preencher DATABASE_URL no .env, as queries reais
// (src/lib/queries.ts) assumem o lugar destes mocks automaticamente.
// ---------------------------------------------------------------------------

export const currentUser: Author = {
  id: 'u0',
  name: 'Carlos Lustosa',
  handle: 'carloslustosa',
  avatarUrl: null,
  institution: 'Universidade Federal do Ceará',
  field: 'Direito e Tecnologia',
}

const authors: Author[] = [
  {
    id: 'u1',
    name: 'Mariana Ferraz',
    handle: 'mariferraz',
    avatarUrl: null,
    institution: 'USP — Faculdade de Direito',
    field: 'Direito Processual',
    verified: true,
  },
  {
    id: 'u2',
    name: 'Rafael Okamoto',
    handle: 'r_okamoto',
    avatarUrl: null,
    institution: 'UNICAMP — Instituto de Computação',
    field: 'Inteligência Artificial',
    verified: true,
  },
  {
    id: 'u3',
    name: 'Helena Duarte',
    handle: 'helenaduarte',
    avatarUrl: null,
    institution: 'FGV Direito Rio',
    field: 'Regulação e Políticas Públicas',
  },
  {
    id: 'u4',
    name: 'Tiago Mendes',
    handle: 'tiagomendes',
    avatarUrl: null,
    institution: 'UFMG — Departamento de Filosofia',
    field: 'Ética Aplicada',
  },
]

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

export const mockPosts: ArticlePost[] = [
  {
    id: 'p1',
    title:
      'Inteligência artificial na tomada de decisão judicial: limites do devido processo legal',
    abstract:
      'Este artigo examina o uso de sistemas preditivos na fundamentação de decisões judiciais brasileiras a partir da Resolução CNJ nº 332/2020. A pesquisa combina análise documental de 74 projetos de IA em tribunais estaduais com entrevistas semiestruturadas junto a magistrados. Os resultados indicam que a opacidade algorítmica compromete o dever de fundamentação do art. 489 do CPC, e propõe-se um protocolo de auditabilidade em três camadas como condição de validade do ato decisório assistido por IA.',
    author: authors[0],
    tags: [
      { slug: 'direito-processual', label: 'Direito Processual' },
      { slug: 'inteligencia-artificial', label: 'Inteligência Artificial' },
      { slug: 'devido-processo-legal', label: 'Devido Processo Legal' },
    ],
    fileType: 'PDF',
    fileName: 'ia-decisao-judicial-ferraz-2026.pdf',
    fileUrl: '#',
    fileSize: 2_411_724,
    pageCount: 32,
    doi: '10.1234/epignose.2026.0031',
    status: 'PUBLISHED',
    publishedAt: hoursAgo(5),
    likeCount: 284,
    commentCount: 41,
    downloadCount: 1_126,
    viewCount: 8_940,
    ratingAverage: 4.6,
    ratingCount: 23,
    content: null,
  },
  {
    id: 'p2',
    title:
      'Destilação de modelos de linguagem para triagem processual: ganho de acurácia sob restrição de custo',
    abstract:
      'Avaliamos a destilação de um modelo de 70B parâmetros para 7B aplicada à classificação de petições iniciais em 14 classes processuais. Com 41 mil documentos anonimizados do TJSP, o modelo destilado alcança 0,91 de F1 macro contra 0,93 do professor, a 6% do custo de inferência. Discutimos o trade-off entre fidelidade e custo em contextos de orçamento público limitado.',
    author: authors[1],
    tags: [
      { slug: 'nlp', label: 'Processamento de Linguagem Natural' },
      { slug: 'inteligencia-artificial', label: 'Inteligência Artificial' },
      { slug: 'legaltech', label: 'LegalTech' },
    ],
    fileType: 'PDF',
    fileName: 'destilacao-triagem-processual.pdf',
    fileUrl: '#',
    fileSize: 1_887_436,
    pageCount: 18,
    doi: '10.1234/epignose.2026.0028',
    status: 'PUBLISHED',
    publishedAt: hoursAgo(19),
    likeCount: 156,
    commentCount: 27,
    downloadCount: 743,
    viewCount: 5_210,
    ratingAverage: 4.8,
    ratingCount: 16,
    content: null,
  },
  {
    id: 'p3',
    title:
      'Sandbox regulatório e inovação financeira: uma avaliação de impacto do modelo brasileiro (2020-2025)',
    abstract:
      'A pesquisa mede os efeitos do sandbox regulatório da CVM e do Banco Central sobre a entrada de novas instituições no mercado de crédito. Utilizando diferenças-em-diferenças com 312 firmas tratadas, encontramos aumento de 23% na taxa de entrada, sem elevação estatisticamente significativa de inadimplência no horizonte de 36 meses.',
    author: authors[2],
    tags: [
      { slug: 'regulacao', label: 'Regulação' },
      { slug: 'direito-economico', label: 'Direito Econômico' },
      { slug: 'fintech', label: 'Fintech' },
    ],
    fileType: 'DOCX',
    fileName: 'sandbox-regulatorio-avaliacao.docx',
    fileUrl: '#',
    fileSize: 984_221,
    pageCount: null,
    doi: null,
    status: 'PUBLISHED',
    publishedAt: hoursAgo(31),
    likeCount: 98,
    commentCount: 12,
    downloadCount: 402,
    viewCount: 3_018,
    ratingAverage: 4.2,
    ratingCount: 9,
    content: null,
  },
  {
    id: 'p4',
    title: 'Responsabilidade moral distribuída em sistemas autônomos: para além do "gap de responsabilidade"',
    abstract:
      'O argumento do "responsibility gap" sustenta que ninguém pode ser legitimamente responsabilizado por danos causados por sistemas autônomos. Este trabalho reconstrói o argumento em três premissas e mostra que a segunda delas — a exigência de controle direto — é inconsistente com práticas consolidadas de responsabilização coletiva. Propõe-se um modelo de responsabilidade distribuída por papéis.',
    author: authors[3],
    tags: [
      { slug: 'etica', label: 'Ética Aplicada' },
      { slug: 'filosofia-da-tecnologia', label: 'Filosofia da Tecnologia' },
    ],
    fileType: 'PDF',
    fileName: 'responsabilidade-distribuida.pdf',
    fileUrl: '#',
    fileSize: 1_204_998,
    pageCount: 24,
    doi: '10.1234/epignose.2026.0019',
    status: 'PUBLISHED',
    publishedAt: hoursAgo(52),
    likeCount: 211,
    commentCount: 34,
    downloadCount: 890,
    viewCount: 6_401,
    ratingAverage: 4.4,
    ratingCount: 19,
    content: null,
  },
]

/** Corpo do artigo usado na pagina de leitura (ArticleView). */
export const mockArticleBody = `
## 1. Introdução

A incorporação de sistemas de inteligência artificial ao Poder Judiciário brasileiro deixou de ser hipótese prospectiva. Levantamento do Conselho Nacional de Justiça identificou, até dezembro de 2025, 74 projetos em produção ou em fase piloto nos tribunais estaduais, federais e trabalhistas. A maior parte deles atua em atividades-meio — triagem, classificação processual, detecção de processos correlatos. Um subconjunto menor, porém crescente, produz insumos que ingressam diretamente na fundamentação da decisão.

É sobre esse subconjunto que este artigo se debruça. A pergunta que orienta a pesquisa é estreita e deliberadamente jurídica: em que condições o uso de um sistema preditivo na formação do convencimento judicial é compatível com o dever de fundamentação estabelecido pelo art. 489, §1º, do Código de Processo Civil?

## 2. O dever de fundamentação como restrição técnica

A doutrina processual costuma tratar a fundamentação como exigência argumentativa dirigida ao juiz. A tese aqui defendida é que, quando há mediação algorítmica, essa exigência se converte também em requisito de arquitetura do sistema. Não basta que o magistrado explicite as razões; é preciso que o sistema torne acessíveis os elementos sobre os quais aquelas razões se apoiam.

> A opacidade não é um defeito acidental de certos modelos. Em arquiteturas baseadas em aprendizado profundo, ela é consequência estrutural do modo como a função de decisão é aprendida.

Essa constatação tem uma implicação prática relevante: a escolha do modelo deixa de ser decisão puramente técnica da área de TI do tribunal e passa a ser questão de validade do ato processual.

## 3. Metodologia

A pesquisa combinou duas frentes. A primeira consistiu em análise documental dos 74 projetos mapeados, com leitura dos respectivos termos de referência, editais de contratação e relatórios de avaliação. A segunda frente reuniu entrevistas semiestruturadas com 22 magistrados de 9 tribunais, conduzidas entre março e setembro de 2025.

O roteiro das entrevistas buscou identificar, em particular, se os magistrados conseguiam reconstruir o percurso que levava o sistema a sugerir determinado resultado — e, em caso negativo, como isso afetava o uso que faziam da sugestão.

## 4. Resultados

Dos 74 projetos analisados, 19 produzem saídas que ingressam na fundamentação. Destes, apenas 4 oferecem qualquer forma de explicação da saída ao usuário final. Em 3 casos, a explicação se limitava à exibição dos processos mais similares utilizados como referência.

Entre os magistrados entrevistados, 17 dos 22 declararam não conseguir descrever como o sistema chegava à sugestão apresentada. Chama atenção que 12 desses 17 relataram, ainda assim, considerar a sugestão em sua decisão — o que configura exatamente a situação que o art. 489 busca evitar.

## 5. Protocolo de auditabilidade em três camadas

Diante desse quadro, propõe-se um protocolo estruturado em três camadas de exigência crescente, conforme o grau de interferência do sistema na decisão.

A primeira camada, de **rastreabilidade**, exige registro imutável de qual versão do modelo produziu qual saída, para qual processo, em qual momento. A segunda, de **justificação local**, exige que o sistema apresente os fatores que mais contribuíram para aquela saída específica. A terceira, de **contestabilidade**, exige que a parte possa impugnar especificamente o insumo algorítmico, com direito a reexame humano integral.

## 6. Conclusão

A compatibilidade entre inteligência artificial e devido processo legal não se resolve no plano dos princípios. Ela depende de decisões concretas de arquitetura, tomadas no momento da contratação e do desenho do sistema. O protocolo proposto oferece um critério operacional para essas decisões, sem exigir do magistrado competência técnica que ele não tem nem precisa ter.
`.trim()

export const mockComments: PeerComment[] = [
  {
    id: 'c1',
    kind: 'METHODOLOGY',
    body: 'Excelente recorte. Uma questão sobre a amostra: os 22 magistrados vêm de 9 tribunais, mas o texto não informa a distribuição por tribunal. Se houver concentração em dois ou três, a conclusão da seção 4 sobre a prática decisória fica sensível a cultura institucional local. Vale reportar a distribuição e, se possível, rodar a análise controlando por tribunal.',
    author: authors[1],
    createdAt: hoursAgo(3),
    upvotes: 34,
    isResolved: false,
    quotedText:
      'Entre os magistrados entrevistados, 17 dos 22 declararam não conseguir descrever como o sistema chegava à sugestão apresentada.',
    pageNumber: 14,
    replies: [
      {
        id: 'c1r1',
        kind: 'COMMENT',
        body: 'Ponto justo, Rafael. A distribuição está no apêndice B (TJSP 6, TJRJ 4, TRF3 3, demais 1-2 cada). Vou trazer para o corpo do texto na próxima versão e incluir o controle por tribunal.',
        author: authors[0],
        createdAt: hoursAgo(2),
        upvotes: 12,
        isResolved: false,
        replies: [],
      },
    ],
  },
  {
    id: 'c2',
    kind: 'CONSTRUCTIVE',
    body: 'A terceira camada do protocolo — contestabilidade — é a mais promissora e a menos desenvolvida do artigo. Ela esbarra em um problema prático: a parte precisa saber que houve insumo algorítmico para poder impugná-lo. Sem um dever de disclosure explícito, a camada 3 é inoperante. Sugiro dialogar com o art. 22 do GDPR, que enfrenta exatamente esse desenho.',
    author: authors[2],
    createdAt: hoursAgo(8),
    upvotes: 51,
    isResolved: true,
    replies: [],
  },
  {
    id: 'c3',
    kind: 'REFERENCE_REQUEST',
    body: 'A afirmação de que a opacidade é "consequência estrutural" das arquiteturas profundas merece referência. Rudin (2019) defende posição oposta — que modelos interpretáveis alcançam desempenho equivalente em domínios estruturados, e que a opacidade é escolha, não necessidade. Enfrentar esse contraponto fortaleceria a seção 2.',
    author: authors[3],
    createdAt: hoursAgo(26),
    upvotes: 28,
    isResolved: false,
    quotedText:
      'A opacidade não é um defeito acidental de certos modelos. Em arquiteturas baseadas em aprendizado profundo, ela é consequência estrutural',
    pageNumber: 7,
    replies: [],
  },
]

export const trendingTopics = [
  { slug: 'inteligencia-artificial', label: 'Inteligência Artificial', posts: 1_284, growth: '+18%' },
  { slug: 'direito-processual', label: 'Direito Processual', posts: 892, growth: '+7%' },
  { slug: 'saude-publica', label: 'Saúde Pública', posts: 741, growth: '+12%' },
  { slug: 'mudancas-climaticas', label: 'Mudanças Climáticas', posts: 655, growth: '+23%' },
  { slug: 'educacao-basica', label: 'Educação Básica', posts: 512, growth: '+4%' },
]

export const suggestedResearchers: Author[] = authors.slice(0, 3)

/** Resultado de demonstracao do Buscador de Referencias IA. */
export const mockReferenceSearch: ReferenceSearchResult = {
  id: 'rs-demo',
  topic: 'Aplicação da IA na tomada de decisão judicial',
  isDemo: true,
  summary:
    'O debate brasileiro sobre IA no Judiciário se organiza em torno de três eixos: a Resolução CNJ nº 332/2020, que fixa parâmetros de governança; a discussão doutrinária sobre compatibilidade entre opacidade algorítmica e o dever de fundamentação do art. 489 do CPC; e a produção empírica recente que mede efeitos de ferramentas preditivas sobre tempo de tramitação. A literatura internacional converge na exigência de explicabilidade, mas diverge sobre se ela deve ser requisito de validade ou apenas de boa prática.',
  expandedQueries: [
    'Resolução CNJ 332/2020 inteligência artificial Poder Judiciário',
    'jurisprudência STJ STF decisão judicial algoritmo fundamentação',
    'doutrina dever de fundamentação art. 489 CPC inteligência artificial',
    'explainable AI judicial decision making due process',
    'IA tribunais brasileiros produtividade estudo empírico',
  ],
  model: 'gpt-4o',
  durationMs: 14_320,
  createdAt: new Date().toISOString(),
  results: [
    {
      id: 'r1',
      kind: 'LEGISLATION',
      title: 'Resolução CNJ nº 332, de 21 de agosto de 2020',
      url: 'https://atos.cnj.jus.br/atos/detalhar/3429',
      source: 'Conselho Nacional de Justiça',
      publishedAt: '2020-08-21',
      authors: [],
      summary:
        'Norma que dispõe sobre ética, transparência e governança na produção e uso de inteligência artificial no Poder Judiciário. Estabelece exigências de não discriminação, publicidade dos modelos em uso, controle do usuário e prestação de contas, além de criar o dever de que sistemas de IA sejam sempre auxiliares à decisão humana.',
      relevance:
        'Esta é a norma-base de qualquer trabalho sobre IA na decisão judicial brasileira: é dela que se extrai o parâmetro normativo contra o qual as práticas dos tribunais devem ser medidas. Para a sua pesquisa, o art. 7º (não discriminação) e o art. 17 (controle do usuário) sustentam diretamente a tese de que a IA não pode substituir o juízo humano. Ela cabe no referencial normativo da sua introdução e serve de critério para a análise empírica: cada projeto de tribunal pode ser avaliado quanto à aderência aos artigos citados. Note que a Resolução não define sanção pelo descumprimento — essa lacuna é, por si só, um achado que a sua discussão pode explorar.',
      relevanceScore: 96,
      citationAbnt:
        'CONSELHO NACIONAL DE JUSTIÇA. Resolução nº 332, de 21 de agosto de 2020. Brasília: CNJ, 2020.',
    },
    {
      id: 'r2',
      kind: 'ARTICLE',
      title: 'Stop explaining black box machine learning models for high stakes decisions',
      url: 'https://www.nature.com/articles/s42256-019-0048-x',
      source: 'Nature Machine Intelligence',
      publishedAt: '2019-05-13',
      authors: ['Cynthia Rudin'],
      summary:
        'Rudin argumenta que, em decisões de alto risco, explicações post-hoc de modelos opacos são não confiáveis por construção, e que modelos interpretáveis por desenho alcançam desempenho equivalente em domínios com dados estruturados. O artigo documenta casos de justiça criminal, incluindo o COMPAS, em que a explicação post-hoc divergia do comportamento real do modelo.',
      relevance:
        'Este artigo é o contraponto mais forte disponível à premissa de que a opacidade seria inevitável — premissa que costuma aparecer implicitamente em trabalhos sobre IA judicial. Se a sua pesquisa defende exigências de explicabilidade, Rudin permite radicalizar o argumento: não se trata de exigir explicação de um modelo opaco, mas de vedar o uso de modelos opacos nessa aplicação. É material para a seção de referencial teórico e, sobretudo, para a discussão, onde você pode confrontar a solução de auditabilidade com a alternativa mais radical da interpretabilidade nativa. O caso COMPAS descrito no texto também fornece o exemplo empírico estrangeiro que dialoga com os seus dados brasileiros.',
      relevanceScore: 92,
      citationAbnt:
        'RUDIN, Cynthia. Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead. Nature Machine Intelligence, v. 1, p. 206-215, 2019.',
    },
    {
      id: 'r3',
      kind: 'JURISPRUDENCE',
      title: 'STJ — Dever de fundamentação e nulidade da decisão: REsp 1.919.550/SP',
      url: 'https://scon.stj.jus.br',
      source: 'Superior Tribunal de Justiça',
      publishedAt: '2021-06-15',
      authors: [],
      summary:
        'Acórdão que reafirma a exigência do art. 489, §1º, do CPC: decisão que não enfrenta os argumentos deduzidos capazes de infirmar a conclusão do julgador é nula. A Corte detalha o padrão de suficiência da fundamentação, exigindo demonstração do percurso lógico que conecta as premissas ao dispositivo.',
      relevance:
        'O valor desta decisão para a sua pesquisa está no padrão de suficiência que ela fixa: se a fundamentação exige explicitar o percurso lógico, um insumo algorítmico cujo percurso é inacessível não pode integrar esse percurso sem comprometer a validade do ato. É a ponte jurisprudencial que transforma a sua discussão técnica sobre opacidade em argumento de nulidade processual — provavelmente o passo mais importante da sua tese. Use-a na seção em que você converte o dever de fundamentação em requisito de arquitetura do sistema, e confira decisões posteriores que citem este precedente para verificar se algum tribunal já aplicou o raciocínio a caso com mediação algorítmica.',
      relevanceScore: 89,
      citationAbnt:
        'BRASIL. Superior Tribunal de Justiça. Recurso Especial nº 1.919.550/SP. Relator: Min. Nancy Andrighi. Brasília, 15 jun. 2021.',
    },
    {
      id: 'r4',
      kind: 'DOCTRINE',
      title: 'Tecnologia e Processo: a automação da atividade judicial e seus limites',
      url: 'https://www.revistadeprocesso.com.br',
      source: 'Revista de Processo (RePro)',
      publishedAt: '2023-03-01',
      authors: ['Dierle Nunes', 'Ana Luiza Rodrigues'],
      summary:
        'Os autores mapeiam as formas de automação já presentes no processo civil brasileiro e propõem uma taxonomia por grau de interferência na decisão, distinguindo automação de atividade-meio, de suporte decisório e de decisão propriamente dita. Defendem que cada grau exige salvaguardas processuais distintas.',
      relevance:
        'A taxonomia por grau de interferência é diretamente reutilizável na sua metodologia: ela oferece um critério já publicado e citável para separar, entre os projetos de tribunais que você analisa, aqueles cuja saída ingressa na fundamentação daqueles que operam só em atividade-meio. Isso resolve um problema de classificação que, feito por critério próprio, ficaria exposto à crítica de arbitrariedade. Além disso, a tese dos autores de que cada grau pede salvaguarda distinta é a base doutrinária brasileira mais próxima do seu protocolo de três camadas — vale posicionar explicitamente a sua proposta como desenvolvimento ou divergência em relação a eles.',
      relevanceScore: 87,
      citationAbnt:
        'NUNES, Dierle; RODRIGUES, Ana Luiza. Tecnologia e Processo: a automação da atividade judicial e seus limites. Revista de Processo, São Paulo, v. 337, p. 89-118, mar. 2023.',
    },
    {
      id: 'r5',
      kind: 'NEWS',
      title: 'Tribunais ampliam uso de IA, mas faltam regras sobre transparência dos modelos',
      url: 'https://www.conjur.com.br',
      source: 'Consultor Jurídico',
      publishedAt: '2025-11-08',
      authors: ['Redação ConJur'],
      summary:
        'Reportagem sobre o crescimento do número de ferramentas de IA em uso nos tribunais brasileiros, com dados do último levantamento do CNJ e declarações de gestores de TI de quatro tribunais estaduais. Registra que poucos tribunais publicam documentação técnica dos modelos contratados.',
      relevance:
        'Reportagens não sustentam argumento normativo, mas esta tem função específica no seu trabalho: ela fornece a evidência pública e datada de que a lacuna de transparência que você identifica nos 74 projetos não é achado isolado da sua amostra, e sim fenômeno já reconhecido publicamente pelo campo. Use-a na introdução, para justificar a relevância do problema, e como fonte complementar aos dados do CNJ. Atenção ao usá-la: as declarações dos gestores são material jornalístico, não devem substituir o dado primário do levantamento oficial que você já coletou.',
      relevanceScore: 68,
      citationAbnt:
        'CONSULTOR JURÍDICO. Tribunais ampliam uso de IA, mas faltam regras sobre transparência dos modelos. ConJur, 8 nov. 2025.',
    },
  ],
}
