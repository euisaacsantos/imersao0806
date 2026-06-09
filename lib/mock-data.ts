export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DELETED'
export type BudgetType = 'CBO' | 'ABO'

export interface AdData {
  id: string
  name: string
  status: CampaignStatus
  spend: number
  impressions: number
  clicks: number
  reach: number
  cpm: number
  sales: number
  profit: number
  roas: number
  instagram_url: string
}

export interface AdSetData {
  id: string
  name: string
  status: CampaignStatus
  budget: number
  budget_type: 'ABO'
  spend: number
  impressions: number
  clicks: number
  reach: number
  cpm: number
  sales: number
  profit: number
  roas: number
  ads: AdData[]
}

export interface CampaignData {
  id: string
  name: string
  status: CampaignStatus
  budget: number
  budget_type: BudgetType
  spend: number
  impressions: number
  clicks: number
  reach: number
  cpm: number
  sales: number
  profit: number
  roas: number
  adsets: AdSetData[]
}

export interface SalesByHour {
  hour: string
  sales: number
  revenue: number
}

export interface FunnelStep {
  name: string
  value: number
  revenue?: number
  conversionRate?: number
}

export interface PaymentMethod {
  name: string
  value: number
  count: number
  color: string
}

export interface KPIData {
  investment: number
  costPerSaleMeta: number
  costPerSaleDb: number
  salesCount: number
  profit: number
  roas: number
}

export const mockKPIData: KPIData = {
  investment: 15420.50,
  costPerSaleMeta: 48.19,
  costPerSaleDb: 45.06,
  salesCount: 320,
  profit: 28950.0,
  roas: 2.88,
}

export const mockFunnelData: FunnelStep[] = [
  { name: 'Cliques', value: 12712 },
  { name: 'LP Views', value: 11872, conversionRate: 93.4 },
  { name: 'Iniciar Compra', value: 2887, conversionRate: 24.3 },
  { name: 'Vendas', value: 609, conversionRate: 21.1, revenue: 13535 },
  { name: 'Bumps', value: 300, conversionRate: 49.3, revenue: 14100 },
  { name: 'Upsells', value: 8, conversionRate: 2.7, revenue: 3176 },
]

export const mockPaymentMethods: PaymentMethod[] = [
  { name: 'PIX', value: 42, count: 134, color: '#ff6500' },
  { name: 'Cartão Crédito', value: 38, count: 122, color: '#ff8c42' },
  { name: 'Boleto', value: 12, count: 38, color: '#ffb380' },
  { name: 'Cartão Débito', value: 8, count: 26, color: '#ffd4b8' },
]

export const mockSalesByHour: SalesByHour[] = [
  { hour: '00h', sales: 2, revenue: 390 },
  { hour: '01h', sales: 1, revenue: 195 },
  { hour: '02h', sales: 0, revenue: 0 },
  { hour: '03h', sales: 0, revenue: 0 },
  { hour: '04h', sales: 1, revenue: 195 },
  { hour: '05h', sales: 2, revenue: 390 },
  { hour: '06h', sales: 5, revenue: 975 },
  { hour: '07h', sales: 8, revenue: 1560 },
  { hour: '08h', sales: 14, revenue: 2730 },
  { hour: '09h', sales: 22, revenue: 4290 },
  { hour: '10h', sales: 28, revenue: 5460 },
  { hour: '11h', sales: 31, revenue: 6045 },
  { hour: '12h', sales: 25, revenue: 4875 },
  { hour: '13h', sales: 20, revenue: 3900 },
  { hour: '14h', sales: 24, revenue: 4680 },
  { hour: '15h', sales: 27, revenue: 5265 },
  { hour: '16h', sales: 30, revenue: 5850 },
  { hour: '17h', sales: 26, revenue: 5070 },
  { hour: '18h', sales: 22, revenue: 4290 },
  { hour: '19h', sales: 19, revenue: 3705 },
  { hour: '20h', sales: 16, revenue: 3120 },
  { hour: '21h', sales: 12, revenue: 2340 },
  { hour: '22h', sales: 7, revenue: 1365 },
  { hour: '23h', sales: 4, revenue: 780 },
]

export const mockCampaigns: CampaignData[] = [
  {
    id: 'camp_001',
    name: 'CONVERSÃO | BRASIL | FAIXA ETÁRIA 25-45 | INTERESSE EMPREENDEDORISMO | CBO - COMPRA',
    status: 'ACTIVE',
    budget: 500,
    budget_type: 'CBO',
    spend: 8240.30,
    impressions: 312000,
    clicks: 5890,
    reach: 258000,
    cpm: 26.41,
    sales: 178,
    profit: 16020,
    roas: 2.94,
    adsets: [
      {
        id: 'adset_001',
        name: 'LOOKALIKE 1% | COMPRADORES 180D | BRASIL | 25-45',
        status: 'ACTIVE',
        budget: 200,
        budget_type: 'ABO',
        spend: 3240.10,
        impressions: 122000,
        clicks: 2310,
        reach: 101000,
        cpm: 26.56,
        sales: 72,
        profit: 6480,
        roas: 2.99,
        ads: [
          {
            id: 'ad_001',
            name: 'CRIATIVO_VIDEO_DEPOIMENTO_MARIA_FINAL_V3_1080x1920',
            status: 'ACTIVE',
            spend: 1820.50,
            impressions: 68000,
            clicks: 1290,
            reach: 56500,
            cpm: 26.77,
            sales: 41,
            profit: 3690,
            roas: 3.02,
            instagram_url: 'https://www.instagram.com/reel/mock_001/',
          },
          {
            id: 'ad_002',
            name: 'CRIATIVO_VIDEO_PROVA_SOCIAL_RESULTADOS_V2_1080x1920',
            status: 'PAUSED',
            spend: 1419.60,
            impressions: 54000,
            clicks: 1020,
            reach: 44500,
            cpm: 26.29,
            sales: 31,
            profit: 2790,
            roas: 2.96,
            instagram_url: 'https://www.instagram.com/reel/mock_002/',
          },
        ],
      },
      {
        id: 'adset_002',
        name: 'INTERESSES | MARKETING DIGITAL | NEGÓCIOS ONLINE | BRASIL | 28-50',
        status: 'ACTIVE',
        budget: 150,
        budget_type: 'ABO',
        spend: 2680.40,
        impressions: 101000,
        clicks: 1910,
        reach: 83500,
        cpm: 26.54,
        sales: 58,
        profit: 5220,
        roas: 2.94,
        ads: [
          {
            id: 'ad_003',
            name: 'CRIATIVO_CARROSSEL_BENEFICIOS_5CARDS_FINAL_V1',
            status: 'ACTIVE',
            spend: 1540.20,
            impressions: 58000,
            clicks: 1100,
            reach: 47800,
            cpm: 26.55,
            sales: 34,
            profit: 3060,
            roas: 2.98,
            instagram_url: 'https://www.instagram.com/p/mock_003/',
          },
          {
            id: 'ad_004',
            name: 'CRIATIVO_IMAGEM_COPY_GANCHO_FORTE_VERSAO_B',
            status: 'ACTIVE',
            spend: 1140.20,
            impressions: 43000,
            clicks: 810,
            reach: 35700,
            cpm: 26.52,
            sales: 24,
            profit: 2160,
            roas: 2.89,
            instagram_url: 'https://www.instagram.com/p/mock_004/',
          },
        ],
      },
      {
        id: 'adset_003',
        name: 'RETARGETING | VISITANTES LP 30D | ABANDONOU CHECKOUT | BRASIL',
        status: 'PAUSED',
        budget: 100,
        budget_type: 'ABO',
        spend: 2319.80,
        impressions: 89000,
        clicks: 1670,
        reach: 73500,
        cpm: 26.07,
        sales: 48,
        profit: 4320,
        roas: 2.86,
        ads: [
          {
            id: 'ad_005',
            name: 'RETARGETING_VIDEO_URGENCIA_24H_OFERTA_FINAL_V2',
            status: 'PAUSED',
            spend: 2319.80,
            impressions: 89000,
            clicks: 1670,
            reach: 73500,
            cpm: 26.07,
            sales: 48,
            profit: 4320,
            roas: 2.86,
            instagram_url: 'https://www.instagram.com/reel/mock_005/',
          },
        ],
      },
    ],
  },
  {
    id: 'camp_002',
    name: 'CONVERSÃO | BRASIL + SP + RJ | PÚBLICO FRIO | LOOKALIKE COMPRADORES + ENGAJAMENTO 60D | ABO',
    status: 'ACTIVE',
    budget: 300,
    budget_type: 'ABO',
    spend: 5240.20,
    impressions: 198000,
    clicks: 3750,
    reach: 164000,
    cpm: 26.46,
    sales: 112,
    profit: 10080,
    roas: 2.92,
    adsets: [
      {
        id: 'adset_004',
        name: 'LAL 2% | ENGAJADOS PÁGINA 60D | SP + RJ | 22-40',
        status: 'ACTIVE',
        budget: 150,
        budget_type: 'ABO',
        spend: 2760.10,
        impressions: 104000,
        clicks: 1970,
        reach: 86200,
        cpm: 26.54,
        sales: 59,
        profit: 5310,
        roas: 2.92,
        ads: [
          {
            id: 'ad_006',
            name: 'CRIATIVO_VIDEO_PROBLEMA_SOLUCAO_STORY_9X16_V4',
            status: 'ACTIVE',
            spend: 1480.60,
            impressions: 56000,
            clicks: 1060,
            reach: 46300,
            cpm: 26.44,
            sales: 32,
            profit: 2880,
            roas: 2.94,
            instagram_url: 'https://www.instagram.com/reel/mock_006/',
          },
          {
            id: 'ad_007',
            name: 'CRIATIVO_VIDEO_ANTES_DEPOIS_TRANSFORMACAO_V1',
            status: 'ACTIVE',
            spend: 1279.50,
            impressions: 48000,
            clicks: 910,
            reach: 39900,
            cpm: 26.65,
            sales: 27,
            profit: 2430,
            roas: 2.89,
            instagram_url: 'https://www.instagram.com/reel/mock_007/',
          },
        ],
      },
      {
        id: 'adset_005',
        name: 'INTERESSES AMPLO | EMPREENDEDORES | RENDA EXTRA | BRASIL INTERIOR | 30-55',
        status: 'ACTIVE',
        budget: 150,
        budget_type: 'ABO',
        spend: 2480.10,
        impressions: 94000,
        clicks: 1780,
        reach: 77800,
        cpm: 26.38,
        sales: 53,
        profit: 4770,
        roas: 2.93,
        ads: [
          {
            id: 'ad_008',
            name: 'CRIATIVO_IMAGEM_ESTATISTICA_RESULTADO_COMPROVADO_V3',
            status: 'ACTIVE',
            spend: 1240.05,
            impressions: 47000,
            clicks: 890,
            reach: 38900,
            cpm: 26.38,
            sales: 27,
            profit: 2430,
            roas: 2.96,
            instagram_url: 'https://www.instagram.com/p/mock_008/',
          },
          {
            id: 'ad_009',
            name: 'CRIATIVO_VIDEO_DEPOIMENTO_JOAO_60S_REELS_FINAL',
            status: 'PAUSED',
            spend: 1240.05,
            impressions: 47000,
            clicks: 890,
            reach: 38900,
            cpm: 26.38,
            sales: 26,
            profit: 2340,
            roas: 2.89,
            instagram_url: 'https://www.instagram.com/reel/mock_009/',
          },
        ],
      },
    ],
  },
  {
    id: 'camp_003',
    name: 'TRÁFEGO | BRASIL | PÚBLICO FRIO AMPLO | TESTE CRIATIVOS NOVOS NOVEMBRO | ABO - LINK CLICK',
    status: 'PAUSED',
    budget: 100,
    budget_type: 'ABO',
    spend: 1940.00,
    impressions: 73500,
    clicks: 1390,
    reach: 60800,
    cpm: 26.39,
    sales: 30,
    profit: 2700,
    roas: 2.39,
    adsets: [
      {
        id: 'adset_006',
        name: 'TESTE A/B | CRIATIVOS NOVOS NOVEMBRO | AMPLO | BRASIL | 18-65',
        status: 'PAUSED',
        budget: 100,
        budget_type: 'ABO',
        spend: 1940.00,
        impressions: 73500,
        clicks: 1390,
        reach: 60800,
        cpm: 26.39,
        sales: 30,
        profit: 2700,
        roas: 2.39,
        ads: [
          {
            id: 'ad_010',
            name: 'NOVO_CRIATIVO_CONCEITO_AUTORIDADE_HOOK_V1_FEED_1080x1080',
            status: 'PAUSED',
            spend: 970.00,
            impressions: 36700,
            clicks: 695,
            reach: 30400,
            cpm: 26.43,
            sales: 15,
            profit: 1350,
            roas: 2.39,
            instagram_url: 'https://www.instagram.com/p/mock_010/',
          },
          {
            id: 'ad_011',
            name: 'NOVO_CRIATIVO_STORYTELLING_JORNADA_HERO_V1_REELS_9X16',
            status: 'PAUSED',
            spend: 970.00,
            impressions: 36800,
            clicks: 695,
            reach: 30400,
            cpm: 26.36,
            sales: 15,
            profit: 1350,
            roas: 2.39,
            instagram_url: 'https://www.instagram.com/reel/mock_011/',
          },
        ],
      },
    ],
  },
]
