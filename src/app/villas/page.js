import VillaCard from "@/components/villa-card";
import styles from "./villas.module.css";

const villas = [
  {
    id: 1,
    name: "Ocean Breeze Villa",
    category: "Near Beach",
    price: "$350",
    bedrooms: 3,
    bathrooms: 2,
    description:
      "Luxurious villa located less than 5 minutes (1.6km) from the beach. Stunning sunrise views and modern amenities.",
    features: ["Near Beach", "Ocean View", "Hot Tub", "BBQ Area", "WiFi", "AC"],
    image: "/luxury-beachfront-villa-tropical.jpg",
  },
  {
    id: 2,
    name: "Jungle Retreat Bungalow",
    category: "Garden",
    price: "$250",
    bedrooms: 2,
    bathrooms: 1,
    description:
      "Cozy bungalow nestled in lush tropical jungle. Experience nature in comfort with modern conveniences.",
    features: ["Garden View", "Outdoor Shower", "Nature Trail", "WiFi", "AC", "Kitchen"],
    image: "/jungle-bungalow-surrounded-by-trees.jpg",
  },
  {
    id: 3,
    name: "Sunset View Premium",
    category: "Hilltop",
    price: "$300",
    bedrooms: 2,
    bathrooms: 2,
    description:
      "Perfect vantage point for Caribbean sunsets. Premium amenities with panoramic views of the coast and jungle.",
    features: ["Sunset View", "Infinity Pool", "Terrace", "WiFi", "AC", "Mini Bar"],
    image: "/tropical-bungalow-sunset-view.jpg",
  },
  {
    id: 4,
    name: "Coconut Palms Villa",
    category: "Near Beach",
    price: "$380",
    bedrooms: 4,
    bathrooms: 3,
    description:
      "Spacious family villa surrounded by coconut palms. Perfect for larger groups with full resort amenities.",
    features: [
      "Private Pool",
      "Beach Access",
      "Chef Kitchen",
      "WiFi",
      "AC",
      "Entertainment Area",
    ],
    image: "/luxury-beachfront-villa-tropical.jpg",
  },
  {
    id: 5,
    name: "Secluded Paradise",
    category: "Garden",
    price: "$280",
    bedrooms: 2,
    bathrooms: 2,
    description:
      "Private retreat away from the hustle. Surrounded by exotic plants and peaceful ambiance.",
    features: ["Privacy Gate", "Garden", "Outdoor Shower", "WiFi", "AC", "Hammocks"],
    image: "/jungle-bungalow-surrounded-by-trees.jpg",
  },
  {
    id: 6,
    name: "Moonlight Escape",
    category: "Near Beach",
    price: "$320",
    bedrooms: 3,
    bathrooms: 2,
    description:
      "Experience tropical nights under the stars. Located less than 5 minutes (1.6km) from the beach with spacious layout and modern luxury.",
    features: ["Beach View", "Deck", "Outdoor Lounge", "WiFi", "AC", "Coffee Bar"],
    image: "/tropical-beach-bungalow-resort.jpg",
  },
];

export default function VillasPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Our Villas & Bungalows</h1>
        <p>Choose from our collection of luxurious accommodations in Puerto Viejo</p>
      </div>

      <div className={styles.grid}>
        {villas.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}
      </div>
    </div>
  );
}

