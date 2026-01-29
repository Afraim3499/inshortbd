import { Database } from '@/types/database.types'
import { getSiteUrl } from '@/lib/env'
import { detectLocationFromTags } from '@/utils/location'

// Unified Graph Helper
const getGraph = (nodes: any[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes
})

type Post = Database['public']['Tables']['posts']['Row']

interface StructuredDataProps {
  post: Post
  authorName?: string
  authorId?: string
  siteUrl?: string
  mentions?: { name: string; url: string }[]
}

export function ArticleStructuredData({
  post,
  authorName,
  authorId,
  siteUrl,
  mentions,
}: StructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()
  const fullImageUrl = post.featured_image_url
    ? post.featured_image_url.startsWith('http')
      ? post.featured_image_url
      : `${finalSiteUrl}${post.featured_image_url}`
    : `${finalSiteUrl}/og-image.jpg`

  const articleUrl = `${finalSiteUrl}/news/${post.slug}`

  const articleNode = {
    '@type': 'NewsArticle',
    '@id': `${articleUrl}/#article`,
    isPartOf: {
      '@id': `${finalSiteUrl}/#website`
    },
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.published_at || post.created_at,
    dateModified: (post as any).updated_at || post.published_at || post.created_at,
    image: [fullImageUrl],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    publisher: {
      '@id': `${finalSiteUrl}/#organization`
    },
    author: authorName ? {
      '@type': 'Person',
      name: authorName,
      url: authorId
        ? `${finalSiteUrl}/author/${authorId}`
        : `${finalSiteUrl}/author/${encodeURIComponent(authorName.toLowerCase().replace(/\s+/g, '-'))}`,
    } : undefined,
    speakable: {
      '@type': 'SpeakableSpecification',
      xpath: [
        "/html/head/title",
        "/html/head/meta[@name='description']/@content"
      ]
    },
    articleSection: post.category,
    keywords: post.tags ? post.tags.join(', ') : undefined,
    inLanguage: 'bn-BD',
    dateline: detectLocationFromTags(post.tags),
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@id': `${finalSiteUrl}/#organization`
    },
    about: mentions && mentions.length > 0 ? mentions.map(m => ({
      '@type': 'Thing',
      name: m.name,
      sameAs: m.url
    })) : undefined,
    isAccessibleForFree: true,
  }

  const faqNode = {
    '@type': 'FAQPage',
    '@id': `${articleUrl}/#faq`,
    mainEntity: [{
      '@type': 'Question',
      name: `What is the latest news about ${post.title}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: post.excerpt || ''
      }
    }]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getGraph([articleNode, faqNode])) }}
    />
  )
}

interface OrganizationStructuredDataProps {
  siteUrl?: string
}

export function OrganizationStructuredData({
  siteUrl,
}: OrganizationStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()

  const orgNode = {
    '@type': 'NewsMediaOrganization',
    '@id': `${finalSiteUrl}/#organization`,
    name: 'Inshort',
    alternateName: 'Inshort BD',
    url: finalSiteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${finalSiteUrl}/inshort-logo.png`,
      width: 512,
      height: 512,
    },
    slogan: 'Concise. Accurate. Breaking. Global news for the modern reader.',
    sameAs: [
      'https://x.com/InshortBD',
      'https://www.instagram.com/inshortbangladesh/',
      'https://facebook.com/bdinshort',
      'https://www.linkedin.com/company/inshortbd/',
      'https://www.youtube.com/@InShort-k1p',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'afraim.afraim99@gmail.com',
      contactType: 'editorial',
      areaServed: 'Worldwide',
    },
    foundingDate: '2024',
    knowsAbout: ['Finance', 'Economics', 'Journalism', 'Global Markets', 'Technology', 'Politics'],
    correctionsPolicy: `${finalSiteUrl}/publication-policy#corrections`,
    publishingPrinciples: `${finalSiteUrl}/publication-policy`,
    masthead: `${finalSiteUrl}/about`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getGraph([orgNode])) }}
    />
  )
}

interface WebSiteStructuredDataProps {
  siteUrl?: string
}

export function WebSiteStructuredData({
  siteUrl,
}: WebSiteStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()

  const websiteNode = {
    '@type': 'WebSite',
    '@id': `${finalSiteUrl}/#website`,
    url: finalSiteUrl,
    name: 'Inshort',
    publisher: {
      '@id': `${finalSiteUrl}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${finalSiteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getGraph([websiteNode])) }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: { name: string; url: string }[]
  siteUrl?: string
}

export function BreadcrumbStructuredData({
  items,
  siteUrl,
}: BreadcrumbStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${finalSiteUrl}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface CollectionPageStructuredDataProps {
  name: string
  description?: string
  url: string
  siteUrl?: string
  hasPart?: string[]
}

export function CollectionPageStructuredData({
  name,
  description,
  url,
  siteUrl,
  hasPart
}: CollectionPageStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: `${finalSiteUrl}${url}`,
    publisher: {
      '@id': `${finalSiteUrl}/#organization`
    },
    inLanguage: 'bn-BD',
  }

  if (hasPart && hasPart.length > 0) {
    structuredData.hasPart = hasPart.map(partUrl => ({
      '@type': 'WebPage',
      '@id': partUrl.startsWith('http') ? partUrl : `${finalSiteUrl}${partUrl}`
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface DatasetStructuredDataProps {
  name: string
  description: string
  url: string
  license?: string
  siteUrl?: string
}

export function DatasetStructuredData({
  name,
  description,
  url,
  license,
  siteUrl
}: DatasetStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: name,
    description: description,
    url: `${finalSiteUrl}${url}`,
    license: license || `${finalSiteUrl}/terms-of-service`,
    creator: {
      '@id': `${finalSiteUrl}/#organization`
    },
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'Inshort Finance Hub'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ClaimReviewStructuredDataProps {
  claim: string
  claimant: string
  status: 'True' | 'False' | 'Mixed' | 'Pending'
  url: string
  authorName?: string
  siteUrl?: string
  datePublished: string
}

export function ClaimReviewStructuredData({
  claim,
  claimant,
  status,
  url,
  siteUrl,
  datePublished
}: ClaimReviewStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()

  const ratingMap = {
    'True': 5,
    'False': 1,
    'Mixed': 3,
    'Pending': 0
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    datePublished: datePublished,
    url: `${finalSiteUrl}${url}`,
    author: {
      '@id': `${finalSiteUrl}/#organization`
    },
    claimReviewed: claim,
    itemReviewed: {
      '@type': 'Claim',
      author: {
        '@type': 'Person',
        name: claimant
      },
      datePublished: datePublished
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingMap[status],
      bestRating: 5,
      worstRating: 1,
      alternateName: status
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ProfilePageStructuredDataProps {
  name: string
  description?: string
  image?: string
  url: string
  siteUrl?: string
}

export function ProfilePageStructuredData({
  name,
  description,
  image,
  url,
  siteUrl,
}: ProfilePageStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: name,
      description: description,
      image: image,
    },
    url: `${finalSiteUrl}${url}`,
    inLanguage: 'bn-BD',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface LocalBusinessStructuredDataProps {
  siteUrl?: string
}

export function LocalBusinessStructuredData({
  siteUrl,
}: LocalBusinessStructuredDataProps) {
  const finalSiteUrl = siteUrl || getSiteUrl()

  // Replaced LocalBusiness with NewsMediaOrganization globally (handled above), 
  // but kept this export to prevent breaking imports, redirecting to Org schema.
  return <OrganizationStructuredData siteUrl={siteUrl} />
}
