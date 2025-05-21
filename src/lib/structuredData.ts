import type { CollectionEntry } from 'astro:content'
import type { Article, Person, WebSite, WithContext } from 'schema-dts'

import { projectMetaData } from './metaData'

export const mainWebsite: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: import.meta.env.SITE,
  name: 'Lynn Theophene - Personal Website',
  description:
    `I blend design and engineering to build meaningful tech. A software developer with a builder's mindset, based in India.`,
  inLanguage: 'en_US'
}

export const projectWebsite: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: `${import.meta.env.SITE}/projects/`,
  name: 'Projects',
  description: projectMetaData.description,
  inLanguage: 'en_US'
}

export const personSchema: WithContext<Person> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lynn Theophene',
  url: 'https://beetroot7.netlify.app/',
  // image: `${import.meta.env.SITE}${avatar.src}`,
  sameAs: [
    //'https://www.twitter.com/lynntheophene',  #edit when you have a twitter
    'https://www.instagram.com/theophene.lynn/',
    'https://www.linkedin.com/in/lynntheophene/'
  ],
  jobTitle: 'Software engineer'
  // worksFor: {
  //   '@type': 'Organization',
  //   name: 'modb',
  //   url: 'https://modb.com',
  // },
}

export function getProjectSchema(post: CollectionEntry<'projects'>) {
  const articleStructuredData: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.data.title,
    url: `${import.meta.env.SITE}/projects/${post.id}/`,
    image: {
      '@type': 'ImageObject',
      url: `${import.meta.env.SITE}${post.data.heroImage.src}/`
    },
    description: post.data.description,
    // datePublished
    publisher: personSchema,
    author: personSchema
  }
  return articleStructuredData
}
