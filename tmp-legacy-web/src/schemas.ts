import { z } from 'zod'

// Les ids sont générés avec Date.now().toString() (pas des UUID)
const idField = z.string().min(1, 'Identifiant manquant')

// Les dates sont stockées au format YYYY-MM-DD ou datetime-local (YYYY-MM-DDTHH:MM)
const dateField = z
  .string()
  .min(1, 'La date est requise')
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, 'Format de date invalide')

// Visit schema
export const visitSchema = z.object({
  id: idField,
  name: z.string().min(1, 'Le nom est requis').max(100),
  date: dateField,
  notes: z.string().optional(),
})

export type Visit = z.infer<typeof visitSchema>

// Cult schema
export const cultSchema = z.object({
  id: idField,
  title: z.string().min(1, 'Le titre est requis').max(100),
  weekday: z.number().int().min(0).max(6),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM requis'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
})

export type Cult = z.infer<typeof cultSchema>

// Contact schema
export const contactSchema = z.object({
  id: idField,
  name: z.string().min(1, 'Le nom est requis').max(100),
  phone: z.string().optional(),
  note: z.string().optional(),
  lastVisit: z.string().optional(),
})

export type Contact = z.infer<typeof contactSchema>

// Profile schema
export const profileSchema = z.object({
  name: z.string().max(100),
  church: z.string().max(150),
  role: z.string().max(100),
  email: z.string().max(150),
  phone: z.string().max(20),
  city: z.string().max(100),
  note: z.string(),
  slogan: z.string().max(200),
  photoUrl: z.string().max(3_000_000).optional(),
})

export type Profile = z.infer<typeof profileSchema>

// Social Post schema
export const socialPostSchema = z.object({
  id: idField,
  title: z.string().min(1, 'Le titre est requis').max(200),
  verse: z.string().min(1, 'Le verset est requis'),
  message: z.string().min(1, 'Le message est requis'),
  date: dateField,
})

export type SocialPost = z.infer<typeof socialPostSchema>

// Sermon schema
export const sermonSchema = z.object({
  id: idField,
  title: z.string().min(1, 'Le titre est requis').max(200),
  bibleText: z.string().min(1, 'Le texte biblique est requis'),
  date: dateField,
  notes: z.string(),
})

export type Sermon = z.infer<typeof sermonSchema>

// Prayer Request schema
export const prayerRequestSchema = z.object({
  id: idField,
  title: z.string().min(1, 'Le titre est requis').max(200),
  requester: z.string().max(100),
  date: dateField,
  status: z.enum(['en prière', 'exaucée']),
  notes: z.string(),
})

export type PrayerRequest = z.infer<typeof prayerRequestSchema>

// Convert Entry schema
export const convertEntrySchema = z.object({
  id: idField,
  name: z.string().min(1, 'Le nom est requis').max(100),
  phone: z.string().optional(),
  date: dateField,
  type: z.enum(['profession de foi', 'baptême', 'repentance', 'consécration', 'autre']),
  status: z.enum(['suivi', 'disciple', 'engage(e)', 'relâché']),
  notes: z.string(),
})

export type ConvertEntry = z.infer<typeof convertEntrySchema>

// Helper function to validate and parse data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const firstError = result.error.issues[0]
  return { success: false, error: firstError?.message ?? 'Validation échouée' }
}
