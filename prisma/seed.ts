import { PrismaClient } from '@prisma/client'
import { createHash } from 'node:crypto'

// ---------------------------------------------------------------------------
// SEED — popula o banco com pesquisadores e artigos de exemplo.
//
// Rode com:  npm run db:seed
// Requer DATABASE_URL configurada e as tabelas criadas (npm run db:push).
// ---------------------------------------------------------------------------

const prisma = new PrismaClient()

const fakeHash = (seed: string) => createHash('sha256').update(seed).digest('hex')

async function main() {
  console.log('Limpando dados anteriores…')
  await prisma.referenceResult.deleteMany()
  await prisma.referenceSearch.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.like.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.user.deleteMany()

  console.log('Criando pesquisadores…')
  const mariana = await prisma.user.create({
    data: {
      email: 'mariana.ferraz@exemplo.edu.br',
      handle: 'mariferraz',
      name: 'Mariana Ferraz',
      institution: 'USP — Faculdade de Direito',
      field: 'Direito Processual',
      bio: 'Pesquiso automação e devido processo legal. Doutora em Direito Processual pela USP.',
      role: 'REVIEWER',
      orcid: '0000-0002-1825-0097',
    },
  })

  const rafael = await prisma.user.create({
    data: {
      email: 'rafael.okamoto@exemplo.edu.br',
      handle: 'r_okamoto',
      name: 'Rafael Okamoto',
      institution: 'UNICAMP — Instituto de Computação',
      field: 'Inteligência Artificial',
      bio: 'NLP aplicado a documentos jurídicos. Eficiência de modelos sob restrição de custo.',
      role: 'REVIEWER',
    },
  })

  const helena = await prisma.user.create({
    data: {
      email: 'helena.duarte@exemplo.edu.br',
      handle: 'helenaduarte',
      name: 'Helena Duarte',
      institution: 'FGV Direito Rio',
      field: 'Regulação e Políticas Públicas',
      bio: 'Avaliação de impacto regulatório em mercados financeiros.',
    },
  })

  console.log('Criando artigos…')
  const post = await prisma.post.create({
    data: {
      title:
        'Inteligência artificial na tomada de decisão judicial: limites do devido processo legal',
      abstract:
        'Este artigo examina o uso de sistemas preditivos na fundamentação de decisões judiciais brasileiras a partir da Resolução CNJ nº 332/2020. A pesquisa combina análise documental de 74 projetos de IA em tribunais estaduais com entrevistas semiestruturadas junto a magistrados. Os resultados indicam que a opacidade algorítmica compromete o dever de fundamentação do art. 489 do CPC, e propõe-se um protocolo de auditabilidade em três camadas como condição de validade do ato decisório assistido por IA.',
      content:
        'Conteúdo completo extraído do PDF. Em produção, este campo recebe o texto real devolvido por src/lib/extract.ts no momento do upload.',
      fileUrl: 'https://exemplo.supabase.co/storage/v1/object/public/artigos/exemplo.pdf',
      fileKey: 'seed/ia-decisao-judicial.pdf',
      fileName: 'ia-decisao-judicial-ferraz-2026.pdf',
      fileType: 'PDF',
      fileSize: 2_411_724,
      pageCount: 32,
      fileHash: fakeHash('post-1'),
      contentHash: fakeHash('post-1-content'),
      similarityScore: 3.2,
      docAuthor: 'Mariana Ferraz',
      docProducer: 'LaTeX with hyperref',
      docCreatedAt: new Date('2026-02-11T09:14:00Z'),
      doi: '10.1234/epignose.2026.0031',
      authorId: mariana.id,
      viewCount: 8_940,
      downloadCount: 1_126,
      tags: {
        create: [
          { slug: 'direito-processual', label: 'Direito Processual' },
          { slug: 'inteligencia-artificial', label: 'Inteligência Artificial' },
          { slug: 'devido-processo-legal', label: 'Devido Processo Legal' },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title:
        'Destilação de modelos de linguagem para triagem processual: ganho de acurácia sob restrição de custo',
      abstract:
        'Avaliamos a destilação de um modelo de 70B parâmetros para 7B aplicada à classificação de petições iniciais em 14 classes processuais. Com 41 mil documentos anonimizados do TJSP, o modelo destilado alcança 0,91 de F1 macro contra 0,93 do professor, a 6% do custo de inferência. Discutimos o trade-off entre fidelidade e custo em contextos de orçamento público limitado.',
      fileUrl: 'https://exemplo.supabase.co/storage/v1/object/public/artigos/destilacao.pdf',
      fileKey: 'seed/destilacao.pdf',
      fileName: 'destilacao-triagem-processual.pdf',
      fileType: 'PDF',
      fileSize: 1_887_436,
      pageCount: 18,
      fileHash: fakeHash('post-2'),
      contentHash: fakeHash('post-2-content'),
      authorId: rafael.id,
      viewCount: 5_210,
      downloadCount: 743,
      tags: {
        connectOrCreate: [
          {
            where: { slug: 'inteligencia-artificial' },
            create: { slug: 'inteligencia-artificial', label: 'Inteligência Artificial' },
          },
          { where: { slug: 'legaltech' }, create: { slug: 'legaltech', label: 'LegalTech' } },
        ],
      },
    },
  })

  console.log('Criando revisão por pares…')
  const critique = await prisma.comment.create({
    data: {
      kind: 'METHODOLOGY',
      body: 'Excelente recorte. Uma questão sobre a amostra: os 22 magistrados vêm de 9 tribunais, mas o texto não informa a distribuição por tribunal. Se houver concentração em dois ou três, a conclusão da seção 4 fica sensível a cultura institucional local.',
      quotedText:
        'Entre os magistrados entrevistados, 17 dos 22 declararam não conseguir descrever como o sistema chegava à sugestão apresentada.',
      pageNumber: 14,
      upvotes: 34,
      postId: post.id,
      authorId: rafael.id,
    },
  })

  await prisma.comment.create({
    data: {
      kind: 'COMMENT',
      body: 'Ponto justo, Rafael. A distribuição está no apêndice B. Vou trazer para o corpo do texto na próxima versão e incluir o controle por tribunal.',
      upvotes: 12,
      postId: post.id,
      authorId: mariana.id,
      parentId: critique.id,
    },
  })

  await prisma.rating.createMany({
    data: [
      { postId: post.id, userId: rafael.id, score: 5, rigor: 5, originality: 4, clarity: 5 },
      { postId: post.id, userId: helena.id, score: 4, rigor: 4, originality: 5, clarity: 4 },
    ],
  })

  await prisma.like.createMany({
    data: [
      { postId: post.id, userId: rafael.id },
      { postId: post.id, userId: helena.id },
    ],
  })

  console.log('Seed concluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
