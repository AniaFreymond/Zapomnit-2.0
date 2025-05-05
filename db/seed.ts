import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    // Check if we already have tags
    const existingTags = await db.query.tags.findMany();
    
    if (existingTags.length === 0) {
      console.log("Seeding tags...");
      // Seed tags
      const tagsData = [
        { name: "Math", color: "#3b82f6" },
        { name: "Physics", color: "#8b5cf6" },
        { name: "Chemistry", color: "#10b981" },
        { name: "Biology", color: "#f59e0b" },
        { name: "Computer Science", color: "#ef4444" }
      ];
      
      await db.insert(schema.tags).values(tagsData);
      console.log("Tags seeded successfully!");
    } else {
      console.log("Tags already exist, skipping tag seeding.");
    }

    // Check if we already have flashcards
    const existingCards = await db.query.flashcards.findMany();
    
    if (existingCards.length === 0) {
      console.log("Seeding flashcards...");
      
      // Get the tags we just created
      const tags = await db.query.tags.findMany();
      const tagMap = tags.reduce((acc, tag) => {
        acc[tag.name] = tag.id;
        return acc;
      }, {} as Record<string, number>);
      
      // Seed flashcards
      const cardsData = [
        {
          front: "What is the Pythagorean theorem?",
          back: "In a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the lengths of the other two sides. Expressed as: $a^2 + b^2 = c^2$"
        },
        {
          front: "Define vector in mathematics",
          back: "A vector is a quantity that has both magnitude and direction. It can be represented as $\\vec{v} = (x, y, z)$ in 3D space."
        },
        {
          front: "What is Newton's Second Law of Motion?",
          back: "The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. Expressed as: $F = ma$"
        },
        {
          front: "What is the periodic table?",
          back: "The periodic table is a tabular arrangement of chemical elements, organized by atomic number, electron configuration, and recurring chemical properties."
        },
        {
          front: "Explain the concept of Big O notation",
          back: "Big O notation is used to describe the performance or complexity of an algorithm. It describes the worst-case scenario and can be used to describe execution time or space used. Example: $O(n)$ is linear time complexity."
        }
      ];
      
      // Insert flashcards and assign tags
      for (const card of cardsData) {
        const [newCard] = await db.insert(schema.flashcards).values(card).returning();
        
        // Assign tags based on content
        const cardTags = [];
        if (card.front.toLowerCase().includes("theorem") || card.front.toLowerCase().includes("vector")) {
          cardTags.push(tagMap["Math"]);
        }
        if (card.front.toLowerCase().includes("newton") || card.front.toLowerCase().includes("motion")) {
          cardTags.push(tagMap["Physics"]);
        }
        if (card.front.toLowerCase().includes("periodic") || card.front.toLowerCase().includes("chemical")) {
          cardTags.push(tagMap["Chemistry"]);
        }
        if (card.front.toLowerCase().includes("big o") || card.front.toLowerCase().includes("algorithm")) {
          cardTags.push(tagMap["Computer Science"]);
        }
        
        // If no tags were assigned, add a default tag
        if (cardTags.length === 0) {
          cardTags.push(tagMap["Math"]);
        }
        
        // Insert the card-tag relationships
        for (const tagId of cardTags) {
          await db.insert(schema.flashcardTags).values({
            flashcard_id: newCard.id,
            tag_id: tagId
          });
        }
      }
      
      console.log("Flashcards seeded successfully!");
    } else {
      console.log("Flashcards already exist, skipping flashcard seeding.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
