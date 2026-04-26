export { dbPool } from "./client/pool";
export {
  getGameById,
  getGames,
  getGenres,
  getPlatforms,
} from "./queries/catalog";
export { createUser, findUserById, findUserByUsername } from "./queries/users";
export {
  addOrUpdateReview,
  deleteReviewById,
  getReviewsForGame,
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
} from "./queries/collections";
