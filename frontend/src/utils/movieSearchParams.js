/**
 * Serialize movie search query params for Spring MVC binding.
 * Arrays become repeated keys: genreIds=1&genreIds=2
 */
export function serializeMovieSearchParams(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, item);
        }
      });
      return;
    }
    searchParams.append(key, value);
  });

  return searchParams.toString();
}
