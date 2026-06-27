export const TEMPLATE_TYPES = {
  encouragement: 'encouragement',
  whatsapp: 'whatsapp',
  facebook: 'facebook'
} as const

export function generateMessage(type: string, name = 'frère/sœur') {
  const verses = [
    'Philippiens 4:13 — Je puis tout par celui qui me fortifie.',
    'Psaume 23:1 — L’Éternel est mon berger; je ne manquerai de rien.',
    'Josué 1:9 — Fortifie‑toi et prends courage.'
  ]

  const jesusLine = 'Que la paix et la grâce de notre Seigneur Jésus‑Christ vous accompagnent.'

  if (type === TEMPLATE_TYPES.encouragement) {
    return `${name}, une pensée pour toi aujourd'hui: ${verses[0]} ${jesusLine}`
  }

  if (type === TEMPLATE_TYPES.whatsapp) {
    return `${name}, frère/sœur en Christ 🌿\n\nJe prie pour toi aujourd'hui. ${verses[1]}\n\n${jesusLine}\n\n— Pasteur` 
  }

  // facebook
  return `${verses[2]}\n\n${jesusLine}\n\n#FoiSainte #Jésus #Espérance`
}
