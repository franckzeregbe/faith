const fs = require('fs');
const path = require('path');

const OSIS_BOOKS = [
  'Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam',
  '1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov',
  'Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos',
  'Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal',
  'Matt','Mark','Luke','John','Acts','Rom','1Cor','2Cor','Gal','Eph',
  'Phil','Col','1Thess','2Thess','1Tim','2Tim','Titus','Phlm','Heb',
  'Jas','1Pet','2Pet','1John','2John','3John','Jude','Rev',
];

const KEY_MAP = {
  Gen:'gen', Exod:'exo', Lev:'lev', Num:'num', Deut:'deu',
  Josh:'jos', Judg:'jug', Ruth:'rut', '1Sam':'1sa', '2Sam':'2sa',
  '1Kgs':'1ro', '2Kgs':'2ro', '1Chr':'1ch', '2Chr':'2ch',
  Ezra:'esd', Neh:'neh', Esth:'est', Job:'job', Ps:'psa', Prov:'pro',
  Eccl:'ecc', Song:'can', Isa:'esi', Jer:'jer', Lam:'lam',
  Ezek:'eze', Dan:'dan', Hos:'ose', Joel:'joe', Amos:'amo',
  Obad:'abd', Jonah:'jon', Mic:'mic', Nah:'nah', Hab:'hab',
  Zeph:'soph', Hag:'agg', Zech:'zac', Mal:'mal',
  Matt:'mat', Mark:'mar', Luke:'luc', John:'joh', Acts:'act',
  Rom:'rom', '1Cor':'1co', '2Cor':'2co', Gal:'gal', Eph:'eph',
  Phil:'phi', Col:'col', '1Thess':'1th', '2Thess':'2th',
  '1Tim':'1ti', '2Tim':'2ti', Titus:'tit', Phlm:'phm',
  Heb:'heb', Jas:'jam', '1Pet':'1pe', '2Pet':'2pe',
  '1John':'1jn', '2John':'2jn', '3John':'3jn', Jude:'jud', Rev:'rev',
};

const FRENCH_NAMES = {
  gen:'Genèse', exo:'Exode', lev:'Lévitique', num:'Nombres', deu:'Deutéronome',
  jos:'Josué', jug:'Juges', rut:'Ruth', '1sa':'1 Samuel', '2sa':'2 Samuel',
  '1ro':'1 Rois', '2ro':'2 Rois', '1ch':'1 Chroniques', '2ch':'2 Chroniques',
  esd:'Esdras', neh:'Néhémie', est:'Esther', job:'Job',
  psa:'Psaumes', pro:'Proverbes', ecc:'Ecclésiaste', can:'Cantique des Cantiques',
  esi:'Ésaïe', jer:'Jérémie', lam:'Lamentations', eze:'Ézéchiel',
  dan:'Daniel', ose:'Osée', joe:'Joël', amo:'Amos', abd:'Abdias',
  jon:'Jonas', mic:'Michée', nah:'Nahum', hab:'Habakuk', soph:'Sophonie',
  agg:'Aggée', zac:'Zacharie', mal:'Malachie',
  mat:'Matthieu', mar:'Marc', luc:'Luc', joh:'Jean', act:'Actes',
  rom:'Romains', '1co':'1 Corinthiens', '2co':'2 Corinthiens',
  gal:'Galates', eph:'Éphésiens', phi:'Philippiens', col:'Colossiens',
  '1th':'1 Thessaloniciens', '2th':'2 Thessaloniciens',
  '1ti':'1 Timothée', '2ti':'2 Timothée', tit:'Tite', phm:'Philémon',
  heb:'Hébreux', jam:'Jacques', '1pe':'1 Pierre', '2pe':'2 Pierre',
  '1jn':'1 Jean', '2jn':'2 Jean', '3jn':'3 Jean', jud:'Jude', rev:'Apocalypse',
};

async function fetchBook(osis) {
  const url = `https://raw.githubusercontent.com/midvash/bible-data/main/versions/fr/lsg/books/${osis}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${osis}: ${res.status}`);
  return res.json();
}

async function main() {
  const outPath = path.join(__dirname, '..', 'src', 'data', 'bible-data.ts');
  const stream = fs.createWriteStream(outPath);
  stream.write("export interface BibleBook {\n  name: string\n  chapters: string[][]\n}\n\nexport const BIBLE: Record<string, BibleBook> = {\n");

  for (let i = 0; i < OSIS_BOOKS.length; i++) {
    const osis = OSIS_BOOKS[i];
    const key = KEY_MAP[osis];
    const name = FRENCH_NAMES[key];
    const data = await fetchBook(osis);
    const chapters = data.chapters;
    process.stdout.write(`  ${i+1}/${OSIS_BOOKS.length} ${osis} → ${key} (${name}, ${chapters.length} chapitres)\n`);

    stream.write(`  '${key}': {\n    name: '${name}',\n    chapters: [\n`);
    for (let ci = 0; ci < chapters.length; ci++) {
      const verses = chapters[ci].verses;
      const verseTexts = verses.map(v => {
        const escaped = v.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
      });
      stream.write(`      [${verseTexts.join(',\n')}]`);
      if (ci < chapters.length - 1) stream.write(',');
      stream.write('\n');
    }
    stream.write(`    ]\n  }`);
    if (i < OSIS_BOOKS.length - 1) stream.write(',');
    stream.write('\n');
  }

  stream.write("};\n");
  stream.end();
  console.log('\nDone! File written to', outPath);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
