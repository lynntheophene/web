import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

import { iconSchema } from './content/_icons'

      const blog_collection = defineCollection({
      loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
      schema: ({ image }) =>
      z.object({
      title: z.string(),
      description: z.string(),
      heroImage: image(), // <-- use image() here
      tags: z.array(z.string()).optional().default([]),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      readingTime: z.number().optional(),
      wordsCount: z.number().optional(),
      latestCommitUrl: z.string().optional()
    })
})

      const projects_collection = defineCollection({
        loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/projects' }),
        schema: ({ image }) =>
        z.object({
        year: z.number(),
        title: z.string(),
        htmlTitle: z.string().optional(),
        description: z.string(),
        heroImage: image(),
        heroImageAlign: z.enum(['top', 'center']).default('top'),
        links: z
          .array(
            z.object({
              icon: iconSchema,
              name: z.string(),
              url: z.string()
            })
          )
          .optional()
          .default([]),
        readingTime: z.number().optional(),
        wordsCount: z.number().optional(),
        updatedDate: z.coerce.date().optional(),
        latestCommitUrl: z.string().optional()
      })
      .transform((data) => ({
        ...data,
        htmlTitle: data.htmlTitle || data.title
      }))
})

export const collections = {
  blog : blog_collection,
  projects : projects_collection
}
