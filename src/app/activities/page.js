"use client";

import { useState, useEffect, useRef } from "react";
import ActivityDetail from "@/components/activity-detail";
import styles from "./activities.module.css";

const activities = [
  {
    id: 0,
    name: "Sample Activity",
    description: "This is a sample activity showcasing all available features",
    fullDescription:
      "This sample activity demonstrates all the features available in our activity cards. You can see how duration, group size, price, difficulty level, and highlights are displayed. This helps visitors understand what information is available for each activity.",
    duration: "3-4 hours",
    price: "$65 per person",
    difficulty: "Moderate",
    groupSize: "Up to 10 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: [
      "Professional Guide",
      "All Equipment Included",
      "Refreshments Provided",
      "Photo Opportunities",
      "Suitable for All Levels",
    ],
  },
  {
    id: 1,
    name: "Family Reunions",
    description: "Perfect setting for family gatherings",
    fullDescription:
      "Blessed House provides the perfect setting for family gatherings, accommodating groups of up to 45 people. Each family can enjoy their own private cabin, while coming together for shared meals and moments of relaxation around the pool. The onsite BBQ area and communal dining space foster a warm and welcoming atmosphere.",
    duration: "Full day",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "Up to 45 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: [
      "Private Cabins",
      "Communal Dining Space",
      "Onsite BBQ Area",
      "Pool Access",
      "Spacious Accommodations",
    ],
  },
  {
    id: 2,
    name: "Weddings",
    description: "Idyllic venue for your special celebration",
    fullDescription:
      "Blessed House also serves as an idyllic venue for weddings, with a maximum capacity of 50 guests. Couples have the flexibility to choose from catering services or prepare their own meals in the fully equipped kitchen. The private and family-oriented ambiance ensures a truly special celebration.",
    duration: "Full day",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "Up to 50 guests",
    image: "/luxury-beachfront-villa-tropical.jpg",
    highlights: [
      "Beautiful Venue",
      "Catering Services Available",
      "Fully Equipped Kitchen",
      "Private Ambiance",
      "Caribbean Setting",
    ],
  },
  {
    id: 3,
    name: "Aerobics",
    description: "Stay active during your stay",
    fullDescription:
      "Join our aerobics sessions to stay active and energized during your stay at Blessed House. Perfect for starting your day with energy or unwinding in the evening. All fitness levels welcome.",
    duration: "45 minutes - 1 hour",
    price: "Contact for pricing",
    difficulty: "Moderate",
    groupSize: "Up to 15 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: [
      "Daily Sessions",
      "All Fitness Levels",
      "Outdoor Sessions Available",
      "Energizing Workouts",
      "Fun Group Activity",
    ],
  },
  {
    id: 4,
    name: "Manzanillo",
    description: "Less than 30 minutes away from Blessed House",
    fullDescription:
      "Trip from Blessed House to Manzanillo, Limón, Costa Rica. A beautiful destination perfect for exploring the National Park and enjoying the pristine beaches.",
    duration: "Half day",
    price: "Contact for pricing",
    difficulty: "Challenging",
    groupSize: "Up to 8 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: ["National Park", "Pristine Beaches", "Wildlife Spotting", "Scenic Views"],
  },
  {
    id: 5,
    name: "El Mirador",
    description: "Enjoy the View!",
    fullDescription:
      "It's going to be an uphill trail to get up there but once you are there you are going to realize it was worth it with an awesome view to the property, flora, fauna and the beach. We recommend you to ask first before heading up there and just an FYI you should use shoes you shouldn't go up there on sandals or barefoot.",
    duration: "1-2 hours",
    price: "Free",
    difficulty: "Moderate",
    groupSize: "Up to 6 people",
    image: "/tropical-bungalow-sunset-view.jpg",
    highlights: ["Panoramic Views", "Property Views", "Flora & Fauna", "Beach Views"],
  },
  {
    id: 6,
    name: "Common Area",
    description: "Its located right next to the beach we have plenty of space, chairs and a TV.",
    fullDescription:
      "This is a common area so please keep it clean. Here are some of the rules of the 'Rancho': This space is perfect for gatherings, relaxing, and enjoying the Caribbean atmosphere.",
    duration: "All day",
    price: "Included",
    difficulty: "Easy",
    groupSize: "Up to 20 people",
    image: "/luxury-beachfront-villa-tropical.jpg",
    highlights: ["TV Available", "Comfortable Seating", "Beach Access", "Group Friendly"],
  },
  {
    id: 7,
    name: "Pool",
    description: "Come on down!",
    fullDescription:
      "This pool is available for all our guests. Please read the rules of usage and enjoy it. Perfect for cooling off after a day of exploring Puerto Viejo.",
    duration: "All day",
    price: "Included",
    difficulty: "Easy",
    groupSize: "Unlimited",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: ["Pool Access", "Refreshment", "Relaxation", "For All Guests"],
  },
  {
    id: 8,
    name: "Sauna",
    description: "Relax & Enjoy",
    fullDescription:
      "Treat yourself with warm and relaxing sauna. If you want to use it let us know first and we will help you out.",
    duration: "30-60 minutes",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "Up to 4 people",
    image: "/jungle-bungalow-surrounded-by-trees.jpg",
    highlights: ["Relaxation", "Wellness", "Warm Therapy", "Booking Required"],
  },
  {
    id: 9,
    name: "Surf Lessons",
    description: "Learn with one of the locals",
    fullDescription:
      "Learn with one of the locals at Cocles, Salsa Brava or any of the spots we have around. It will be either mornings or evenings.",
    duration: "2-3 hours",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "Up to 4 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: ["Local Instructors", "Multiple Locations", "Morning/Evening Sessions", "All Levels Welcome"],
  },
  {
    id: 10,
    name: "Bribri Cacao Tour",
    description: "Make your own chocolate with the locals",
    fullDescription:
      "Around Puerto Viejo you will find a lot of cacao trees and the locals know their ways with this plant and other plants. Get to know some of their recipes and techniques.",
    duration: "3-4 hours",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "Up to 12 people",
    image: "/jungle-bungalow-surrounded-by-trees.jpg",
    highlights: ["Chocolate Making", "Local Culture", "Traditional Recipes", "Interactive Experience"],
  },
  {
    id: 11,
    name: "Kayaking",
    description: "Another point of view",
    fullDescription:
      "You can either rent them at the beach or rent ours. You will be able to enjoy another point of view from the beaches around Blessed House. Kayaking is the use of a kayak for moving across water. It is distinguished from canoeing by the sitting position of the paddler and the number of blades on the paddle. Let us know if you are interested in renting one.",
    duration: "2-4 hours",
    price: "Contact for pricing",
    difficulty: "Moderate",
    groupSize: "Up to 6 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: ["Beach Views", "Water Activity", "Equipment Rental", "Scenic Experience"],
  },
  {
    id: 12,
    name: "Bri Bri Waterfalls",
    description: "Several waterfalls in one place",
    fullDescription:
      "It's a 10 minutes ride from Blessed House, you should really take the time to enjoy the rainforest and immerse yourself in these waterfalls.",
    duration: "Half day",
    price: "Contact for pricing",
    difficulty: "Moderate",
    groupSize: "Up to 8 people",
    image: "/jungle-bungalow-surrounded-by-trees.jpg",
    highlights: ["Multiple Waterfalls", "Rainforest Experience", "Close to Property", "Swimming Spots"],
  },
  {
    id: 13,
    name: "Punta Uva",
    description: "Explore Punta Uva",
    fullDescription:
      "Punta Uva's beach has a nice view to a reef peak, also there's a river right next to it and finally you can take one of the walking trails to explore even more the peak.",
    duration: "2-3 hours",
    price: "Free",
    difficulty: "Easy",
    groupSize: "Unlimited",
    image: "/tropical-bungalow-sunset-view.jpg",
    highlights: ["Reef Views", "River Access", "Walking Trails", "Beach Exploration"],
  },
  {
    id: 14,
    name: "Ketos",
    description: "A paddle game for couples, super fun at the beach",
    fullDescription:
      "Ketos is an exciting paddle game perfect for couples looking for fun at the beach. Enjoy this engaging activity while soaking up the Caribbean sun.",
    duration: "1-2 hours",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "2-4 people",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: ["Couples Activity", "Beach Game", "Fun & Active", "Social Activity"],
  },
  {
    id: 15,
    name: "E-Bike Rental",
    description: "Explore Puerto Viejo with ease",
    fullDescription:
      "Rent e-bikes from Puerto Viejo Bike Rentals for an eco-friendly way to explore the area. Perfect for discovering beaches, national parks, and local attractions at your own pace.",
    duration: "Half day - Full day",
    price: "Contact for pricing",
    difficulty: "Easy",
    groupSize: "Unlimited",
    externalLink: "https://puertoviejobikerentals.com/",
    image: "/tropical-beach-bungalow-resort.jpg",
    highlights: ["Eco-Friendly", "Easy Exploration", "Quality Bikes", "Local Rental Service"],
  },
];

export default function ActivitiesPage() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const activitiesRef = useRef(null);

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

    const items = activitiesRef.current?.querySelectorAll("[data-activity-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, [selectedDifficulty]);

  const filteredActivities = activities.filter((activity) => {
    if (selectedDifficulty === "All") return true;
    if (!activity.difficulty) return false;
    return activity.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
  });

  const difficultyOptions = ["All", "Easy", "Moderate", "Challenging"];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Activities at Blessed House</h1>
        <p>Explore our property and nearby attractions</p>
      </div>

      <div className={styles.filters}>
        {difficultyOptions.map((difficulty) => (
          <button
            key={difficulty}
            className={`${styles.filterBtn} ${
              selectedDifficulty === difficulty ? styles.active : ""
            }`}
            onClick={() => setSelectedDifficulty(difficulty)}
          >
            {difficulty}
          </button>
        ))}
      </div>

      <div className={styles.grid} ref={activitiesRef}>
        {filteredActivities.map((activity, index) => (
          <div
            key={activity.id}
            data-activity-item
            data-id={activity.id}
            className={`${styles.activityWrapper} ${
              visibleItems.has(String(activity.id)) ? styles.visible : ""
            }`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <ActivityDetail activity={activity} />
          </div>
        ))}
      </div>
    </div>
  );
}
