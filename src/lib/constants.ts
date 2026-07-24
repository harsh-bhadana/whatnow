export const MOOD_TO_TMDB_GENRE: Record<string, number[]> = {
  "Cozy": [10751, 35, 10749, 16],          // Family, Comedy, Romance, Animation
  "Adrenaline": [28, 53, 12, 10752],       // Action, Thriller, Adventure, War
  "Laughs": [35, 10751],                    // Comedy, Family
  "Tears": [18, 10749, 10752],             // Drama, Romance, War
  "Thought-provoking": [878, 9648, 99, 18], // Sci-Fi, Mystery, Documentary, Drama
  "Spooky": [27, 53, 9648],               // Horror, Thriller, Mystery
  "Heartwarming": [10751, 18, 10749],      // Family, Drama, Romance
  "Epic": [12, 14, 36, 10752, 878],        // Adventure, Fantasy, History, War, Sci-Fi
  "Mind-bending": [878, 9648, 53],         // Sci-Fi, Mystery, Thriller
  "Nostalgic": [10751, 35, 18, 36, 16]     // Family, Comedy, Drama, History, Animation
};

export const MOOD_PRIMARY_GENRES: Record<string, number[]> = {
  "Cozy": [10751, 35],
  "Adrenaline": [28, 53],
  "Laughs": [35],
  "Tears": [18],
  "Thought-provoking": [878, 9648],
  "Spooky": [27],
  "Heartwarming": [10751, 18],
  "Epic": [12, 14],
  "Mind-bending": [878, 9648],
  "Nostalgic": [10751, 35]
};

export const MOOD_TO_TMDB_KEYWORDS: Record<string, number[]> = {
  "Thought-provoking": [6054, 14909, 156306, 9672],
    // philosophical, existential, cerebral, social-commentary
  "Mind-bending": [9882, 6149, 310, 9951],
    // time-travel, twist-ending, plot-twist, surrealism
  "Nostalgic": [3133, 4344, 207928],
    // 80s, coming-of-age, nostalgia
  "Epic": [12988, 2467, 818],
    // epic, based-on-novel, historical-fiction
  "Cozy": [3073, 9799, 3799],
    // feel-good, comfort, heartwarming
  "Spooky": [10349, 12339, 162846],
    // supernatural, haunted-house, psychological-horror
  "Heartwarming": [3073, 9799, 11800],
    // feel-good, heartwarming, redemption
  "Adrenaline": [779, 10617, 186747],
    // car-chase, heist, one-man-army
  "Laughs": [3149, 8201, 10340],
    // dark-humor, satire, slapstick
  "Tears": [2533, 10683, 3513],
    // tragic, loss, grief
};

export const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

