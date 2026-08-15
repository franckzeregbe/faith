from datetime import datetime

posts = [
    {
        'title': 'Appel à la prière',
        'verse': 'Psaume 34:18 — L’Éternel est près de ceux qui ont le cœur brisé.',
        'message': 'Prions ensemble et gardons les yeux sur Jésus. Que Sa paix remplisse votre journée.'
    },
    {
        'title': 'Espérance vivante',
        'verse': 'Jean 14:6 — Je suis le chemin, la vérité et la vie.',
        'message': 'Marchez avec Jésus aujourd’hui. Il donne force, espoir et direction.'
    },
    {
        'title': 'Courage en Lui',
        'verse': 'Josué 1:9 — Fortifie-toi et prends courage.',
        'message': 'Dans les moments difficiles, souvenez-vous que le Seigneur est avec vous.'
    }
]


def generate_post(date_str: str) -> str:
    date = datetime.fromisoformat(date_str)
    item = posts[date.day % len(posts)]
    return f"🌅 {item['title']}\n{item['verse']}\n\n{item['message']}\n\n#Jésus #Foi #Espérance"


if __name__ == '__main__':
    print(generate_post(datetime.now().date().isoformat()))
