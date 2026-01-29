/**
 * Content Templates for Inshort
 * Templates are stored as Tiptap JSON structures
 */

export interface Template {
  id: string
  name: string
  description: string
  category: 'Standard' | 'Breaking News' | 'Feature' | 'Analysis' | 'Interview' | 'Finance' | 'List' | 'Opinion'
  content: any // Tiptap JSON structure
}

/**
 * Standard News Article Template
 */
const standardNewsTemplate: Template = {
  id: 'standard-news',
  name: 'Standard News Article',
  description: 'Traditional news article format with headline, lead, and body paragraphs',
  category: 'Standard',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[LEAD PARAGRAPH - Answers: Who, What, When, Where, Why, How. Keep it punchy and direct.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[CONTEXT - Why does this matter? Provide immediate background.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[DETAILS - Expand on the event with key specifics.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[QUOTE - "Insert a direct quote from a primary source here to add authority."]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[IM pact - What are the immediate consequences or next steps?]',
          },
        ],
      },
    ],
  },
}

/**
 * Breaking News Template (Inverted Pyramid)
 */
const breakingNewsTemplate: Template = {
  id: 'breaking-news',
  name: 'Breaking News',
  description: 'Urgent, high-impact format. Facts first, context second.',
  category: 'Breaking News',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'DATELINE: [CITY] - ',
          },
          {
            type: 'text',
            text: '[LEAD: One sentence summary of the breaking event. Must including the most critical new fact.]',
          }
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Key Details' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Fact 1: The most important number or outcome]' }] }]
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Fact 2: Who is affected]' }] }]
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Fact 3: Immediate response/action]' }] }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Situation' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Brief paragraph explaining the current situation in more detail. Use verified information only.]' }],
      },
      {
        type: 'blockquote',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '"Insert official statement or primary source quote here."' }] }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Market Impact' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Short analysis of how this affects the sector, market, or community. Keep it objective.]' }],
      },
    ],
  },
}

/**
 * Financial Deep Dive Template
 */
const financeDeepDiveTemplate: Template = {
  id: 'finance-deep-dive',
  name: 'Financial Deep Dive',
  description: 'In-depth market analysis with bull/bear cases and data visualization placeholders.',
  category: 'Finance',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Executive Summary' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Verdict: BUY / SELL / HOLD. Summarize the investment thesis in 2-3 sentences.]' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '___INSERT_STOCK_CHART_OR_TICKER_HERE___' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Bull Case 🐂' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Why will this asset appreciate? Focus on growth drivers, competitive advantage, or macro tailwinds.]' }],
      },
      {
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Catalyst 1]' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Catalyst 2]' }] }] }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Bear Case 🐻' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[What are the risks? Valuation concerns, regulatory headwinds, or execution risk.]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Key Metrics' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Insert Table: Month / Revenue / EPS / YOY Growth]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Expert Verdict' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Final conclusion and price target horizon.]' }],
      },
    ],
  },
}

/**
 * Listicle / Round-Up Template
 */
const listicleTemplate: Template = {
  id: 'listicle',
  name: 'Round-Up / List',
  description: 'Scannable format for "Top 5", "Best of", or features lists. Optimized for engagement.',
  category: 'List',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[INTRO: Hook the reader. Why do they need this list? What criteria did you use?]' }],
      },
      // Item 1
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. [Item Name]' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '___INSERT_IMAGE_HERE___' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Why it made the list' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Description of the key features and benefits.]' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'The Verdict' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Who is this for? Best for X, Avoid if Y.]' }],
      },
      // Item 2
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. [Item Name]' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Repeat structure...]' }],
      },
      // Comparison
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Summary Comparison' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Insert comparison table if applicable]' }],
      },
    ],
  },
}

/**
 * Opinion / Editorial Template
 */
const opinionTemplate: Template = {
  id: 'opinion',
  name: 'Opinion / Op-Ed',
  description: 'Persuasive format for thought leadership. Focus on argument flow and voice.',
  category: 'Opinion',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[THE HOOK: Start with a provocative statement or personal anecdote.]' }],
      },
      {
        type: 'blockquote',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '"[PULL QUOTE: A powerful, standalone sentence that summarizes the central tension.]"' }] }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Core Argument' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[State your thesis clearly. What is the conventional wisdom, and why is it wrong?]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Evidence' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Support your claim with data, history, or logic.]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Counter-Point' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Address the strongest argument against you. Steelman the opposition, then dismantle it.]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'What Needs to Happen' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[CALL TO ACTION: What should the reader do, think, or change? End on a high note.]' }],
      },
    ],
  },
}

/**
 * Feature Article Template
 */
const featureTemplate: Template = {
  id: 'feature',
  name: 'Feature Article',
  description: 'Long-form storytelling. Narrative arc with chapters.',
  category: 'Feature',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[SCENE SETTER: Drop the reader into a specific moment. Sensory details.]' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[NUT GRAF: The "Why are we reading this?" paragraph. Connect the scene to the bigger picture.]' }],
      },
      {
        type: 'horizontalRule'
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Chapter I: The Origin' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Background and history...]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Chapter II: The Conflict' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[The core tension or problem...]' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Chapter III: The Resolution' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Where do we go from here?]' }],
      },
    ],
  },
}

/**
 * Interview Template
 */
const interviewTemplate: Template = {
  id: 'interview',
  name: 'Interview / Q&A',
  description: 'Formatted Q&A with introduction and context.',
  category: 'Interview',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Introduction' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '[Who is the guest? Why are they relevant now?]' }]
      },
      {
        type: 'horizontalRule'
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Inshort: ' }, { type: 'text', text: '[First Question...]' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: '[Guest Name]: ' }, { type: 'text', text: '[Answer...]' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'italic' }], text: '[Contextual Note: Add background info here if needed to explain the answer.]' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Inshort: ' }, { type: 'text', text: '[Second Question...]' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: '[Guest Name]: ' }, { type: 'text', text: '[Answer...]' }]
      },
    ]
  }
}

/**
 * All available templates
 */
export const templates: Template[] = [
  standardNewsTemplate,
  breakingNewsTemplate,
  financeDeepDiveTemplate,
  listicleTemplate,
  opinionTemplate,
  featureTemplate,
  interviewTemplate
]

/**
 * Get all templates
 */
export function getAllTemplates(): Template[] {
  return templates
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: Template['category']): Template[] {
  return templates.filter((t) => t.category === category)
}

/**
 * Get template categories
 */
export function getTemplateCategories(): Template['category'][] {
  return Array.from(new Set(templates.map((t) => t.category)))
}
