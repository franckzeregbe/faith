export type SocialPost = {
  id: string
  title: string
  verse: string
  message: string
  date: string
}

const posts = [
  {
    title: 'Appel à la prière',
    verse: 'Psaume 34:18 — L’Éternel est près de ceux qui ont le cœur brisé.',
    message: 'Prions ensemble et gardons les yeux sur Jésus. Que Sa paix remplisse votre journée.'
  },
  {
    title: 'Espérance vivante',
    verse: 'Jean 14:6 — Je suis le chemin, la vérité et la vie.',
    message: 'Marchez avec Jésus aujourd’hui. Il donne force, espoir et direction.'
  },
  {
    title: 'Courage en Lui',
    verse: 'Josué 1:9 — Fortifie-toi et prends courage.',
    message: 'Dans les moments difficiles, souvenez-vous que le Seigneur est avec vous.'
  }
]

export function generateDailyPost(date: string) {
  const index = new Date(date).getDate() % posts.length
  const post = posts[index]
  return `🌅 ${post.title}\n${post.verse}\n\n${post.message}\n\n#Jésus #Foi #Espérance`
}
