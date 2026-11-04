const STORAGE_KEY = "mathAdventureResults";

export function getResults() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const results = data ? JSON.parse(data) : [];

    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Cannot read results:", error);
    return [];
  }
}

/* результат */
export function saveResult(level, score, total) {
  const results = getResults();

  const newResult = {
    id: Date.now(),
    level: level,
    score: score,
    total: total,
    date: new Date().toLocaleString("uk-UA"),
  };
  results.push(newResult);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error("Cannot save result:", error);
  }
  return newResult;
}

/* best result */

export function getBestResult(level) {
  const results = getResults().filter((result) => result.level === level);

  if (results.length === 0) {
    return null;
  }

  return results.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}
/* get results */

export function getTopResults(level, limit = 3) {
  return getResults()
    .filter((result) => result.level === level)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.id - a.id;
    })
    .slice(0, limit);
}
