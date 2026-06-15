import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(60, 'Description must be at least 60 chars for SEO scrapers'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Avinovo'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    heroImage: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    affiliate: z.boolean().default(false),
    pinTitle: z.string().optional(),
    pinAngles: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
