export { dbPool } from "./client/pool";
export {
  getGameById,
  getGames,
  getGenres,
  getPlatforms,
} from "./queries/catalog";
export {
  createUser,
  findUserById,
  findUserByUsername,
  getUserProfileById,
} from "./queries/users";
export {
  createSessionRecord,
  deleteExpiredSessions,
  deleteSessionRecord,
  findSessionById,
} from "./queries/sessions";
export {
  addOrUpdateReview,
  deleteReviewById,
  getReviewsForGame,
  getReviewsByUser,
  getUserReviewForGame,
} from "./queries/reviews";
export {
  addGameToCollection,
  createCollection,
  deleteCollection,
  getAllCollections,
  getCollectionById,
  getCollectionDetail,
  getCollectionsForUser,
  getGamesForCollection,
  hasUserLikedCollection,
  likeCollection,
  removeGameFromCollection,
  renameCollection,
  unlikeCollection,
} from "./queries/collections";
