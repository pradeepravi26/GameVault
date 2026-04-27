import type {
  AddGameToCollectionRequest,
  AuthResponse,
  CollectionDetail,
  CollectionListResponse,
  CreateCollectionRequest,
  GameReviewsResponse,
  GameDetail,
  MyGameReviewResponse,
  GameListResponse,
  LoginRequest,
  Genre,
  Platform,
  RegisterRequest,
  UpdateCollectionRequest,
  UserProfile,
  UserReviewsResponse,
  UpsertGameReviewRequest,
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

async function fetchJsonWithInit<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, init);

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const errorBody = (await response.json()) as {
        error?: string;
        details?: { field?: string; message?: string }[];
      };

      if (errorBody.error) {
        message = errorBody.error;
      }

      if (errorBody.details && errorBody.details.length > 0) {
        const detailMessage = errorBody.details
          .map((detail) => {
            if (!detail.message) {
              return null;
            }

            return detail.field
              ? `${detail.field}: ${detail.message}`
              : detail.message;
          })
          .filter((detail): detail is string => detail !== null)
          .join("\n");

        if (detailMessage) {
          message = errorBody.error
            ? `${errorBody.error}\n${detailMessage}`
            : detailMessage;
        }
      }
    } catch {}

    throw new Error(message);
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

export function getGameById(gameId: number) {
  return fetchJson<GameDetail>(`/games/${gameId}`);
}

export function getReviewsForGame(gameId: number) {
  return fetchJson<GameReviewsResponse>(`/games/${gameId}/reviews`);
}

export function getMyReviewForGame(gameId: number) {
  return fetchJsonWithInit<MyGameReviewResponse>(`/games/${gameId}/my-review`, {
    credentials: "include",
  });
}

export function upsertReviewForGame(
  gameId: number,
  input: UpsertGameReviewRequest,
) {
  return fetchJsonWithInit<MyGameReviewResponse>(`/games/${gameId}/reviews`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function deleteReview(ratingId: number) {
  return fetchJsonWithInit<{ ok: true }>(`/reviews/${ratingId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export function getGenres() {
  return fetchJson<Genre[]>("/genres");
}

export function getPlatforms() {
  return fetchJson<Platform[]>("/platforms");
}

export function register(input: RegisterRequest) {
  return fetchJsonWithInit<AuthResponse>("/auth/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function login(input: LoginRequest) {
  return fetchJsonWithInit<AuthResponse>("/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function logout() {
  return fetchJsonWithInit<{ ok: true }>("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function getCurrentUser() {
  return fetchJsonWithInit<AuthResponse>("/auth/me", {
    credentials: "include",
  });
}

export function getUserProfile(userId: number) {
  return fetchJson<UserProfile>(`/users/${userId}`);
}

export function getReviewsByUser(userId: number) {
  return fetchJson<UserReviewsResponse>(`/users/${userId}/reviews`);
}

export function getCollections() {
  return fetchJsonWithInit<CollectionListResponse>("/collections", {
    credentials: "include",
  });
}

export function getCollectionsForUser(userId: number) {
  return fetchJsonWithInit<CollectionListResponse>(`/users/${userId}/collections`, {
    credentials: "include",
  });
}

export function getCollectionById(collectionId: number) {
  return fetchJsonWithInit<CollectionDetail>(`/collections/${collectionId}`, {
    credentials: "include",
  });
}

export function createCollection(input: CreateCollectionRequest) {
  return fetchJsonWithInit<CollectionDetail>("/collections", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function renameCollection(
  collectionId: number,
  input: UpdateCollectionRequest,
) {
  return fetchJsonWithInit<CollectionDetail>(`/collections/${collectionId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function deleteCollectionById(collectionId: number) {
  return fetchJsonWithInit<{ ok: true }>(`/collections/${collectionId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export function addGameToCollection(
  collectionId: number,
  input: AddGameToCollectionRequest,
) {
  return fetchJsonWithInit<CollectionDetail>(`/collections/${collectionId}/games`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function removeGameFromCollection(collectionId: number, gameId: number) {
  return fetchJsonWithInit<{ ok: true }>(
    `/collections/${collectionId}/games/${gameId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
}

export function likeCollectionById(collectionId: number) {
  return fetchJsonWithInit<CollectionDetail>(`/collections/${collectionId}/like`, {
    method: "POST",
    credentials: "include",
  });
}
