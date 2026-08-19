import { STATIC_ACTIVITIES } from "./activities.js";
import { STATIC_VILLAS } from "./villas.js";

const SERIES_START = new Date("2026-08-18T16:00:00.000Z");
const SERIES_INTERVAL_DAYS = 4;

function publishedAtFrom(start, days) {
  const date = new Date(start);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function toBlocks(text, slug) {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${slug}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${slug}-s${index}`,
          text: paragraph,
          marks: [],
        },
      ],
    }));
}

const ACTIVITY_POSTS = {
  "family-reunions": {
    title: "Family gatherings in the Caribbean garden",
    category: "Retreats",
    excerpt:
      "Blessed House is built for families who want private cabins and shared meals under the same canopy.",
    content:
      "A family week works best when everyone has a quiet place to sleep and a generous place to meet. At Blessed House each cabin stays private, while the pool, BBQ, and communal table pull the group back together for breakfast, sunset talks, and long lunches.\n\nGroups of up to 45 people can stay on the property without leaving for every meal. The gardens sit between Puerto Viejo and Hone Creek, so after a shared morning you can still reach the beach in minutes.\n\nMornings often start slow. Kids find the pool, grandparents take the shade, and someone starts coffee in the kitchen. That mix is the point of a reunion here. You are together without being stacked in one house.\n\nAfternoons can split. Some people walk to town, others nap, others stay at the table with cards. The land is big enough that those choices do not collide. In the evening the BBQ brings everyone back to the same light and the same stories.\n\nIf you are planning dates, tell us the size of the group early so we can match cabins. Family weeks fill with cousins and extra beds. The property is ready for that, as long as we know who is coming.",
  },
  weddings: {
    title: "A Caribbean wedding among the trees",
    category: "Retreats",
    excerpt:
      "Couples celebrate with up to 50 guests in a private garden setting, with kitchen space or catering on site.",
    content:
      "Weddings at Blessed House stay close to the land. The gardens, pool terrace, and kitchen give you room for vows, dinner, and dancing without a ballroom feel. Capacity stays at 50 guests, which keeps the day personal.\n\nCouples can cook with family in the equipped kitchen or bring catering. Either way the celebration stays on the property, with cabins nearby so guests can walk home under the same trees.\n\nThe light here does a lot of the decorating. Late afternoon through the canopy is softer than most halls, and the air smells like rain and flowers instead of perfume. Many couples say the vows near the garden paths and then move to the terrace for dinner.\n\nRain is part of the Caribbean. We plan shade and a covered option so a shower does not end the night. Guests already sleeping on site means nobody is racing a taxi after the last song.\n\nIf this is the setting you want, write to us with a date range and a guest count. We will tell you what the land can hold and how meals, music, and rest can share the same garden.",
  },
  aerobics: {
    title: "Aerobics with garden air and morning light",
    category: "Retreats",
    excerpt:
      "Group sessions on the property help guests start the day with energy, at any fitness level.",
    content:
      "Aerobics at Blessed House is a simple way to move before the heat builds. Sessions happen on the property, so you do not need a gym or a taxi. All fitness levels are welcome, from a light warm up to a fuller workout.\n\nGuests often use the class as a daily reset, then walk to breakfast or the pool. It is one of the easiest on site activities to join during a stay.\n\nThe session is social without being a performance. You hear birds more than speakers, and you can drop the intensity if yesterday was a long beach walk. That flexibility is why mixed ages show up together.\n\nBring shoes you can move in and water. Shade shifts through the morning, so the meeting spot can change with the sun. Ask at reception the night before if you want the exact time.\n\nIf you prefer to stretch on your own, the same open spaces still work. The class is there when you want company. The garden is there when you want quiet.",
  },
  manzanillo: {
    title: "A short trip to Manzanillo and the wildlife refuge",
    category: "Local Spot",
    excerpt:
      "South of Blessed House, Manzanillo opens onto refuge beaches, forest shade, and a slower shoreline.",
    content:
      "Manzanillo sits a short ride from Blessed House and feels like a different pace of the same coast. The Gandoca Manzanillo Wildlife Refuge protects forest that meets the sand, so a walk can move from beach to birdsong in a few minutes.\n\nBring water, wear shoes you can get wet, and give yourself a half day. The beaches stay quieter than Puerto Viejo, which is why so many guests make this their first outing.\n\nThe village itself is small. You can eat, look at the water, and then follow a trail into shade without a long transfer. Howler monkeys and crabs are common company if you walk slowly and keep voices down.\n\nTide matters. At lower water the sand opens. At higher water the forest edge feels closer. Ask us about the tide before you leave so you are not surprised by a wet path.\n\nCome back through Punta Uva if you still have light. The ride south and the ride home can be the same road and two different days, depending on when you stop.",
  },
  "el-mirador": {
    title: "The uphill trail to El Mirador",
    category: "Retreats",
    excerpt:
      "A steep garden path leads to a lookout over the property, the forest, and the Caribbean.",
    content:
      "El Mirador is the lookout on the Blessed House land. The trail climbs, so closed shoes matter more than speed. Once you reach the top, the property, the canopy, and a slice of beach sit in one view.\n\nAsk the team before you go, especially after rain. The walk takes about 1 to 2 hours at an easy pace, and it is free for guests who want to know the land they are sleeping on.\n\nThe path is not a city sidewalk. Roots, mud, and insects are part of the climb. That is also why the view feels earned. You leave the pool noise and arrive in wind and quiet.\n\nGo in the morning if you want clearer air. Midday heat makes the same slope harder, and clouds can sit on the ridge in the afternoon. Carry water even if the walk looks short on a map.\n\nDo not go in sandals or barefoot. If the team says wait a day after heavy rain, wait. The lookout will still be there, and a dry trail is a better story than a slip.",
  },
  "social-area": {
    title: "The social area beside the pool",
    category: "Retreats",
    excerpt:
      "Open seating, a television, and shade make this the gathering room of Blessed House.",
    content:
      "The social area sits next to the pool and works as the living room of the property. Comfortable seating and a television make it easy for a group to rest after the beach without closing themselves in a cabin.\n\nPlease leave the space tidy for the next guests. It is included in your stay and stays open through the day, which is why it becomes the natural meeting point between swims and dinner.\n\nFamilies use it for games. Couples use it for a slow afternoon. Solo guests use it to be near people without having to talk. The same furniture holds all three moods if everyone treats it as shared.\n\nThe television is there when rain pins you to the property. The seating is there when the sun is too strong for the pool deck. Either way you stay in the garden instead of in a dark room.\n\nIf you move chairs, put them back. If you bring snacks, take the wrappers with you. Small habits keep this room feeling open for whoever arrives next.",
  },
  pool: {
    title: "Cooling off in the shared pool",
    category: "Retreats",
    excerpt:
      "The pool is open to every guest, with shade, garden edges, and a deepest point of 1.80 meters.",
    content:
      "After a walk in Puerto Viejo or a ride from the beach, the shared pool is the easiest way to reset. It belongs to every guest, and the garden around it keeps the water feeling tucked into the property rather than set on a deck.\n\nPlease read the usage rules before you swim. The pool stays open until 10 pm, and the deepest point is 1.80 meters.\n\nShade moves across the water through the day. Morning is quieter. Late afternoon fills with people coming back from town. Both hours are good if you like different kinds of company.\n\nChildren should be watched. The pool is shared, not staffed like a resort deck. Rinse off sand before you enter so the water stays clear for the next swim.\n\nAt night the garden noise replaces the town noise. A last dip before 10 pm is a common close to the day. Then the water rests, and so do the neighbors in the nearest cabins.",
  },
  "fishing-tours": {
    title: "Fishing with local captains on the Caribbean",
    category: "Local Spot",
    excerpt:
      "Traditional boats, local species, and a half day on the water with captains who know this coast.",
    content:
      "Fishing tours from Puerto Viejo put you on a traditional boat with captains who work these waters year round. The day is about local species and coastal knowledge, whether you have fished before or this is your first time on a boat.\n\nPlan 4 to 6 hours and a small group, usually up to 6 people per boat. Book ahead through Blessed House so the captain can match tide, weather, and the kind of outing you want.\n\nMornings are often calmer. The light on the water is better for seeing birds and the line of the coast from Cahuita toward Manzanillo. Sunscreen, a hat, and a dry bag matter more than fancy gear.\n\nCatch depends on season and luck. The captains will tell you what is running. Eat what you keep when you can, and release what you should. That is how this coast stays a fishing coast.\n\nIf the swell is wrong, we move the day. A good captain would rather wait than take a rough beating for a photo. Tell us your dates and we will find a window that respects the sea.",
  },
  "surf-lessons": {
    title: "Surf lessons at Cocles and Salsa Brava",
    category: "Local Spot",
    excerpt:
      "Local instructors teach morning or evening sessions at nearby Caribbean breaks.",
    content:
      "Surf lessons near Blessed House use the breaks guests already hear about, Cocles and Salsa Brava among them. Local instructors keep groups small, usually up to 4 people, and they choose morning or evening light depending on the swell.\n\nYou do not need to arrive as a surfer. The point is a safe first session in warm water, then a ride back to the garden for breakfast or sunset.\n\nCocles is often the gentler classroom. Salsa Brava is famous and more serious. Instructors will not put a first timer in the wrong place just because the name is known. Trust that call.\n\nBring a rash guard if you have one, and expect to be tired in new muscles. Two to three hours in the water is enough for a first day. Another session later in the week usually feels easier.\n\nWe can help you book. Tell us your level honestly, even if that level is none. The right beach and the right hour matter more than courage on the wrong peak.",
  },
  "bribri-cacao-tour": {
    title: "Making chocolate on a Bribri cacao tour",
    category: "Local Spot",
    excerpt:
      "Cacao trees, family recipes, and a hands on look at chocolate between Puerto Viejo and Cahuita.",
    content:
      "Cacao grows all around Puerto Viejo, and Bribri families still know the plant from seed to drink. A cacao tour is less a museum visit than a kitchen visit. You see the fruit opened, the beans roasted, and chocolate made with recipes that belong to this coast.\n\nThere is also a museum on the way to Cahuita if you want more history after the tasting. The outing lasts about 3 to 4 hours and suits mixed ages.\n\nYou will likely get sticky hands. That is the point. Chocolate here is work before it is a bar, and the smell of roasted beans stays with you on the ride home.\n\nAsk questions, but let the hosts set the pace. This is their plant and their kitchen. Photos are welcome when they are welcome. If someone asks you to wait, wait.\n\nWear shoes for farm paths, not beach sandals. Shade is uneven and the ground can be wet. Come back to Blessed House with a small bag of what you made, and the garden will smell like cacao for the rest of the afternoon.",
  },
  kayaking: {
    title: "Kayaking the shoreline from a new angle",
    category: "Local Spot",
    excerpt:
      "Paddle Puerto Viejo, Punta Uva, Playa Chiquita, or Manzanillo, or join a guided park tour.",
    content:
      "Kayaking changes the Caribbean from a beach walk into a water path. From a sit on kayak you see reefs, river mouths, and the line of palms the way fishers see them. You can paddle near Puerto Viejo, Punta Uva, Playa Chiquita, or Manzanillo.\n\nFor a longer outing, join a guided trip into Cahuita National Park. Sessions usually last 2 to 4 hours, and Blessed House can help you match the water to your comfort.\n\nCalm mornings are kinder than windy afternoons. If you have not paddled in a while, start close to shore. The views are still new, and the swim back is shorter if you tip.\n\nA guided park paddle adds wildlife and a person who knows where the reef sits. That is worth it if you want more than a workout. Go with a group that keeps the same pace.\n\nBring a dry bag for phones and a shirt that can get wet. Tell us if you want quiet water or a longer push. We would rather send you to the right beach than to the famous one.",
  },
  "volio-waterfalls": {
    title: "Volio waterfalls ten minutes from home",
    category: "Local Spot",
    excerpt:
      "Rainforest pools and several falls sit a short ride inland from Blessed House.",
    content:
      "Volio is close enough that guests sometimes skip it, then wish they had gone sooner. A ten minute ride from Blessed House reaches rainforest waterfalls where you can swim, sit on rock, and listen to the forest work.\n\nGive it a half day rather than a rushed stop. Wear shoes with grip, and ask the team about recent rain before you go.\n\nThe pools change with the season. After rain they are louder and cooler. In a dry spell they are clearer and easier to sit beside. Both versions are worth the short trip inland.\n\nDo not climb wet rock for a better photo. The falls are already the view. Keep bags on high ground and watch your footing on moss.\n\nCome back sandy or muddy and rinse at the property. That is a good day. Volio is the reminder that the forest starts a few minutes from the cabins, not only on a long tour bus.",
  },
  "punta-uva": {
    title: "Punta Uva reef, river, and walking trails",
    category: "Local Spot",
    excerpt:
      "A free, easy outing to a beach with reef views, a nearby river, and paths into the point.",
    content:
      "Punta Uva is one of the gentlest days you can take from Blessed House. The beach looks toward a reef peak, a river meets the sand nearby, and walking trails continue into the point if you want shade after a swim.\n\nThere is no ticket and no rush. Two to three hours is enough for a first visit, and many guests return at a slower hour for the light.\n\nThe water can be clear on a calm morning. Snorkel close to shore if you have a mask, and stay respectful of the reef. It looks close. It is still a living wall.\n\nThe river is a place to rinse and to watch the meeting of fresh water and sea. Kids like it. So do people who want a sit without swimming far.\n\nPark with care and keep food packed. Monkeys and raccoons know picnic habits. A clean bag and a quiet walk will give you more of Punta Uva than a loud afternoon on the sand.",
  },
  ketos: {
    title: "Ketos, a paddle game for the beach",
    category: "Retreats",
    excerpt:
      "Play in pairs or as a group, then try the online version if you want another round after the sand.",
    content:
      "Ketos is a paddle game that fits a beach afternoon. You can play as a pair or with a small group, and the only real rule is to keep the rally alive. It is light, social, and easy to learn even if you did not pack sport gear.\n\nThere is also an online version if you want to practice after you leave the sand. Ask at Blessed House if you want to try it during your stay.\n\nThe game works in a small space, which is why it belongs at the beach and at the property. You do not need a court. You need a bit of flat sand or grass and people willing to laugh when the ball drops.\n\nPlay before the sun is high. Heat makes every rally shorter. A morning round and a swim is a better pair than a long match at noon.\n\nIf you like it, take the online version home. The physical game is still the one that belongs here, with salt on the paddles and the Caribbean in the background.",
  },
  "practice-waste-sorting": {
    title: "Practice Costa Rica waste sorting as a game",
    category: "Retreats",
    excerpt:
      "A short browser game teaches local recycling rules with bins, coins, and a little friendly pressure.",
    content:
      "Costa Rica sorts waste in ways that surprise many visitors. The easiest way to learn is to practice. This short game, playable in a browser, puts the bins in front of you and asks you to place each item where it belongs.\n\nIt works on a tablet or a computer, with swipes or arrows. Ten to thirty minutes is enough, and it makes the real bins at Blessed House much clearer the same day.\n\nOrganic waste, plastics, glass, and other streams are not the same as at home. Guessing fills the wrong bin. Playing once saves the staff from sorting your mistakes later.\n\nKids often beat adults. That is fine. Make it a family round after dinner and then walk to the real bins with new eyes.\n\nThe goal is not a high score for its own sake. The goal is a cleaner garden and a coast that already works hard to stay clean. Play, then sort for real.",
  },
  "cahuita-national-park": {
    title: "Jungle trails and beaches in Cahuita National Park",
    category: "Local Spot",
    excerpt:
      "Less than thirty minutes from Blessed House, Cahuita mixes rainforest paths with open Caribbean sand.",
    content:
      "Cahuita National Park is the classic half day from Blessed House. Trails run between jungle and beach, so you can watch howler monkeys in the morning and swim before lunch. The park sits less than thirty minutes away.\n\nGo early if you want quieter paths. Wear shoes you can walk in for hours, and keep snacks packed out. It is one of the clearest pictures of this coast in a single outing.\n\nThe park has more than one entrance and more than one mood. Some stretches are boardwalk and roots. Some are open sand. Both sit inside the same protected strip of coast.\n\nWildlife comes closer when you stop talking. Sloths, lizards, and crabs are easier to miss than you think. Give yourself time to look up and down, not only forward.\n\nPay the entrance, follow the rules, and do not feed animals. The park is why this shoreline still feels like forest meeting sea. Come back to Blessed House tired in a good way, with sand in your shoes and the rest of the day free.",
  },
  "e-bike-rental": {
    title: "E bike days through beaches and town",
    category: "Local Spot",
    excerpt:
      "Electric bikes from Puerto Viejo Bike Rentals make beaches, parks, and cacao roads easy to reach.",
    content:
      "An e bike turns the stretch between Puerto Viejo, Playa Negra, Cocles, and Punta Uva into a single looping day. You cover more ground than a walk and stay cooler than a full pedal, which is why so many guests rent for a half day or a full day.\n\nPuerto Viejo Bike Rentals sits in town. Blessed House can point you there, and the ride back through the garden roads is part of the pleasure.\n\nThe assistance helps on humid hills. You still steer, brake, and watch for dogs, buses, and sudden rain. Helmets are not optional in our advice, even when the law feels relaxed.\n\nStop when the beach looks right. The point of the bike is not a fitness score. It is Cocles at one hour and a cacao stand at the next without waiting for a taxi.\n\nLock the bike when you swim. Carry water. Come home before dark if you do not know the road. The coast is beautiful at dusk and harder to share with traffic.",
  },
};

const ANIMAL_POSTS = [
  {
    villa: STATIC_VILLAS[0],
    title: "Baula turtles, the giants that nest on this coast",
    excerpt:
      "Leatherback turtles, called baula here, nest on Caribbean beaches near Cahuita, mostly from March to July.",
    content:
      "Villa 3 takes its name from the baula, the leatherback sea turtle, the largest turtle on Earth. These animals nest on Caribbean beaches, especially near Cahuita National Park, mainly between March and July.\n\nIf you walk night beaches during nesting season, go with a licensed guide and keep lights low. From Blessed House the connection is close. The same sea you swim in by day is the highway these turtles have used for longer than any villa has stood here.\n\nLeatherbacks do not have a hard shell like other sea turtles. Their backs are ridged and dark, built for deep water. Seeing one come ashore is rare and should stay rare. Crowds and flash photos push them off the beach.\n\nHatchling season needs the same care. Do not pick them up to help unless a trained guide says so. The walk from nest to water is part of how they learn the coast.\n\nVilla 3 sits in the garden, not on the nesting sand. The name is a reminder. Sleep here, swim here, and if you go to the night beach, go as a guest of the turtles, not as their audience.",
  },
  {
    villa: STATIC_VILLAS[1],
    title: "Colibri, the hummingbirds in the garden",
    excerpt:
      "Costa Rica holds more than 50 hummingbird species, and they feed every 10 to 15 minutes among the heliconias.",
    content:
      "Villa 4 is named Colibri, the hummingbird. Costa Rica is home to more than 50 species, and they live at a pace that looks impossible until you watch one hover at a heliconia. They feed on nectar every 10 to 15 minutes, which is why garden paths at Blessed House stay busy with tiny wings.\n\nSit still near flowers in the morning. You do not need a long hike. The birds come to the same plants that line the walk between cabins, and a quiet ten minutes is often enough.\n\nHeliconias, ginger, and other garden plants do the inviting. We keep those plantings because they feed more than the eye. A hummingbird at the railing is not decoration. It is the garden working.\n\nDo not put out sugar water without asking. Wrong mix and dirty feeders harm the birds we named the villa for. Flowers already do the job.\n\nVilla 4 is scaled for a couple or a small family, close to the trees. Open a window in the morning and listen before you look. The first sound is often wings.",
  },
  {
    villa: STATIC_VILLAS[2],
    title: "Jaguars of the coastal forest",
    excerpt:
      "The jaguar is the largest cat in the Americas, and Costa Rica still tracks them in protected coastal lands.",
    content:
      "Villa 5 carries the jaguar, the largest cat in the Americas. In Costa Rica their numbers are watched in protected coastal forests, where they swim as well as they hunt. You are unlikely to see one from a cabin deck, and that is part of the respect the name asks for.\n\nWhat you can see is the habitat they need. The green corridor around Puerto Viejo, Cahuita, and the inland ridges is why this coast still holds big cats at all. A stay at Blessed House puts you at the edge of that forest, not in a zoo exhibit.\n\nJaguars need room, prey, and dark cover. Roads, dogs, and night lights shrink that room. The parks to the north and south are not extras on a map. They are the reason the name still belongs here.\n\nIf you hike, go with sense. Make noise on blind corners, keep food packed, and leave the forest as you found it. A sighting would be luck. A healthy forest is the better souvenir.\n\nVilla 5 is built for families and friends who like space. The jaguar on the door is a neighbor you will probably never meet, and that is the correct ending to the story.",
  },
  {
    villa: STATIC_VILLAS[3],
    title: "Rana roja in the leaf litter",
    excerpt:
      "The strawberry poison dart frog forages in humid lowland leaves and is a common jewel of this coast.",
    content:
      "Villa 6 is Rana Roja, the strawberry poison dart frog. These small frogs forage in low lying leaf litter of humid lowland forest, which makes them a frequent sight in the Southern Caribbean if you look down as often as you look up.\n\nAfter rain, walk slowly along garden edges. Do not handle the frogs. Their color is the whole show, and Blessed House is built in the same damp shade they already chose.\n\nThe red is a warning. Skin toxins are part of how they live, even if a passing glance looks like a toy. Wet hands and curiosity are a bad pair.\n\nLook for them on the ground, not in the canopy. They are daytime animals here, which is a gift. You can see one on the way to breakfast if you are paying attention.\n\nVilla 6 is a small retreat with the forest close. Keep the leaf litter where it is. That mess of leaves is a home, and the frog is why the villa has its name.",
  },
  {
    villa: STATIC_VILLAS[4],
    title: "Rana verde, the red eyed tree frog",
    excerpt:
      "By day this frog hides under green leaves. By night those red eyes open on the underside of the canopy.",
    content:
      "Villa 7 is named for rana verde, the red eyed tree frog. It is nocturnal and spends daylight pressed to the underside of leaves, camouflaged until night. The famous red eyes are a surprise, not a constant display.\n\nA night walk with care, no grabbing and no bright flood lights, is the honest way to look. The gardens of Blessed House already hold the kind of wet leaves this frog prefers.\n\nBy day you might walk past a dozen and see none. That is the camouflage working. At night a red eye and a slow blink can stop you on the path.\n\nUse a dim light, never a camera flash in the face. If you cannot find one, that is still a good walk. The frog does not owe you a photo.\n\nVilla 7 sits with garden access and a calmer mood. Leave windows screened, leave leaves on the plants, and let the night chorus be the welcome.",
  },
  {
    villa: STATIC_VILLAS[5],
    title: "Oso perezoso, sloths in the cecropia",
    excerpt:
      "Sloths live on a leaf diet so slow that one meal can take up to a month to digest.",
    content:
      "Villa 8 honors oso perezoso, the sloth. Leaves are a low energy food, so metabolism stays extremely slow. A single meal can take up to a month to digest, which is why a sloth in a cecropia looks like part of the tree until it moves one arm.\n\nGuests who look up from the garden paths often find them without leaving the property. Quiet looking works better than a loud hike. Give the canopy ten minutes and let the animal stay where it is.\n\nTwo toed and three toed sloths both use this coast. You may see one hanging in a bright cecropia, which they like for the leaves and the open view. Binoculars help. Shouting does not.\n\nNever try to touch a sloth. They are not slow because they are tame. They are slow because their food is poor, and stress costs them more than it costs you.\n\nVilla 8 opens toward the gardens on purpose. Step outside in the morning, look up, and wait. If the canopy is empty, wait again tomorrow. The sloth is on its own clock.",
  },
  {
    villa: STATIC_VILLAS[6],
    title: "Mono cariblanco, the white faced capuchin",
    excerpt:
      "White faced capuchins are among the most inventive monkeys here, and they sometimes use rocks as tools.",
    content:
      "Villa 9 is Mono Cariblanco, the white faced capuchin. These monkeys rank among the most intelligent in this part of the world and have been seen using rocks to open hard food. They move in social groups and they are curious, which is why fruit bowls on railings are a bad idea.\n\nWatch from a distance. The forest around Blessed House is part of their route between coast and hills, and a respectful stay means you do not feed them even when they look back.\n\nA troop can pass in minutes. You will hear them first. Then faces appear in the trees, and then they are gone toward the next fruiting tree.\n\nClose doors, hide snacks, and do not tease. A fed monkey becomes a problem for the next guest, and sometimes a danger. Intelligence plus hunger is not cute for long.\n\nVilla 9 is for people who like to sit outside. Sit, watch, and keep your breakfast. The white faced monkey is a neighbor with a schedule, not a show.",
  },
  {
    villa: STATIC_VILLAS[7],
    title: "Mono ardilla, the squirrel monkey in the canopy",
    excerpt:
      "Squirrel monkeys carry a large brain for their size and move through the trees in quick, talkative groups.",
    content:
      "Villa 10 takes the name mono ardilla, the Central American squirrel monkey. Relative to body size they have a very large brain, and it shows in how fast a troop can change direction in the canopy.\n\nListen first. The chatter often arrives before the animals. From Blessed House you are in their neighborhood, so keep food packed and let them pass through the trees they already own.\n\nThey are smaller than capuchins and often travel in bigger groups. A passing troop can fill a whole line of trees and then empty it just as fast.\n\nDo not try to call them closer. They are busy. Your job is to stand still and enjoy the noise. A phone video from far away is enough.\n\nVilla 10 is compact and close to the garden paths. Morning coffee outside is the best seat. If the troop comes, you will know. If it does not, the trees are still theirs.",
  },
  {
    villa: STATIC_VILLAS[8],
    title: "Lapa roja, scarlet macaws for life",
    excerpt:
      "Scarlet macaws pair for life, and their red, blue, and yellow feathers help the flock stay in conversation.",
    content:
      "Villa 11 is Lapa Roja, the scarlet macaw. These birds often mate for life, and the bright red, blue, and yellow plumage is more than show. It helps them read one another inside a noisy flock.\n\nA macaw overhead is one of the loudest gifts of a Caribbean morning. Look up from the garden or the pool. If you are lucky the pair will cross the property the same way they have crossed this coast for generations.\n\nThey nest in cavities and need tall trees. That is another reason the remaining forest matters. A macaw without a nest is a postcard without a future.\n\nDo not share fruit to make them land. Wild birds that learn to beg stop being wild. Watch them fly. That is the better memory.\n\nVilla 11 looks over the treetops on purpose. Step out at first light. If the sky is quiet, wait for the call. You will hear them before you see the color.",
  },
  {
    villa: STATIC_VILLAS[9],
    title: "Mariposa morpho, blue that is not paint",
    excerpt:
      "The blue morpho looks painted, but the color is light bouncing off tiny structures on the wing.",
    content:
      "Villa 12 is Mariposa Morpho, the blue morpho butterfly. That electric blue is not pigment. Micro structures on the scales reflect light, so the wing color changes as the animal turns. The brown underside is the other half of the trick, camouflage when the wings close.\n\nWalk garden edges in still weather. Morphos flash and vanish, which is why a slow loop around Blessed House can feel like a better butterfly outing than a rushed tour.\n\nThey like damp forest openings and the kind of paths we already have. Mid morning after a light rain is often good. Wind makes them harder to follow.\n\nDo not chase into the brush. The flash of blue is the whole encounter. A net or a grabbing hand has no place here.\n\nVilla 12 is a quieter unit for rest after the coast. Leave time between beach and dinner for a slow walk. If a morpho crosses the path, you will understand the name at once.",
  },
];

const ACTIVITY_SERIES = STATIC_ACTIVITIES.map((activity, index) => {
  const copy = ACTIVITY_POSTS[activity.slug];
  const slug = `journal-${activity.slug}`;
  return {
    id: `series-activity-${activity.slug}`,
    title: copy.title,
    slug,
    category: copy.category,
    publishedAt: publishedAtFrom(SERIES_START, index * SERIES_INTERVAL_DAYS),
    excerpt: copy.excerpt,
    featuredImage: activity.image,
    content: toBlocks(copy.content, slug),
  };
});

const ANIMAL_SERIES = ANIMAL_POSTS.map((post, index) => {
  const slug = `journal-${post.villa.slug}`;
  return {
    id: `series-animal-${post.villa.slug}`,
    title: post.title,
    slug,
    category: "Fauna",
    publishedAt: publishedAtFrom(
      SERIES_START,
      (STATIC_ACTIVITIES.length + index) * SERIES_INTERVAL_DAYS
    ),
    excerpt: post.excerpt,
    featuredImage: post.villa.image,
    content: toBlocks(post.content, slug),
  };
});

export const SERIES_BLOG_POSTS = [...ACTIVITY_SERIES, ...ANIMAL_SERIES];
