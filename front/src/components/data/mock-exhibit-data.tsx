export const mockExhibitData: Record<number, any> = {
  1: {
    title: "Urban Dreamscape",
    category: "Urban",
    artworkStyle: "Abstract",
    exhibitType: "collab",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    description: "A collaborative exploration of urban environments through an abstract lens.",
    selectedEnvironment: 2,
    bannerImage:
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 201,
        name: "Jane Artist",
        avatar:
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 202,
        name: "Sam Creator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 100, // Owner slots
      3: 201,
      4: 201, // First collaborator slots
      5: 202,
      6: 202, // Second collaborator slots
    },
    slotArtworkMap: {
      1: 1,
      2: 2, // Owner already placed artwork

      3: 3, // First collaborator placed one artwork
      // Second collaborator has not placed any artwork yet
    },
    status: "monitoring", // Can be "monitoring", "review", or "preview"
  },
  2: {
    title: "Nature's Symphony",
    category: "Nature",
    artworkStyle: "Impressionistic",
    exhibitType: "collab",
    startDate: "2025-07-15",
    endDate: "2025-08-01",
    description: "A celebration of natural beauty through impressionistic artworks.",
    selectedEnvironment: 1,
    bannerImage:
      "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 201,
        name: "Jane Artist",
        avatar:
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 203,
        name: "Alex Painter",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 201,
      3: 201,
      4: 203,
    },
    slotArtworkMap: {
      1: 5,
      2: 6,
      3: 7,
    },
    status: "pending",
  },
  3: {
    title: "Abstract Visions",
    category: "Abstract",
    artworkStyle: "Modern",
    exhibitType: "collab",
    startDate: "2025-08-10",
    endDate: "2025-08-25",
    description: "Exploring modern abstract art through collaborative vision.",
    selectedEnvironment: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 202,
        name: "Sam Creator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 203,
        name: "Alex Painter",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 100,
      3: 100,
      4: 202,
      5: 202,
      6: 202,
      7: 203,
      8: 203,
      9: 203,
    },
    slotArtworkMap: {
      1: 8,
      2: 9,
      3: 10,
      4: 11,
      5: 12,
      6: 13,
      7: 14,
      8: 15,
      9: 16,
    },
    status: "ready",
  },
  4: {
    title: "Digital Renaissance",
    category: "Digital Art",
    artworkStyle: "Contemporary",
    exhibitType: "collab",
    startDate: "2025-09-01",
    endDate: "2025-09-15",
    description: "Rediscovering classical themes through digital mediums.",
    selectedEnvironment: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

    collaborators: [
      {
        id: 201,
        name: "Jane Artist",
        avatar:
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 202,
        name: "Sam Creator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
      {
        id: 203,
        name: "Alex Painter",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      },
    ],
    slotOwnerMap: {
      1: 100,
      2: 100,
      3: 100,
      4: 201,
      5: 201,
      6: 202,
      7: 202,
      8: 203,
      9: 203,
    },
    slotArtworkMap: {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    },
    status: "monitoring",
  },
}
