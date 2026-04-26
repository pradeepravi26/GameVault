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
