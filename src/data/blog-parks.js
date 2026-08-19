const ORIGIN = "9.64735,-82.77697";

function mapsLink(destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${ORIGIN}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export const PARK_POSTS = [
  {
    slug: "park-cahuita",
    title: "Cahuita National Park, the reef next door",
    mapsQuery: "Cahuita National Park Costa Rica",
    drive: "about 20 minutes",
    distance: "about 15 kilometers",
    featuredImage: "/activities/all/cahuitaNP.jpg",
    excerpt:
      "Costa Rica has 30 national parks. The closest to Blessed House is Cahuita, a reef and forest walk you can do before lunch.",
    content: `Costa Rica keeps 30 national parks under SINAC. From Blessed House the first one is not a pilgrimage. Cahuita National Park sits just up the coast, where forest meets the Caribbean and the country’s most important coral reef holds the shallows.

Walk the coastal path for monkeys, raccoons, and that sudden blue of the reef. You can snorkel with a licensed guide when the sea is calm, or stay on the sand and let the park be a slow morning. Entry on the Kelly Creek side is a donation. Bring water, closed shoes if the roots are wet, and cash.

Google Maps puts the drive from Blessed House at about 20 minutes and about 15 kilometers. Save the route: ${mapsLink("Cahuita National Park Costa Rica")}

Even this short hop is better early. Heat builds on the path, and parking in Cahuita fills. Sundays stay kinder on the highway because large trucks and trailers mostly stay parked, a national habit that makes the Limón road feel wider.

Come back to the pool by early afternoon. That is the point of a park this close. You sleep in the garden, you walk a reef, and you are home before the howlers start the evening shift.`,
  },
  {
    slug: "park-la-amistad",
    title: "La Amistad, the great forest behind Talamanca",
    mapsQuery: "Parque Internacional La Amistad Costa Rica",
    drive: "about 1 hour to the foothills",
    distance: "about 40 kilometers toward Bribri",
    excerpt:
      "The largest wilderness in Costa Rica starts in the mountains behind Blessed House. Main gates sit much farther on the Pacific side.",
    content: `La Amistad is the giant. It is a UNESCO site, it crosses into Panama, and it is the largest wilderness in Costa Rica. From Blessed House you already live in its weather. Clouds that build over Talamanca in the afternoon are the same system that waters this park.

The Caribbean foothills begin about an hour from the villas, toward Bribri and the higher indigenous territories. That is not the same as walking through a ticket booth. The main visitor stations, such as Altamira, sit on the Pacific slope and take a full day to reach. Ask before you enter indigenous land. Permits and local guides are not optional manners. They are the door.

Google Maps shows about 1 hour and about 40 kilometers toward Bribri from Blessed House, and about 8 hours if you aim at the Altamira gate. Compare both: ${mapsLink("Bribri Costa Rica")} and ${mapsLink("Altamira La Amistad Costa Rica")}

For the long crossing, leave at dawn. Route 32 toward San José fills with containers on weekdays. Sundays are the exception. Large trucks and trailers mostly do not work that day, which is why a Pacific gate can feel possible if you start early and keep the driving in daylight.

You do not have to bag the whole park in one stay. Stand in the garden at Blessed House, look west at the ridge, and you are already looking at La Amistad’s weather. That is a fair first visit.`,
  },
  {
    slug: "park-barbilla",
    title: "Barbilla National Park, wet forest and few footprints",
    mapsQuery: "Barbilla National Park Costa Rica",
    drive: "about 3 hours",
    distance: "about 130 kilometers",
    excerpt:
      "A quiet Talamanca park of very wet forest, cats, and tapirs, with far fewer visitors than Cahuita.",
    content: `Barbilla sits in the Talamanca mountains as a wet, steep park that most visitors never name. Elevations climb from low hills into cloud, and the forest is the kind that keeps jaguars, pumas, ocelots, and tapirs even if you will probably see none of them.

This is a foot park. Trails are rustic, rain is part of the deal, and you go for rivers and quiet, not for a visitor center café. Hire local knowledge if you leave the first paths. The reward is a Costa Rica that still feels unscripted.

Google Maps puts the drive from Blessed House at about 3 hours and about 130 kilometers. Save the route: ${mapsLink("Barbilla National Park Costa Rica")}

Start early. The road toward Siquirres shares space with cargo on weekdays. Sundays are gentler because large trucks and trailers mostly stay parked. Either way, you want daylight for the last dirt stretches and for the walk itself.

Pack rain gear even in the dry months. Come home muddy and glad. Blessed House is close enough that Barbilla can be a long day, not a hotel rewrite.`,
  },
  {
    slug: "park-braulio-carrillo",
    title: "Braulio Carrillo, the forest that holds the highway",
    mapsQuery: "Braulio Carrillo National Park Costa Rica",
    drive: "about 3.5 to 4 hours",
    distance: "about 175 kilometers",
    excerpt:
      "Cloud forest and steep volcano slopes beside Route 32, the road most guests take toward San José.",
    content: `Braulio Carrillo is the green wall you meet when you leave the Caribbean toward San José. It is huge, steep, and wet, with rain forest climbing toward volcanoes. The highway cuts through it, which is why so many guests see the park before they know its name.

Stop at a ranger station if you want trails rather than a windshield view. Quebrada González is the usual first walk: dense forest, birds, and the sound of a road you just escaped. Cloud can sit on the ridges by midday. That is the park doing its job, catching water for the rest of the country.

Google Maps puts the drive from Blessed House at about 3.5 to 4 hours and about 175 kilometers. Save the route: ${mapsLink("Braulio Carrillo National Park Quebrada Gonzalez")}

This is the truck road. Containers run Route 32 hard on weekdays, and fog plus cargo is a bad mix. Leave Blessed House very early, or travel on Sunday, when large trucks and trailers mostly stay parked. That single habit of the country can turn a tense drive into a forest drive.

If you are already going to the airport, build in a walk. The park is not only scenery beside the asphalt. It is the reason the Caribbean still has a green approach.`,
  },
  {
    slug: "park-tortuguero",
    title: "Tortuguero National Park, canals and the green turtle beach",
    mapsQuery: "Tortuguero National Park Costa Rica",
    drive: "about 5 hours plus a boat",
    distance: "about 210 kilometers to the boat",
    excerpt:
      "No road into the village. You drive, then you float through canals to the most famous green turtle beach in the Americas.",
    content: `Tortuguero is water first. About two thirds of the park is canals, lagoons, and sea. The beach is the most important green turtle nesting shore in the Americas, and the forest behind it still holds jaguars that hunt those turtles. You visit by boat because the village has no through road.

The canals are the trail. Sit low, keep voices down, and let the guide find caimans, toucans, and the sudden slap of a fish. Nesting season asks even more care. Licensed night walks only. Lights stay low. This coast invented Blessed House’s baula stories too, but Tortuguero is the big theater.

Google Maps can only take you to the boat. From Blessed House plan about 5 hours and about 210 kilometers to La Pavona or the Cariari area, then the canal. Save a driving start: ${mapsLink("La Pavona Tortuguero Costa Rica")}

Leave at dawn. The inland roads share space with cargo, and you cannot miss the boat. Sundays help on the highway because large trucks and trailers mostly do not roll. Once you are in the canals, clocks change anyway.

Sleep in Tortuguero if you can. If you must make it a giant day, know that Blessed House will feel like a soft landing when the boat and the van are done.`,
  },
  {
    slug: "park-tapanti",
    title: "Tapanti Macizo de la Muerte, the rainiest park",
    mapsQuery: "Tapanti National Park Costa Rica",
    drive: "about 4.5 hours",
    distance: "about 190 kilometers",
    excerpt:
      "Oak forest, rivers, and more than 6,500 millimeters of rain a year in the high Talamanca.",
    content: `Tapanti Macizo de la Muerte sits in one of the wettest corners of Costa Rica. Rain can pass 6,500 millimeters a year. That is not a warning so much as a character. Oaks and alders grow old here, rivers stay loud, and the trails feel like a greenhouse with a roof of cloud.

Walk for birds and water, not for dry clothes. Quetzals appear in season. The name Macizo de la Muerte sounds harsh until you are in the mist and understand it as altitude and weather, not a mood.

Google Maps puts the drive from Blessed House at about 4.5 hours and about 190 kilometers. Save the route: ${mapsLink("Tapanti National Park Costa Rica")}

Go early so you hike in the brighter part of a wet day. The climb toward Cartago shares the same truck logic as the rest of the central valley roads. Sundays are easier because large trucks and trailers mostly stay parked.

Bring a real rain jacket, not a souvenir poncho. Return to Blessed House and the Caribbean humidity will feel almost gentle after Tapanti’s version of rain.`,
  },
  {
    slug: "park-turrialba",
    title: "Turrialba Volcano, the second highest cone",
    mapsQuery: "Turrialba Volcano National Park Costa Rica",
    drive: "about 4.5 hours",
    distance: "about 200 kilometers",
    excerpt:
      "A working volcano above farm country, with views and closures that follow the mountain’s mood.",
    content: `Turrialba is Costa Rica’s second highest volcano, a cone that still wakes and shuts trails when it needs to. The park is small compared with Braulio Carrillo, but the mountain fills the sky above dairy country and the old railway town that shares its name.

Check SINAC before you go. Activity and gas can close the road to the crater. On open days the walk is about wind, ash color, and the feeling of standing on a machine that is not done. On closed days the valley still has rivers and farms worth the drive.

Google Maps puts the drive from Blessed House at about 4.5 hours and about 200 kilometers. Save the route: ${mapsLink("Turrialba Volcano National Park Costa Rica")}

Leave before sunrise if you want a clear crater view. Clouds build fast. Weekday cargo toward the central valley is real. Sundays remain the softer day because large trucks and trailers mostly rest.

If the volcano is closed, do not treat the day as lost. Eat in Turrialba, look up at the plume or the cloud, and roll back to the Caribbean with a mountain still in your head.`,
  },
  {
    slug: "park-irazu",
    title: "Irazu Volcano, a paved road to both oceans",
    mapsQuery: "Irazu Volcano National Park Costa Rica",
    drive: "about 4.5 to 5 hours",
    distance: "about 200 kilometers",
    excerpt:
      "The highest volcano in Costa Rica, with a crater road and days when both coasts appear.",
    content: `Irazú is the highest volcano in the country, and a paved road climbs near the summit. On a sharp morning you can see the Caribbean and the Pacific from one windy parking area. Most days you see crater, ash, and a sky that keeps changing its mind.

Dress for cold. This is not Puerto Viejo weather. The crater looks like another planet, green and grey, and the wind will find every gap in your shirt. Go for the view and for the odd joy of driving a volcano after breakfast in the jungle.

Google Maps puts the drive from Blessed House at about 4.5 to 5 hours and about 200 kilometers. Save the route: ${mapsLink("Irazu Volcano National Park Costa Rica")}

Start in the dark. Clear air happens early, and the road from Cartago fills later. Sundays help on the way through the valley because large trucks and trailers mostly stay parked.

Bring a jacket, not just a camera. Then drop back toward the Caribbean and let the temperature rise with the kilometers. Blessed House will feel tropical in a new way.`,
  },
  {
    slug: "park-juan-castro-blanco",
    title: "Juan Castro Blanco, waterfalls and quetzals in the high north",
    mapsQuery: "Juan Castro Blanco National Park Costa Rica",
    drive: "about 5 hours",
    distance: "about 235 kilometers",
    excerpt:
      "A quieter mountain park of volcanic cones, Pozo Verde, and bird life, with almost no crowds.",
    content: `Juan Castro Blanco is one of the least visited national parks, which is a recommendation if you like waterfalls without a queue. Volcanic cones and vents sit in cloud forest. Pozo Verde is the lake people mention. Quetzals and other highland birds use the canopy.

Access is more local than tour bus. Ask in the towns on the edge for the open trail that week. The park protects water for a large part of the north, so the forest is doing civic work even when the parking lot looks empty.

Google Maps puts the drive from Blessed House at about 5 hours and about 235 kilometers. Save the route: ${mapsLink("Juan Castro Blanco National Park Costa Rica")}

It is a full day. Leave early, and prefer Sunday if you can, because large trucks and trailers mostly do not work and the central roads breathe. Fog in the afternoon can erase the views you came for.

Stay flexible. If a gate is shut, the surrounding dairy hills still feel like Costa Rica before the postcard. Then the Caribbean night at Blessed House is a warm contrast.`,
  },
  {
    slug: "park-poas",
    title: "Poas Volcano, a crater that writes its own rules",
    mapsQuery: "Poas Volcano National Park Costa Rica",
    drive: "about 5.5 hours",
    distance: "about 250 kilometers",
    excerpt:
      "A famous crater lake, acid rain, and closures when the mountain decides the air is not for visitors.",
    content: `Poás is the volcano many guests already know from photos: a wide crater, pale lake, steam. It is also a mountain that closes when gas and acid rain get serious. SINAC timed tickets are part of the visit now. You do not just arrive and hope.

When it is open, the walk is short and the crater is the show. Vegetation near the rim tells the story of fumes. When it is closed, the cloud forest around the park is still worth cool air after a week at sea level.

Google Maps puts the drive from Blessed House at about 5.5 hours and about 250 kilometers. Save the route: ${mapsLink("Poas Volcano National Park Costa Rica")}

Book, then leave Blessed House before dawn. You are crossing the whole country toward the central valley. Weekday trucks on Route 32 are the tax. Sundays are the discount, because large trucks and trailers mostly stay parked.

Check the park site the night before. A closed crater is disappointing only if you had no second plan. Coffee country sits all around Poás. The mountain will still be there for a later year.`,
  },
  {
    slug: "park-arenal",
    title: "Arenal Volcano, the cone everyone already knows",
    mapsQuery: "Arenal Volcano National Park Costa Rica",
    drive: "about 5.5 hours",
    distance: "about 280 kilometers",
    excerpt:
      "A classic cone, lava trails from older eruptions, and hot springs towns at the base.",
    content: `Arenal is the postcard volcano, a near perfect cone that spent decades painting the night with lava and now spends them posing for cameras. The park holds older flows you can walk, forest that grew back, and views of a second volcano, Chato, with a lake in its crater.

The town of La Fortuna does the hot springs and the zip lines. The park itself is quieter if you go for trails rather than a resort day. Watch the weather. The cone hides in cloud as often as it shows off.

Google Maps puts the drive from Blessed House at about 5.5 hours and about 280 kilometers. Save the route: ${mapsLink("Arenal Volcano National Park Costa Rica")}

This is a dawn departure. You cross from Caribbean to northern plains, and weekday cargo will slow you. Sundays remain the civil day on Costa Rican highways because large trucks and trailers mostly rest.

Sleep in La Fortuna if the sunset is the point. If you try it as a day trip from Blessed House, accept a long night return and a very good story at the pool the next morning.`,
  },
  {
    slug: "park-carara",
    title: "Carara National Park, scarlet macaws on the Pacific edge",
    mapsQuery: "Carara National Park Costa Rica",
    drive: "about 5.5 to 6 hours",
    distance: "about 290 kilometers",
    excerpt:
      "The northernmost Pacific rain forest in Costa Rica, famous with birders for scarlet macaws.",
    content: `Carara sits where dry forest and rain forest argue, near the Pacific. It is the northernmost coastal rain forest in the country and a gift to anyone who came to Blessed House already in love with lapas. Scarlet macaws nest and feed here in numbers you can actually see.

Trails are managed and popular with birders. Go slow. The river and the forest edge do the work. Crocodiles in the Tárcoles are a separate roadside circus. The park is the quieter half of that day.

Google Maps puts the drive from Blessed House at about 5.5 to 6 hours and about 290 kilometers. Save the route: ${mapsLink("Carara National Park Costa Rica")}

Leave early. You are aiming across the central valley toward the Pacific, which means trucks until you clear San José’s gravity. Sunday driving is the local cheat code, because large trucks and trailers mostly stay parked.

If macaws were the reason you booked Villa 11, this park is their Pacific cousin. Come home and listen for our own birds with a new ear.`,
  },
  {
    slug: "park-tenorio",
    title: "Tenorio Volcano and the blue of Rio Celeste",
    mapsQuery: "Tenorio Volcano National Park Costa Rica",
    drive: "about 6 hours",
    distance: "about 325 kilometers",
    excerpt:
      "Cloud forest on a volcano, and a river that turns mineral blue at the waterfall.",
    content: `Tenorio is the volcano. Río Celeste is the reason people buy the ticket. Minerals and sulfur meet in the river and turn the water a blue that looks edited. The waterfall and the lagoon are the famous frames. The rest of the park is cloud forest and rain forest on a 1,900 meter cone.

Tickets can sell out. Trails get busy by late morning. The blue is real, and it is also weather. Heavy rain can muddy the color. That is chemistry, not a broken promise.

Google Maps puts the drive from Blessed House at about 6 hours and about 325 kilometers. Save the route: ${mapsLink("Tenorio Volcano National Park Rio Celeste")}

Start before dawn. This is a cross country run, and you want the trail as it opens. Weekdays mean trucks. Sundays mean fewer trailers, because large cargo mostly does not move.

Wear shoes you can soak. Return to Blessed House with blue still in your head. The Caribbean is a different water, and both belong in a Costa Rica week.`,
  },
  {
    slug: "park-los-quetzales",
    title: "Los Quetzales, high ridges named for one bird",
    mapsQuery: "Los Quetzales National Park Costa Rica",
    drive: "about 6 hours",
    distance: "about 250 kilometers",
    excerpt:
      "A mountain park on the road toward the Pacific, built around oak forest and the quetzal.",
    content: `Los Quetzales is honest in its name. The park climbs toward 3,000 meters on the Talamanca, oak forest and cold mornings, and the bird that makes people speak in whispers. You come for a chance, not a guarantee. That is birding.

The Interamericana toward Cerro de la Muerte is the spine of the trip. Views can be huge. Clouds can erase them in ten minutes. Dress in layers. Puerto Viejo clothes will not be enough at dawn up here.

Google Maps puts the drive from Blessed House at about 6 hours and about 250 kilometers. Save the route: ${mapsLink("Los Quetzales National Park Costa Rica")}

Leave very early if you want the bird at feeding hours. The mountain road is slower than the map suggests. Sundays still help on the lower highways because large trucks and trailers mostly stay parked.

If the quetzal does not show, the forest still did. Drive down toward warmth and let Blessed House be the tropical half of a single country that holds both.`,
  },
  {
    slug: "park-la-cangreja",
    title: "La Cangreja, a small park of endemic plants",
    mapsQuery: "La Cangreja National Park Costa Rica",
    drive: "about 6 hours",
    distance: "about 290 kilometers",
    excerpt:
      "A compact Pacific slope park with crystalline rivers and plants that grow almost nowhere else.",
    content: `La Cangreja is small and specific. Dozens of plant species here are endemic to Costa Rica. Rivers run clear. You go for forest and water, not for a famous crater. That is a relief after a week of big names.

Trails can be quiet. Facilities are simple. Treat it as a local park that happens to wear the national title. Puriscal country around it is agricultural and real.

Google Maps puts the drive from Blessed House at about 6 hours and about 290 kilometers. Save the route: ${mapsLink("La Cangreja National Park Costa Rica")}

Make it a dawn start. You will share the first hours with cargo unless you pick Sunday, when large trucks and trailers mostly stay off the road. That is the best tip we can give for any park west of the central valley.

Bring lunch. Come back sun tired. A small park can still fill a day when the drive is half the story.`,
  },
  {
    slug: "park-san-lucas",
    title: "San Lucas Island, a prison that became a park",
    mapsQuery: "Isla San Lucas National Park Costa Rica",
    drive: "about 6 hours plus a boat",
    distance: "about 310 kilometers to Puntarenas",
    excerpt:
      "A tiny Pacific island, once a prison, now the smallest national park, reached by boat from Puntarenas.",
    content: `San Lucas Island is the smallest national park, a short way off Puntarenas, with a prison history that still sits in the buildings. Wildlife took the island back. The visit is part museum, part dry forest, part sea.

You cannot drive onto it. The day is a mainland highway plus a boat. Guided visits explain the cells and the stories. The contrast with Blessed House could not be sharper: we are open garden, this was locked shore.

Google Maps takes you to the dock, about 6 hours and about 310 kilometers to Puntarenas from Blessed House. Save the driving leg: ${mapsLink("Puntarenas Costa Rica")}

Catch the boat timetable or you have no park. Leave at first light. Weekday trucks toward the Pacific are heavy. Sundays are the humane choice because large trucks and trailers mostly stay parked.

Book the crossing before you trust the map. Then let the island be a history day, and the Caribbean garden a reminder that Costa Rica chose parks over prisons in the end.`,
  },
  {
    slug: "park-miravalles",
    title: "Miravalles Jorge Manuel Dengo, volcano and steam",
    mapsQuery: "Miravalles Jorge Manuel Dengo National Park Costa Rica",
    drive: "about 6.5 hours",
    distance: "about 370 kilometers",
    excerpt:
      "A newer national park on a Guanacaste volcano, with geothermal steam and dry forest views.",
    content: `Miravalles Jorge Manuel Dengo is one of the newer names on the list of 30. The volcano rises above Guanacaste with geothermal plants on its slopes. Steam is part of the landscape. The park protects forest on a working energy mountain.

Expect dry forest heat at the base and cooler air as you climb. Trails and access are still catching up to older parks. That can mean fewer people and more asking locally.

Google Maps puts the drive from Blessed House at about 6.5 hours and about 370 kilometers. Save the route: ${mapsLink("Miravalles Volcano Costa Rica")}

This is a long westbound day. Leave before dawn and treat Sunday as a gift, because large trucks and trailers mostly do not work and the Interamericana behaves. Carry water. Guanacaste sun is not Caribbean shade.

If you already love volcanoes, Miravalles is the one that still feels like a rumor. Come home to the pool and you will have crossed climate zones in a single daylight.`,
  },
  {
    slug: "park-piedras-blancas",
    title: "Piedras Blancas, the quiet twin of the Osa",
    mapsQuery: "Piedras Blancas National Park Costa Rica",
    drive: "about 7 hours",
    distance: "about 380 kilometers",
    excerpt:
      "Pacific rain forest near Golfito, part of the Osa conservation puzzle, with few crowds.",
    content: `Piedras Blancas sits across the gulf from the more famous Corcovado story, rain forest and shore in the Osa conservation area. Biological life is rich. Visitor numbers are not. If Corcovado is the poster, this is the neighbor that still has empty trail.

Access can involve boats or rough roads depending on the sector. Guides help. The park is not a casual pull off. That is why it still feels like forest instead of a queue.

Google Maps puts a driving approach from Blessed House at about 7 hours and about 380 kilometers. Save a start: ${mapsLink("Piedras Blancas National Park Costa Rica")}

Count it as an overnight idea more than a day trip. If you drive anyway, leave in the dark and prefer Sunday for the first half, when large trucks and trailers mostly stay parked.

The Osa asks time. Blessed House can be the Caribbean bookend of a trip that also tastes Pacific rain forest. Few guests do both. That is the compliment.`,
  },
  {
    slug: "park-chirripo",
    title: "Chirripo, the roof of Costa Rica",
    mapsQuery: "Chirripo National Park Costa Rica",
    drive: "about 7.5 hours",
    distance: "about 310 kilometers",
    excerpt:
      "The highest mountain in Costa Rica, with paramo, glacial lakes, and a trail you book in advance.",
    content: `Chirripó is the high point of the country, 3,820 meters, with paramo and glacial lakes above the trees. You do not wander up. You reserve, you hike, you sleep in the mountain hostel, and you start for the summit in the dark. It is a national park that behaves like an expedition.

San Gerardo de Rivas is the town at the trail. The walk is long and honest. Cold is real. So is the sunrise if the sky opens. This is not a side trip from the pool. It is a second trip that begins at Blessed House only in the sense that you already have a Costa Rica base.

Google Maps puts the drive from Blessed House at about 7.5 hours and about 310 kilometers to San Gerardo de Rivas. Save the route: ${mapsLink("San Gerardo de Rivas Chirripo Costa Rica")}

You will not hike the same day you drive. Still, leave the Caribbean early so you arrive in daylight. Sunday highways help because large trucks and trailers mostly rest.

Train at sea level in our garden if you like, then go high. Coming back down, the pool at Blessed House will feel like a prize you earned.`,
  },
  {
    slug: "park-manuel-antonio",
    title: "Manuel Antonio, monkeys, beaches, and a crowd",
    mapsQuery: "Manuel Antonio National Park Costa Rica",
    drive: "about 7.5 hours",
    distance: "about 320 kilometers",
    excerpt:
      "Tiny, beautiful, and busy. Squirrel monkeys, beaches, and timed tickets on the Pacific.",
    content: `Manuel Antonio is small, famous, and crowded for a reason. Beaches sit against forest. Squirrel monkeys still use the canopy. Sloths hang over the trail as if they signed a contract. Forbes once put it among the most beautiful parks in the world. The timed ticket system is how SINAC keeps the beauty from being loved to death.

Go early or you go with a parade. Stay on the path. Do not feed the monkeys. The islands offshore hold seabirds. Most of the park’s area is ocean, which is easy to forget when the beach is the postcard.

Google Maps puts the drive from Blessed House at about 7.5 hours and about 320 kilometers. Save the route: ${mapsLink("Manuel Antonio National Park Costa Rica")}

This is not a casual day trip unless you enjoy a very long dark return. If you do it, leave at dawn and aim for Sunday, when large trucks and trailers mostly stay parked and the central roads move.

Book tickets before you trust the parking lot. Then remember Cahuita. You already live beside a reef park that asks much less of your clock.`,
  },
  {
    slug: "park-marino-ballena",
    title: "Marino Ballena, the whale tail beach",
    mapsQuery: "Marino Ballena National Park Costa Rica",
    drive: "about 7.5 hours",
    distance: "about 440 kilometers",
    excerpt:
      "A Pacific marine park at Uvita, with humpback seasons and a sandbar shaped like a tail.",
    content: `Marino Ballena is mostly water. Humpback whales use this Pacific shore in season, two populations in different months, and the beach at Uvita draws a sandbar that looks like a whale tail at low tide. Dolphins and other marine life pass through. The land part is the frame.

Tide times matter more than your watch. Guides for boats are worth it in whale months. The park is a reminder that Costa Rica’s 30 national parks are not all forest.

Google Maps puts the drive from Blessed House at about 7.5 hours and about 440 kilometers. Save the route: ${mapsLink("Marino Ballena National Park Uvita")}

Sleep nearby if whales are the point. A single daylight from Blessed House is possible only with a ruthless dawn start. Sundays help on the long haul because large trucks and trailers mostly do not work.

If you cannot go in season, the tail of sand is still a walk. Then the Caribbean at home is your other ocean, a few minutes from the villas, not 7.5 hours.`,
  },
  {
    slug: "park-rincon-de-la-vieja",
    title: "Rincon de la Vieja, fumaroles and hot earth",
    mapsQuery: "Rincon de la Vieja National Park Costa Rica",
    drive: "about 7.5 hours",
    distance: "about 395 kilometers",
    excerpt:
      "A living volcano in Guanacaste with mud pots, steam vents, waterfalls, and dry forest.",
    content: `Rincón de la Vieja is a volcano that keeps the kitchen on. Fumaroles, mud pits, hot springs, and waterfalls sit in dry forest and wet forest on the same mountain. Trails reach lookouts and the strange ground that smells like minerals.

Heat at the base is serious. Waterfalls are the mercy. Sector openings change when the volcano argues. Check before you drive across the country.

Google Maps puts the drive from Blessed House at about 7.5 hours and about 395 kilometers. Save the route: ${mapsLink("Rincon de la Vieja National Park Costa Rica")}

Leave in the dark. Guanacaste is a long way from Puerto Viejo. Sunday is the civil way to cross, because large trucks and trailers mostly stay parked and you keep more daylight for trails.

Wear shoes you can dirty. Then the pool at Blessed House, which is not volcanic, will still feel like a hot spring of a kinder kind.`,
  },
  {
    slug: "park-santa-rosa",
    title: "Santa Rosa, dry forest, turtles, and a battlefield",
    mapsQuery: "Santa Rosa National Park Costa Rica",
    drive: "about 7.5 hours",
    distance: "about 445 kilometers",
    excerpt:
      "Guanacaste dry forest, nesting beaches, and the site of a defining battle in Costa Rican history.",
    content: `Santa Rosa protects tropical dry forest, a habitat that looks empty until you learn to see it, and beaches where sea turtles nest. It is also a historic site. The Battle of Santa Rosa is part of how Costa Rica tells its story. Monuments and the old hacienda sit inside a national park.

Dry season makes the forest pale and the wildlife easier to spot. Wet season greens everything and turns roads softer. Both are correct versions of the park.

Google Maps puts the drive from Blessed House at about 7.5 hours and about 445 kilometers. Save the route: ${mapsLink("Santa Rosa National Park Costa Rica")}

Treat it as an overnight in Guanacaste. If you insist on a day, steal the morning from sleep and travel on Sunday so large trucks and trailers are mostly out of the way.

Stand in dry forest, then remember our wet Caribbean garden. The country holds both on purpose. That is the lesson worth the kilometers.`,
  },
  {
    slug: "park-guanacaste",
    title: "Guanacaste National Park, two volcanoes and three forests",
    mapsQuery: "Guanacaste National Park Costa Rica",
    drive: "about 7.5 hours",
    distance: "about 440 kilometers",
    excerpt:
      "Part of a World Heritage complex, with Orosí and Cacao volcanoes and dry, wet, and cloud forest.",
    content: `Guanacaste National Park is often visited through Santa Rosa, a quieter partner in a World Heritage set. Volcanoes Orosí and Cacao hold dry forest, wet forest, and cloud forest on one climb. Peccary herds move through. Access can be limited, which is why the park still feels like research country.

You come for the idea as much as the trail: a dry north that still holds cloud on the summits. Guides and station rules matter more here than in a city park.

Google Maps puts the drive from Blessed House at about 7.5 hours and about 440 kilometers. Save the route: ${mapsLink("Guanacaste National Park Costa Rica")}

Pair it with Santa Rosa and sleep in the region. The drive from the Caribbean is the same long westbound story. Early starts and Sundays remain the way to avoid the trailer traffic that owns weekday highways.

If a station is closed, you still crossed into a different Costa Rica. Coming home to Blessed House is coming back to the wet half of the map.`,
  },
  {
    slug: "park-corcovado",
    title: "Corcovado, the lowland forest people fly to see",
    mapsQuery: "Corcovado National Park Costa Rica",
    drive: "about 8 hours plus a boat or hike",
    distance: "about 440 kilometers to Puerto Jimenez",
    excerpt:
      "The great Pacific rain forest of the Osa. Access is controlled, and a guide is part of the deal.",
    content: `Corcovado is the name people save money for. Lowland rain forest on the Osa, beaches, mangroves, tapirs, cats, peccaries, and a feeling that the forest is still in charge. Access is only with approved arrangements. You do not freelance this park.

Puerto Jiménez or Drake Bay are the usual doors, then boat or tough trail to stations like Sirena. It is not a viewpoint. It is a stay. Rangers and guides keep both you and the animals in a workable truce.

Google Maps can get you toward Puerto Jiménez in about 8 hours and about 440 kilometers from Blessed House. The park begins after that. Save the driving start: ${mapsLink("Puerto Jimenez Costa Rica")}

Do not try it as a day trip. If you drive the first leg, leave at dawn and use Sunday for the trucks, because large trailers mostly stay parked. Then let the boat be the real threshold.

Sleep in the Osa. Let Blessed House be the Caribbean chapter of a country that still has a forest like this. Very few coasts on earth can say that.`,
  },
  {
    slug: "park-palo-verde",
    title: "Palo Verde, wetlands of international importance",
    mapsQuery: "Palo Verde National Park Costa Rica",
    drive: "about 8 hours",
    distance: "about 420 kilometers",
    excerpt:
      "A Guanacaste wetland park, half water, built for aquatic birds and the Tempisque flood rhythm.",
    content: `Palo Verde is a wetland the world formally cares about. About half the park is water in season. Migratory and resident aquatic birds pack the marshes. The Tempisque River writes the calendar. Dry months concentrate wildlife. Wet months spread it.

Boat trips on the river are the way many guests actually see the park. The limestone hills and palo verde trees give the name. Heat is part of the ticket.

Google Maps puts the drive from Blessed House at about 8 hours and about 420 kilometers. Save the route: ${mapsLink("Palo Verde National Park Costa Rica")}

Overnight nearby. A same day drive is a punishment. If you still try, leave in the dark and pray for a Sunday, when large trucks and trailers mostly stay parked.

Binoculars beat a phone here. Then the garden birds at Blessed House will look like cousins, which they are.`,
  },
  {
    slug: "park-barra-honda",
    title: "Barra Honda, a park of limestone caves",
    mapsQuery: "Barra Honda National Park Costa Rica",
    drive: "about 8 hours",
    distance: "about 400 kilometers",
    excerpt:
      "Underground Costa Rica. Stalactites, ladders, and caves that are still being learned.",
    content: `Barra Honda is a cave park in Nicoya limestone. Some caverns are open with guides and gear. Others remain unexplored. Stalactites and stalagmites do the slow work. Above ground is dry forest that most people forget to look at after they hear the word cave.

You descend with a ranger, not as a casual stroll. If heights or tight rock bother you, stay on the surface trails and still have a park day.

Google Maps puts the drive from Blessed House at about 8 hours and about 400 kilometers. Save the route: ${mapsLink("Barra Honda National Park Costa Rica")}

This is another Guanacaste clock. Dawn start, Sunday if you can, because large trucks and trailers mostly do not work. Confirm cave tours before you cross the country for a closed hole.

Coming back, the open air of Blessed House will feel like a gift. That is a fair trade after a morning underground.`,
  },
  {
    slug: "park-diria",
    title: "Diria National Park, Nicoya forest and water",
    mapsQuery: "Diria National Park Costa Rica",
    drive: "about 9 hours",
    distance: "about 430 kilometers",
    excerpt:
      "A lesser known Nicoya park of forest and wetlands, far from the Caribbean and worth knowing anyway.",
    content: `Diriá is one of the quiet names on the list of 30. Forest and wetlands on the Nicoya Peninsula, few visitors, and a chance to see the peninsula without a beach club filter. Trails and water are the offer. Facilities stay modest.

You go because you are collecting the set, or because you already have days in Nicoya. From Blessed House it is a pilgrimage. From Santa Cruz it is a local park. Both truths can sit in one post.

Google Maps puts the drive from Blessed House at about 9 hours and about 430 kilometers. Save the route: ${mapsLink("Diria National Park Costa Rica")}

Do not attempt it as a round trip in one daylight unless you like driving more than parks. Leave early when you do go, and pick Sunday for the long highways so large trucks and trailers are mostly absent.

If Diriá is too far for this stay, keep the name. Costa Rica’s park system is not only the five famous ones on the postcard rack.`,
  },
  {
    slug: "park-las-baulas",
    title: "Las Baulas, where leatherbacks chose the Pacific",
    mapsQuery: "Las Baulas National Park Costa Rica",
    drive: "about 9 hours",
    distance: "about 495 kilometers",
    excerpt:
      "A marine park at Playa Grande, one of the most important leatherback nesting beaches on Earth.",
    content: `Las Baulas is the Pacific answer to our Caribbean baula stories. Most of the park is ocean. The beaches around Playa Grande are among the most important leatherback nesting sites in the world. Mangroves hold the coastal edge. Night rules are strict for a reason. Flash and crowds push turtles off the sand.

Villa 3 at Blessed House is named for these animals. Seeing them nest is a privilege you take with a licensed guide or not at all. Season matters. Off season the park is still mangrove and surf.

Google Maps puts the drive from Blessed House at about 9 hours and about 495 kilometers. Save the route: ${mapsLink("Las Baulas National Park Playa Grande")}

This is an overnight on the Nicoya. The drive is a full working day. Sundays ease the trailer traffic because large trucks mostly stay parked, but you still will not want a night highway after a nesting walk.

If you never go, you can still walk our garden and say the name. The same giant turtles use both oceans. That is the thread we wanted this villa to hold.`,
  },
  {
    slug: "park-isla-del-coco",
    title: "Isla del Coco, the park you cannot drive to",
    mapsQuery: "Isla del Coco Costa Rica",
    drive: "no road, a flight and a boat from the Pacific",
    distance: "about 550 kilometers offshore",
    excerpt:
      "A UNESCO marine park 550 kilometers out in the Pacific. Sharks, waterfalls, and no highway.",
    content: `Isla del Coco is the thirtieth park and the one that breaks the driving series. It sits about 550 kilometers off the Pacific coast, a UNESCO World Heritage site of sharks, rays, evergreen forest, and waterfalls that fall into the sea. There is no car trip. Liveaboard boats and rare official access are the only honest sentences.

This is not a Blessed House day outing. It is the far edge of the same national system that also holds Cahuita 20 minutes from our gate. We include it so the April map is complete. Costa Rica did not stop at convenient parks.

Google Maps cannot draw a drive to the island. What it can do is get you toward San José in about 4 hours from Blessed House, about 200 kilometers, which is where flights and expedition boats are arranged. Save that mainland start: ${mapsLink("Juan Santamaria International Airport")}

Even that airport run is better at dawn or on Sunday, when large trucks and trailers mostly stay parked on Route 32. The island itself runs on boat time, not highway time.

If you never go, you still live in a country that chose to protect a rock in the open Pacific. That choice is the same instinct as the garden around the villas, written at a much larger scale.`,
  },
];
