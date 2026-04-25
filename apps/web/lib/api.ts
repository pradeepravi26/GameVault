import type {
  GameListResponse,
  Genre,
  Platform,
} from "@gamevault/contracts";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function fetchJson<T>(path: string) {
  const response = await fetch(`${apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getGames(params?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  const path = query ? `/games?${query}` : "/games";

  return fetchJson<GameListResponse>(path);
}

export function getGenres() {
  return fetchJson<Genre[]>("/genres");
}

export function getPlatforms() {
  return fetchJson<Platform[]>("/platforms");
}
