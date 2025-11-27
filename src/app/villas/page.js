"use client";

import { useState, useEffect, useRef } from "react";
import VillaCard from "@/components/villa-card";
import styles from "./villas.module.css";

// Helper function to generate gallery images for each villa
const getGalleryImages = (villaNumber) => {
  const folder = `/villas/${villaNumber}/`;
  
  const maxImages = {
    3: 5,
    4: 6,
    5: 5,
    6: 4,
    7: 7,
    8: 7,
    9: 5,
    10: 7,
    11: 8,
    12: 8,
  };
  
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const images = [];
  const count = maxImages[villaNumber] || 8;
  
  // Add villa-specific images
  for (let i = 0; i < count; i++) {
    images.push(folder + `${villaNumber}${letters[i]}.jpg`);
  }
  
  // Add the 4 general images at the end
  images.push(
    "/villas/general/charger.jpg",
    "/villas/general/junglepool.jpg",
    "/villas/general/map.jpg",
    "/villas/general/pool.jpg"
  );
  
  return images;
};

const villas = [
  {
    id: 3,
    name: "Villa #3 Baula Turtle",
    description: "This is the perfect villa for your family. Crafted with local style and spacious for up to 10 people, it includes private parking, two bathrooms, and a fully equipped kitchen. Enjoy access to the shared pool, immersed in our lush tropical gardens near the best beaches of the Southern Caribbean.",
    informativeFact: "The Baula (Leatherback Sea Turtle) is the largest sea turtle on Earth. They are known to nest on Caribbean beaches, especially near Cahuita National Park, primarily between March and July each year.",
    bedrooms: 2,
    bathrooms: 4,
    maxPeople: 10,
    amenities: ["Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/3/3a.jpg",
    galleryImages: getGalleryImages(3),
  },
  {
    id: 4,
    name: "Villa #4 Colibrí",
    description: "Located just 5 minutes from Puerto Viejo, this space is designed for couples who want a beautiful, private, and quiet stay, or a small family of three. Enjoy amazing views of the treetops and the coast, with access to the shared pool and BBQ area.",
    informativeFact: "Costa Rica is home to over 50 species of Colibrí (Hummingbirds). They must feed on nectar every 10–15 minutes, and their wings beat so fast they can hover perfectly to sip nectar.",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/4/4a.jpg",
    galleryImages: getGalleryImages(4),
  },
  {
    id: 5,
    name: "Villa #5 Jaguar",
    description: "Come forget about reality and relax with your family and friends in this charming villa. Enjoy the spacious outdoor areas, beautifully maintained gardens, pool, and Wi-Fi. We are located just 3 mins away from Playa Negra and 5 mins away from Puerto Viejo.",
    informativeFact: "The Jaguar is the largest cat in the Americas. In Costa Rica, their populations are often tracked in protected coastal areas where they use their powerful swimming skills to hunt.",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["AC", "Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/5/5c.jpg",
    galleryImages: getGalleryImages(5),
  },
  {
    id: 6,
    name: "Villa #6 Rana Roja",
    description: "This cozy villa is ideal for a small family retreat, offering easy access to the central pool area and dedicated parking. It perfectly captures the spirit of the jungle and the coast in a comfortable setting.",
    informativeFact: "The Rana Roja (Strawberry Poison Dart Frog) is often seen foraging in the low-lying leaf litter of humid lowland forests, making them a common sight in the Southern Caribbean ecosystem.",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 2,
    amenities: ["Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/6/6f.jpg",
    galleryImages: getGalleryImages(6),
  },
  {
    id: 7,
    name: "Villa #7 Rana Verde",
    description: "A tranquil space designed for couples seeking genuine relaxation. This locally-inspired villa features a comfortable seating area and convenient access to the garden paths and shared amenities.",
    informativeFact: "The Rana Verde (Red-Eyed Tree Frog) is nocturnal and spends its days perfectly camouflaged on the underside of green leaves, which helps it avoid detection from predators.",
    bedrooms: 3,
    bathrooms: 2,
    maxPeople: 6,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/7/7d.jpg",
    galleryImages: getGalleryImages(7),
  },
  {
    id: 8,
    name: "Villa #8 Oso peresozo",
    description: "Embrace the Pura Vida lifestyle in this generously sized, beautifully crafted villa. It offers direct, peaceful access to the gardens for spotting local wildlife.",
    informativeFact: "The Oso Perezoso (Sloth) primarily eats leaves, a low-energy diet that causes its metabolism to be extremely slow, sometimes taking up to one month to digest one meal.",
    bedrooms: 2,
    bathrooms: 1,
    maxPeople: 6,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/8/8a.jpg",
    galleryImages: getGalleryImages(8),
  },
  {
    id: 9,
    name: "Villa #9 Mono Cariblanco",
    description: "A wonderful choice for families or groups, this villa offers ample space for socializing outdoors, with easy access to the shared outdoor kitchen for preparing meals.",
    informativeFact: "The Mono Cariblanco (White-Faced Capuchin Monkey) is considered one of the most intelligent New World monkeys and often uses rocks as tools to crack open hard-shelled food items.",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["Wifi", "Kitchen", "Parking", "Hot water"],
    image: "/villas/9/9a.jpg",
    galleryImages: getGalleryImages(9),
  },
  {
    id: 10,
    name: "Villa #10 Mono Ardilla",
    description: "This compact and highly efficient villa is set up perfectly for adventurers and couples, featuring reliable Wi-Fi and close proximity to the main pool deck and lounge area.",
    informativeFact: "The Mono Ardilla (Central American Squirrel Monkey) possesses the largest brain relative to its body size of any primate, making them quick thinkers in the canopy.",
    bedrooms: 1,
    bathrooms: 1,
    maxPeople: 4,
    amenities: ["Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/10/10d.jpg",
    galleryImages: getGalleryImages(10),
  },
  {
    id: 11,
    name: "Villa #11 Lapa Roja",
    description: "Enjoy beautiful views over the treetops from this lovely unit. This villa is well-equipped and has easy access to the central BBQ area for unforgettable evening meals.",
    informativeFact: "The Lapa Roja (Scarlet Macaw) mates for life, and their vibrant red, blue, and yellow plumage is an essential feature for communication within their large flocks.",
    bedrooms: 2,
    bathrooms: 2,
    maxPeople: 7,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/11/11g.jpg",
    galleryImages: getGalleryImages(11),
  },
  {
    id: 12,
    name: "Villa #12 Mariposa Morpho",
    description: "A serene and private space designed for ultimate rest and comfort. This locally-inspired villa is perfectly positioned for a quiet retreat after exploring the coast.",
    informativeFact: "The striking blue color of the Mariposa Morpho (Blue Morpho Butterfly) is not pigment; it's an optical illusion created by micro-structures on the scales that reflect light.",
    bedrooms: 3,
    bathrooms: 3,
    maxPeople: 8,
    amenities: ["AC", "Wifi", "BBQ Area", "Kitchen", "Parking", "Hot water"],
    image: "/villas/12/12i.jpg",
    galleryImages: getGalleryImages(12),
  },
];

export default function VillasPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleItems, setVisibleItems] = useState(new Set());
  const villasRef = useRef(null);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "2", label: "2 People" },
    { value: "4", label: "4 People" },
    { value: "6+", label: "6+ People" },
  ];

  const getFilterValue = (maxPeople) => {
    if (maxPeople <= 2) return "2";
    if (maxPeople <= 4) return "4";
    return "6+";
  };

  const filteredVillas =
    selectedFilter === "all"
      ? villas
      : villas.filter((villa) => {
          const filterValue = getFilterValue(villa.maxPeople);
          if (selectedFilter === "6+") {
            return filterValue === "6+";
          }
          return filterValue === selectedFilter;
        });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          } else {
            // Remove from visibleItems when it leaves viewport to allow re-animation
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.delete(entry.target.dataset.id);
              return next;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const items = villasRef.current?.querySelectorAll("[data-villa-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, [filteredVillas]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Our Villas</h1>
        <p>Choose from our collection of Caribbean style accommodations in Puerto Viejo</p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterBtn} ${
                selectedFilter === option.value ? styles.active : ""
              }`}
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid} ref={villasRef}>
        {filteredVillas.map((villa, index) => (
          <div
            key={villa.id}
            data-villa-item
            data-id={villa.id}
            className={`${styles.villaWrapper} ${
              visibleItems.has(String(villa.id)) ? styles.visible : ""
            }`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <VillaCard villa={villa} />
          </div>
        ))}
      </div>
    </div>
  );
}


