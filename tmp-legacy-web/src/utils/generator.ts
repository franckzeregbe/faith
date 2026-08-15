export const TEMPLATE_TYPES = {
  encouragement: 'encouragement',
  whatsapp: 'whatsapp',
  facebook: 'facebook',
} as const

const VERSES = [
  'Philippiens 4:13 — Je puis tout par celui qui me fortifie.',
  'Psaume 23:1 — L\'Éternel est mon berger; je ne manquerai de rien.',
  'Josué 1:9 — Fortifie-toi et prends courage.',
  'Psaume 34:18 — L\'Éternel est près de ceux qui ont le cœur brisé.',
  'Jean 14:6 — Je suis le chemin, la vérité et la vie.',
  'Ésaïe 41:10 — Ne crains rien, car je suis avec toi.',
  'Matthieu 11:28 — Venez à moi, vous tous qui êtes fatigués et chargés.',
  'Jérémie 29:11 — Car je connais les projets que j\'ai pour vous, projets de paix.',
  'Romains 8:28 — Toutes choses concourent au bien de ceux qui aiment Dieu.',
  'Psaume 121:1 — Je lève mes yeux vers les montagnes… d\'où vient mon secours.',
]

const JESUS_LINE = 'Que la paix et la grâce de notre Seigneur Jésus-Christ vous accompagnent.'

function randomVerse() {
  return VERSES[Math.floor(Math.random() * VERSES.length)]
}

export function generateMessage(type: string, name = 'frère/sœur') {
  const verse = randomVerse()

  switch (type) {
    case 'encouragement':
      return `Bonjour ${name},\n\nUne pensée pour toi aujourd'hui :\n\n${verse}\n\n${JESUS_LINE}`
    case 'whatsapp':
      return `${name}, frère/sœur en Christ 🌿\n\nJe prie pour toi aujourd'hui.\n\n${JESUS_LINE}\n\n${verse}\n\n— Pasteur`
    case 'facebook':
      return `${verse}\n\n${JESUS_LINE}\n\n#FoiSainte #Jésus #Espérance #Amour`
    default:
      return `${verse} ${JESUS_LINE}`
  }
}
