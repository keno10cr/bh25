import ActivityDetail from "@/components/activity-detail"
import styles from "./activities.module.css"

const activities = [
  {
    id: 1,
    name: "Snorkeling Adventure",
    description: "Explore vibrant coral reefs and tropical fish species in crystal-clear waters.",
    fullDescription:
      "Our guided snorkeling tours take you to the best reef spots in Puerto Viejo. Experience an underwater world of colorful fish, sea turtles, and coral formations. All equipment provided, suitable for all skill levels.",
    duration: "3 hours",
    price: "$45 per person",
    difficulty: "Easy",
    groupSize: "Up to 8 people",
    image: "/placeholder.svg?key=snorkel",
    highlights: ["Sea Turtles", "Coral Reefs", "Tropical Fish", "Professional Guide", "All Equipment"],
  },
  {
    id: 2,
    name: "Jungle Canopy Tour",
    description: "Trek through pristine rainforest trails and spot exotic wildlife.",
    fullDescription:
      "Guided jungle tour through the lush rainforest surrounding Puerto Viejo. Spot sloths, monkeys, exotic birds, and unique plants. Our experienced guides share fascinating insights about the ecosystem.",
    duration: "4 hours",
    price: "$55 per person",
    difficulty: "Moderate",
    groupSize: "Up to 6 people",
    image: "/placeholder.svg?key=jungle",
    highlights: ["Wildlife Spotting", "Nature Photography", "Expert Guide", "Hiking Boots Provided", "Refreshments"],
  },
  {
    id: 3,
    name: "Sunset Catamaran Cruise",
    description: "Cruise along the Caribbean coastline and witness breathtaking Caribbean sunsets.",
    fullDescription:
      "Sail along the picturesque Caribbean coast on our comfortable catamaran. Enjoy refreshments, music, and stunning sunset views. Perfect for couples or family outings. Complimentary drinks and snacks included.",
    duration: "2.5 hours",
    price: "$65 per person",
    difficulty: "Easy",
    groupSize: "Up to 20 people",
    image: "/placeholder.svg?key=catamaran",
    highlights: ["Scenic Views", "Complimentary Drinks", "Live Music", "Photography Moments", "Comfortable Seating"],
  },
  {
    id: 4,
    name: "Wildlife Spotting Safari",
    description: "Dedicated tour to spot sloths, monkeys, and exotic birds in their natural habitat.",
    fullDescription:
      "Early morning wildlife safari to maximize your chances of spotting Costa Rica's most beloved animals. Our naturalist guides know exactly where to find sloths, howler monkeys, and colorful birds. Binoculars provided.",
    duration: "5 hours",
    price: "$75 per person",
    difficulty: "Moderate",
    groupSize: "Up to 8 people",
    image: "/placeholder.svg?key=wildlife",
    highlights: ["Sloths", "Monkeys", "Exotic Birds", "Binoculars Included", "Expert Naturalist"],
  },
  {
    id: 5,
    name: "Beach Yoga & Meditation",
    description: "Practice yoga on pristine beach while listening to ocean waves.",
    fullDescription:
      "Rejuvenate your mind and body with beachfront yoga sessions. Our certified instructors guide you through relaxing poses while overlooking the Caribbean Sea. Mats and props provided.",
    duration: "1.5 hours",
    price: "$30 per person",
    difficulty: "Easy",
    groupSize: "Up to 12 people",
    image: "/placeholder.svg?key=yoga",
    highlights: ["Certified Instructor", "Beach Setting", "All Equipment", "Meditation", "Relaxation"],
  },
  {
    id: 6,
    name: "Scuba Diving Expedition",
    description: "Explore deeper underwater ecosystems with certified diving instructors.",
    fullDescription:
      "Take your diving to the next level with our professional diving expeditions. Visit multiple dive sites, encounter sea turtles, rays, and larger fish species. PADI certified instructors ensure safety.",
    duration: "4 hours",
    price: "$120 per person",
    difficulty: "Advanced",
    groupSize: "Up to 6 people",
    image: "/placeholder.svg?key=scuba",
    highlights: [
      "Deep Sea Exploration",
      "PADI Certified",
      "Professional Equipment",
      "Marine Life",
      "Underwater Photography",
    ],
  },
]

export default function ActivitiesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Things to Do in Puerto Viejo</h1>
        <p>Create unforgettable memories with our exciting activities and tours</p>
      </div>

      <div className={styles.grid}>
        {activities.map((activity) => (
          <ActivityDetail key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
