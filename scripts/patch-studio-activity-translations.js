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
    description:
      "Bring your tennis or racket club to the Caribbean. Blessed House sits just five minutes from the Playa Negra court, so your team can train in the cool of the morning, rally again in the late afternoon, and still have the whole day for the beach.\n\nBetween sessions, swap the court for jungle runs on quiet coastal roads and rainforest trails, then recover in the shared pool surrounded by green. Evenings are for team dinners by the BBQ area and real rest in private villas.\n\nFor clubs, academies, and team retreats of 20 to 45 people, book the entire estate as a private buyout. Tell us your training plan and we will help you shape the week around court time, meals, and recovery days.",
    es: {
      title: "Tenis en Playa Negra",
      description:
        "Traiga a su club de tenis o de deportes de raqueta al Caribe. Blessed House está a solo cinco minutos de la cancha de Playa Negra, así que su equipo puede entrenar con el fresco de la mañana, volver a pelotear al final de la tarde y aun así tener todo el día para la playa.\n\nEntre sesiones, cambie la cancha por carreras en la selva por caminos costeros tranquilos y senderos del bosque tropical, y luego recupérese en la piscina compartida rodeada de selva. Las noches son para cenas de equipo junto al área de BBQ y descanso real en villas privadas.\n\nPara clubes, academias y retiros de equipo de 20 a 45 personas, reserve toda la propiedad en exclusiva. Cuéntenos su plan de entrenamiento y le ayudamos a organizar la semana alrededor del tiempo en cancha, las comidas y los días de recuperación.",
      duration: "2 horas",
      groupSize: "Hasta 8 personas",
      whatsIncluded: ["Raquetas de tenis", "Pelotas de tenis"],
    },
    de: {
      title: "Tennis in Playa Negra",
      description:
        "Bringen Sie Ihren Tennis oder Racketclub in die Karibik. Blessed House liegt nur fünf Minuten vom Platz in Playa Negra entfernt, so kann Ihr Team in der Morgenkühle trainieren, am späten Nachmittag erneut spielen und hat trotzdem den ganzen Tag für den Strand.\n\nZwischen den Einheiten tauschen Sie den Platz gegen Dschungelläufe auf ruhigen Küstenstraßen und Regenwaldpfaden und erholen sich anschließend im Gemeinschaftspool mitten im Grünen. Die Abende gehören Teamessen am Grillbereich und echter Erholung in privaten Villen.\n\nFür Clubs, Akademien und Teamretreats mit 20 bis 45 Personen können Sie das gesamte Anwesen exklusiv buchen. Erzählen Sie uns von Ihrem Trainingsplan, und wir helfen Ihnen, die Woche rund um Platzzeiten, Mahlzeiten und Erholungstage zu gestalten.",
      duration: "2 Stunden",
      groupSize: "Bis zu 8 Personen",
      whatsIncluded: ["Tennisschläger", "Tennisbälle"],
    },
    nl: {
      title: "Tennis bij Playa Negra",
      description:
        "Breng je tennis of racketclub naar het Caribisch gebied. Blessed House ligt op slechts vijf minuten van de baan in Playa Negra, zodat je team in de koelte van de ochtend kan trainen, laat in de middag opnieuw kan spelen en toch de hele dag tijd heeft voor het strand.\n\nWissel tussen de sessies de baan in voor junglelopen over rustige kustwegen en regenwoudpaden en herstel daarna in het gedeelde zwembad midden in het groen. De avonden zijn voor teamdiners bij de BBQ en echte rust in privévilla's.\n\nVoor clubs, academies en teamretraites van 20 tot 45 personen boek je het hele landgoed exclusief. Vertel ons je trainingsplan en we helpen je de week in te delen rond baantijd, maaltijden en hersteldagen.",
      duration: "2 uur",
      groupSize: "Tot 8 personen",
      whatsIncluded: ["Tennisrackets", "Tennisballen"],
    },
    fr: {
      title: "Tennis à Playa Negra",
      description:
        "Emmenez votre club de tennis ou de sports de raquette dans les Caraïbes. Blessed House se trouve à seulement cinq minutes du court de Playa Negra : votre équipe peut s’entraîner à la fraîche le matin, rejouer en fin de journée et garder toute la journée pour la plage.\n\nEntre les séances, troquez le court contre des footings dans la jungle sur des routes côtières tranquilles et des sentiers de forêt tropicale, puis récupérez dans la piscine partagée entourée de verdure. Les soirées sont consacrées aux dîners d’équipe près de l’espace barbecue et à un vrai repos dans des villas privées.\n\nPour les clubs, académies et retraites d’équipe de 20 à 45 personnes, réservez l’ensemble du domaine en privatisation. Parlez nous de votre programme d’entraînement et nous vous aiderons à organiser la semaine autour du temps de court, des repas et des journées de récupération.",
      duration: "2 heures",
      groupSize: "Jusqu’à 8 personnes",
      whatsIncluded: ["Raquettes de tennis", "Balles de tennis"],
    },
    ja: {
      title: "プラヤネグラでテニス",
      description:
        "テニスクラブやラケットスポーツのチームをカリブ海へ。Blessed Houseはプラヤネグラのコートから車でわずか5分。涼しい朝に練習し、夕方にもう一度ラリーをしても、日中はたっぷりビーチを楽しめます。\n\n練習の合間には、静かな海沿いの道や熱帯雨林のトレイルでジャングルランを。その後は緑に囲まれた共有プールでリカバリーを。夜はBBQエリアでのチームディナーと、プライベートヴィラでの本当の休息の時間です。\n\n20名から45名のクラブ、アカデミー、チーム合宿には、敷地全体の貸切がおすすめです。練習計画をお聞かせいただければ、コートの時間、食事、リカバリー日を中心に一週間の組み立てをお手伝いします。",
      duration: "2時間",
      groupSize: "最大8名",
      whatsIncluded: ["テニスラケット", "テニスボール"],
    },
    pt: {
      title: "Tênis em Playa Negra",
      description:
        "Traga seu clube de tênis ou de esportes de raquete para o Caribe. A Blessed House fica a apenas cinco minutos da quadra de Playa Negra, então sua equipe pode treinar no frescor da manhã, voltar à quadra no fim da tarde e ainda ter o dia inteiro para a praia.\n\nEntre as sessões, troque a quadra por corridas na selva em estradas costeiras tranquilas e trilhas da floresta tropical, e depois recupere na piscina compartilhada cercada de verde. As noites são para jantares em equipe na área de churrasqueira e descanso de verdade em vilas privadas.\n\nPara clubes, academias e retiros de equipe de 20 a 45 pessoas, reserve a propriedade inteira com exclusividade. Conte seu plano de treino e ajudamos a montar a semana em torno do tempo de quadra, das refeições e dos dias de recuperação.",
      duration: "2 horas",
      groupSize: "Até 8 pessoas",
      whatsIncluded: ["Raquetes de tênis", "Bolas de tênis"],
    },
    ar: {
      title: "تنس في Playa Negra",
      description:
        "أحضر نادي التنس أو رياضات المضرب إلى الكاريبي. يقع Blessed House على بعد خمس دقائق فقط من ملعب Playa Negra، فيستطيع فريقك التدرب في نسمات الصباح الباردة والعودة للعب في آخر النهار مع بقاء اليوم كله للشاطئ.\n\nبين الحصص، استبدل الملعب بالجري في الغابة على طرق ساحلية هادئة ومسارات الغابة المطيرة، ثم استعد نشاطك في المسبح المشترك وسط الخضرة. أما الأمسيات فهي لعشاء الفريق بجوار منطقة الشواء وللراحة الحقيقية في فلل خاصة.\n\nللأندية والأكاديميات ومعسكرات الفرق من 20 إلى 45 شخصاً، احجز العقار بالكامل حصرياً. أخبرنا بخطة تدريبك وسنساعدك على تنظيم الأسبوع حول أوقات الملعب والوجبات وأيام الاستشفاء.",
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
    if (data.description) {
      set.description = toBlocks(data.description, `${slug}-en`);
    }
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
