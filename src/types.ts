export type Visit = {
  id: string
  name: string
  date: string
  notes?: string
}

export type Cult = {
  id: string
  title: string
  weekday: number
  time: string
  startDate: string
}

export type Contact = {
  id: string
  name: string
  phone?: string
  note?: string
  lastVisit?: string
}

export type Profile = {
  name: string
  church: string
  role: string
  email: string
  phone: string
  city: string
  note: string
  photoUrl?: string
}

export type SocialPost = {
  id: string
  title: string
  verse: string
  message: string
  date: string
}

export type Sermon = {
  id: string
  title: string
  bibleText: string
  date: string
  notes: string
}

export type PrayerRequest = {
  id: string
  title: string
  requester: string
  date: string
  status: 'en prière' | 'exaucée'
  notes: string
}

export type BirthdayEntry = {
  id: string
  name: string
  date: string // MM-DD
  phone?: string
}
