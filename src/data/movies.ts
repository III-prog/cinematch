export type Movie = {
  id: number;
  title: string;
  overview: string;
};

export const popularMovies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    overview:
      "A skilled thief who steals corporate secrets through dream-sharing technology is given a chance at redemption.",
  },
  {
    id: 2,
    title: "The Dark Knight",
    overview:
      "Batman faces the Joker, a criminal mastermind who plunges Gotham City into chaos.",
  },
  {
    id: 3,
    title: "Interstellar",
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to save humanity.",
  },
  {
    id: 4,
    title: "The Matrix",
    overview:
      "A hacker discovers the true nature of his reality and his role in the war against its controllers.",
  },
  {
    id: 5,
    title: "Parasite",
    overview:
      "A poor family schemes to become employed by a wealthy household by infiltrating their lives.",
  },
];

export const recommendedMovies: Movie[] = [
  {
    id: 101,
    title: "Arrival",
    overview:
      "A linguist works with the military to communicate with alien lifeforms that have arrived on Earth.",
  },
  {
    id: 102,
    title: "Blade Runner 2049",
    overview:
      "A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.",
  },
  {
    id: 103,
    title: "Whiplash",
    overview:
      "A young drummer enrolls in a cut-throat music conservatory where his dreams are mentored by an abusive instructor.",
  },
  {
    id: 104,
    title: "Spider-Man: Into the Spider-Verse",
    overview:
      "Teen Miles Morales becomes Spider-Man and joins other Spider-People from different dimensions to save the multiverse.",
  },
  {
    id: 105,
    title: "The Social Network",
    overview:
      "The story of the founding of Facebook and the lawsuits that followed its meteoric rise.",
  },
];


