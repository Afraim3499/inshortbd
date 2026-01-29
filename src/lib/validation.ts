import { z } from 'zod';

const TITLE_MIN_LENGTH = 10;
const TITLE_MAX_LENGTH = 200;
const EXCERPT_MAX_LENGTH = 300;
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 100;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Helper to check for text content in TipTap JSON or string
function hasText(node: any): boolean {
  if (!node) return false;
  if (typeof node === 'string') return !!node.trim();
  if (node?.type === 'text' && node.text?.trim()) return true;
  if (node?.content && Array.isArray(node.content)) {
    return node.content.some((child: any) => hasText(child));
  }
  return false;
}

export const postSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required') // Handle empty string
    .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
    .max(TITLE_MAX_LENGTH, `Title must be no more than ${TITLE_MAX_LENGTH} characters`),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(SLUG_MIN_LENGTH, `Slug must be at least ${SLUG_MIN_LENGTH} characters`)
    .max(SLUG_MAX_LENGTH, `Slug must be no more than ${SLUG_MAX_LENGTH} characters`)
    .regex(SLUG_PATTERN, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  excerpt: z
    .string()
    .max(EXCERPT_MAX_LENGTH, `Excerpt must be no more than ${EXCERPT_MAX_LENGTH} characters`)
    .optional()
    .nullable(),

  category: z
    .string()
    .min(1, 'Category is required'),

  content: z
    .any()
    .refine((val) => val !== null && val !== undefined, { message: 'Content is required' })
    .refine((val) => hasText(val), { message: 'Content cannot be empty' }),
});

export type PostFormData = z.infer<typeof postSchema>;

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// Compatibility wrapper for existing pattern
export function validatePost(data: any): ValidationResult {
  const result = postSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [] };
  }

  if (!result.error) {
    // Should not happen with Zod standard behavior
    return { valid: false, errors: [] };
  }

  // Handle Zod Error structure (supporting v3/v4 variations defensively)
  const issues = (result.error as any).errors || (result.error as any).issues || [];

  return {
    valid: false,
    errors: issues.map((err: any) => ({
      field: err.path ? err.path[0]?.toString() : 'unknown',
      message: err.message
    }))
  };
}
