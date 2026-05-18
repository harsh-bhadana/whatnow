const fs = require('fs');
let code = fs.readFileSync('src/lib/api/tmdb.ts', 'utf8');

const replacement = `    let rawResults: any[] = [];
    const allPromises: Promise<any[]>[] = [];
    
    // LIKED MEDIA FETCHES
    if (likedMediaIds.length > 0) {
      const fetchPromises = likedMediaIds.map(async (media) => {
        const res = await fetch(\`\${BASE_URL}/\${media.type}/\${media.id}/recommendations?api_key=\${TMDB_API_KEY}&language=en-US&page=1\`);
        const data = await res.json();
        if (data.success === false) {
           console.error(\`TMDB API Error (Liked Media \${media.id}):\`, data.status_message);
           return MOCK_DATA
             .filter(item => !watchedHistoryIds.includes(item.id))
             .map(item => ({ ...item, media_type: item.type, isBasedOnLikes: true }));
        }
        return (data.results || []).map((item: any) => ({ ...item, media_type: media.type, isBasedOnLikes: true }));
      });
      allPromises.push(...fetchPromises);
    }
    
    // DISCOVER FETCHES (if moods selected OR if nothing selected for wildcard)
    if (moods.length > 0 || likedMediaIds.length === 0) {
      const genreIds = new Set<number>();
      moods.forEach(mood => {
        if (MOOD_TO_TMDB_GENRE[mood]) MOOD_TO_TMDB_GENRE[mood].forEach(id => genreIds.add(id));
      });
      
      const genreParam = Array.from(genreIds).join('|');
      // Advanced Filters applied to Discover queries
      const commonParams = \`&api_key=\${TMDB_API_KEY}&include_adult=false&vote_average.gte=6.5&vote_count.gte=100\${genreParam ? \`&with_genres=\${genreParam}\` : ''}&sort_by=popularity.desc\`;

      const handleFetch = async (url: string, type: string) => {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.success === false) {
            console.error(\`TMDB API Error (\${type}):\`, data.status_message);
            // Fallback to mock data if API key is invalid or request fails
            return MOCK_DATA
              .filter(item => item.type === type || type === "all")
              .filter(item => !watchedHistoryIds.includes(item.id))
              .map(item => ({ ...item, media_type: item.type }));
          }
          return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
        } catch (e) {
          console.error(\`TMDB Fetch Error (\${type}):\`, e);
          return [];
        }
      };
      
      if (mediaType === "movie" || mediaType === "all") {
        allPromises.push(handleFetch(\`\${BASE_URL}/discover/movie?with_runtime.lte=\${timeLimit}\${commonParams}\`, "movie"));
      }
      if (mediaType === "tv" || mediaType === "all") {
        allPromises.push(handleFetch(\`\${BASE_URL}/discover/tv?with_runtime.lte=\${timeLimit}\${commonParams}\`, "tv"));
      }
      if (mediaType === "anime") {
        allPromises.push(handleFetch(\`\${BASE_URL}/discover/tv?with_runtime.lte=\${timeLimit}&api_key=\${TMDB_API_KEY}&include_adult=false&vote_average.gte=6.5&vote_count.gte=50&with_genres=16&with_original_language=ja&sort_by=popularity.desc\`, "tv"));
      }
    }

    const nestedResults = await Promise.all(allPromises);
    rawResults = nestedResults.flat();`;

const startStr = '    let rawResults: any[] = [];';
const endStr = '    // Deduplicate by ID';
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacement + '\n\n' + code.substring(endIdx);
  fs.writeFileSync('src/lib/api/tmdb.ts', code);
  console.log('Successfully updated tmdb.ts');
} else {
  console.log('Could not find markers');
}
