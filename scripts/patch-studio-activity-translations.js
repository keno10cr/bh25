/**
 * Locale copy for activities created directly in Studio (no entry in
 * src/data/activities.js or translations.js). The site reads these Sanity
 * locale fields for non English visitors.
 *
 * Run: node --env-file=.env.local scripts/patch-studio-activity-translations.js
 */
import { createClient } from "@sanity/client";
import { toWhatsIncludedItems } from "./whats-included.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const ACTIVITIES = {
  "playa-negra-tennis": {
    whatsIncluded: ["Tennis Rackets", "Tennis Balls"],
    es: {
      title: "Tenis en Playa Negra",
      description:
        "Diviértase a solo cinco minutos por la carretera en una cancha de tenis local impecable, lista para su partido de la mañana o para un peloteo lleno de energía por la tarde bajo el sol tropical.",
      duration: "2 horas",
      groupSize: "Hasta 8 personas",
      whatsIncluded: ["Raquetas de tenis", "Pelotas de tenis"],
    },
    de: {
      title: "Tennis in Playa Negra",
      description:
        "Nur fünf Minuten die Straße hinunter wartet ein gepflegter Tennisplatz auf Ihr Match am Morgen oder einen energiegeladenen Ballwechsel am Nachmittag unter der tropischen Sonne.",
      duration: "2 Stunden",
      groupSize: "Bis zu 8 Personen",
      whatsIncluded: ["Tennisschläger", "Tennisbälle"],
    },
    nl: {
      title: "Tennis bij Playa Negra",
      description:
        "Op slechts vijf minuten rijden ligt een verzorgde tennisbaan, klaar voor je ochtendpartij of een energieke rally in de middag onder de tropische zon.",
      duration: "2 uur",
      groupSize: "Tot 8 personen",
      whatsIncluded: ["Tennisrackets", "Tennisballen"],
    },
    fr: {
      title: "Tennis à Playa Negra",
      description:
        "À seulement cinq minutes sur la route, un court de tennis impeccable vous attend pour un match le matin ou un échange plein d’énergie dans l’après midi sous le soleil tropical.",
      duration: "2 heures",
      groupSize: "Jusqu’à 8 personnes",
      whatsIncluded: ["Raquettes de tennis", "Balles de tennis"],
    },
    ja: {
      title: "プラヤネグラでテニス",
      description:
        "車でわずか5分の場所に、手入れの行き届いたテニスコートがあります。朝の試合や、南国の太陽の下での午後のラリーをお楽しみください。",
      duration: "2時間",
      groupSize: "最大8名",
      whatsIncluded: ["テニスラケット", "テニスボール"],
    },
    pt: {
      title: "Tênis em Playa Negra",
      description:
        "A apenas cinco minutos pela estrada, uma quadra de tênis impecável espera por sua partida pela manhã ou por uma troca de bolas cheia de energia à tarde sob o sol tropical.",
      duration: "2 horas",
      groupSize: "Até 8 pessoas",
      whatsIncluded: ["Raquetes de tênis", "Bolas de tênis"],
    },
    ar: {
      title: "تنس في Playa Negra",
      description:
        "على بعد خمس دقائق فقط على الطريق، ملعب تنس محلي مُعتنى به جاهز لمباراتك الصباحية أو لتبادل كرات مفعم بالحيوية بعد الظهر تحت الشمس الاستوائية.",
      duration: "ساعتان",
      groupSize: "حتى 8 أشخاص",
      whatsIncluded: ["مضارب تنس", "كرات تنس"],
    },
  },
  "playa-negra": {
    whatsIncluded: ["Bike Trail", "Beach Trail"],
    es: {
      title: "Playa Negra",
      description:
        "Excursión desde Blessed House hasta Playa Negra, Limón, Costa Rica. Un destino impresionante, famoso por su singular arena volcánica oscura, de textura fina y alto contenido de hierro. Esta arena se forma mediante un proceso geológico natural en el que las rocas volcánicas y la lava oscura se descomponen durante miles de años por la erosión y la fuerza de las olas, liberando minerales densos ricos en hierro, como la magnetita, que las corrientes marinas concentran de forma natural a lo largo de la costa. Según estudios geológicos de investigadores de la Universidad de Costa Rica, esta alta concentración de hierro es la razón por la que la arena puede reaccionar a los imanes.",
      duration: "Medio día",
      groupSize: "Sin límite",
      whatsIncluded: ["Ruta en bicicleta", "Sendero de playa"],
    },
    de: {
      title: "Playa Negra",
      description:
        "Ausflug von Blessed House nach Playa Negra, Limón, Costa Rica. Ein beeindruckendes Ziel, berühmt für seinen einzigartigen dunklen Vulkansand mit feiner Struktur und hohem Eisengehalt. Dieser Sand entsteht durch einen natürlichen geologischen Prozess: Vulkangestein und dunkle Lava werden über Tausende von Jahren durch Verwitterung und die Kraft der Wellen zerkleinert. Dabei werden dichte eisenhaltige Mineralien wie Magnetit freigesetzt, die Meeresströmungen auf natürliche Weise entlang der Küste anreichern. Wie geologische Untersuchungen von Forschern der Universität von Costa Rica belegen, ist diese hohe Eisenkonzentration der Grund, warum der Sand sogar auf Magnete reagieren kann.",
      duration: "Halber Tag",
      groupSize: "Keine Begrenzung",
      whatsIncluded: ["Radweg", "Strandweg"],
    },
    nl: {
      title: "Playa Negra",
      description:
        "Uitstapje van Blessed House naar Playa Negra, Limón, Costa Rica. Een indrukwekkende bestemming, bekend om het unieke donkere vulkanische zand met een fijne structuur en een hoog ijzergehalte. Dit zand ontstaat door een natuurlijk geologisch proces waarbij vulkanisch gesteente en donkere lava over duizenden jaren worden afgebroken door verwering en de kracht van de golven. Daarbij komen zware ijzerhoudende mineralen zoals magnetiet vrij, die door zeestromingen op natuurlijke wijze langs de kust worden geconcentreerd. Volgens geologisch onderzoek van de Universiteit van Costa Rica is deze hoge ijzerconcentratie de reden dat het zand zelfs op magneten kan reageren.",
      duration: "Halve dag",
      groupSize: "Geen limiet",
      whatsIncluded: ["Fietsroute", "Strandpad"],
    },
    fr: {
      title: "Playa Negra",
      description:
        "Excursion de Blessed House à Playa Negra, Limón, Costa Rica. Une destination saisissante, célèbre pour son sable volcanique sombre unique, à la texture fine et riche en fer. Ce sable se forme grâce à un processus géologique naturel : les roches volcaniques et la lave sombre sont décomposées pendant des milliers d’années par l’érosion et la force des vagues, libérant des minéraux denses riches en fer, comme la magnétite, que les courants marins concentrent naturellement le long du rivage. Selon des études géologiques menées par des chercheurs de l’Université du Costa Rica, cette forte concentration en fer explique pourquoi le sable peut réagir aux aimants.",
      duration: "Une demi journée",
      groupSize: "Sans limite",
      whatsIncluded: ["Piste cyclable", "Sentier de plage"],
    },
    ja: {
      title: "プラヤネグラ",
      description:
        "Blessed Houseからコスタリカ、リモン州のプラヤネグラへの小旅行。きめ細かく鉄分を多く含む、独特の黒い火山砂で知られる印象的なビーチです。この砂は、火山岩や黒い溶岩が何千年もの風化と打ち寄せる波の力によって砕かれ、磁鉄鉱などの重い鉄鉱物が放出され、それを海流が海岸線に自然と集めることで生まれました。コスタリカ大学の研究者による地質調査でも示されているように、鉄分の濃度が高いため、この砂は磁石に反応することがあります。",
      duration: "半日",
      groupSize: "人数制限なし",
      whatsIncluded: ["サイクリングコース", "ビーチトレイル"],
    },
    pt: {
      title: "Playa Negra",
      description:
        "Passeio da Blessed House até Playa Negra, Limón, Costa Rica. Um destino impressionante, famoso por sua areia vulcânica escura e única, de textura fina e alto teor de ferro. Essa areia se forma por meio de um processo geológico natural em que rochas vulcânicas e lava escura são desgastadas ao longo de milhares de anos pela erosão e pela força das ondas, liberando minerais densos ricos em ferro, como a magnetita, que as correntes oceânicas concentram naturalmente ao longo da costa. Segundo estudos geológicos de pesquisadores da Universidade da Costa Rica, essa alta concentração de ferro é o motivo pelo qual a areia pode reagir a ímãs.",
      duration: "Meio dia",
      groupSize: "Sem limite",
      whatsIncluded: ["Trilha de bicicleta", "Trilha de praia"],
    },
    ar: {
      title: "Playa Negra",
      description:
        "رحلة من Blessed House إلى Playa Negra في ليمون، كوستاريكا. وجهة مذهلة تشتهر برمالها البركانية الداكنة الفريدة ذات الملمس الناعم والمحتوى العالي من الحديد. تتكون هذه الرمال عبر عملية جيولوجية طبيعية، إذ تتفتت الصخور البركانية والحمم الداكنة على مدى آلاف السنين بفعل التعرية وقوة الأمواج، فتنطلق معادن كثيفة غنية بالحديد مثل المغنتيت، تجمعها التيارات البحرية بشكل طبيعي على طول الشاطئ. وكما توثق الدراسات الجيولوجية لباحثين في جامعة كوستاريكا، فإن هذا التركيز العالي للحديد هو سبب تفاعل الرمال مع المغناطيس.",
      duration: "نصف يوم",
      groupSize: "بلا حد",
      whatsIncluded: ["مسار للدراجات", "مسار على الشاطئ"],
    },
  },
};

const SUFFIX = { es: "Es", de: "De", nl: "Nl", fr: "Fr", ja: "Ja", pt: "Pt", ar: "Ar" };

function toBlocks(text, prefix) {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${prefix}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        { _type: "span", _key: `${prefix}-s${index}`, text: paragraph, marks: [] },
      ],
    }));
}

function items(labels, prefix) {
  return toWhatsIncludedItems(labels, prefix).map((item) => ({
    _type: "whatsIncludedItem",
    ...item,
  }));
}

async function run() {
  const client = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  for (const [slug, data] of Object.entries(ACTIVITIES)) {
    const ids = await client.fetch(
      `*[_type == "activity" && slug.current == $slug]._id`,
      { slug }
    );
    if (ids.length === 0) {
      console.warn(`No activity found for ${slug}`);
      continue;
    }

    const set = { whatsIncluded: items(data.whatsIncluded, `${slug}-en`) };
    for (const [lang, suffix] of Object.entries(SUFFIX)) {
      const copy = data[lang];
      set[`title${suffix}`] = copy.title;
      set[`description${suffix}`] = toBlocks(copy.description, `${slug}-${lang}`);
      set[`duration${suffix}`] = copy.duration;
      set[`groupSize${suffix}`] = copy.groupSize;
      set[`whatsIncluded${suffix}`] = items(copy.whatsIncluded, `${slug}-${lang}`);
    }

    for (const id of ids) {
      await client.patch(id).set(set).commit();
      console.log(`Translated ${slug} (${id})`);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
