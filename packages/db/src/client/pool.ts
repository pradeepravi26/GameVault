import { createPool, type PoolOptions } from "mysql2/promise";

type DbEnvironment = "local" | "cloudsql";

function getDbEnvironment(): DbEnvironment {
  return process.env.DB_ENV === "cloudsql" ? "cloudsql" : "local";
}

function getBaseConfig(): PoolOptions {
  return {
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "root",
    database: process.env.DB_NAME ?? "game_vault",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  };
}

function getLocalConfig(): PoolOptions {
  return {
    ...getBaseConfig(),
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
  };
}

function getCloudSqlConfig(): PoolOptions {
  const instanceConnectionName = process.env.CLOUD_SQL_CONNECTION_NAME;

  if (!instanceConnectionName) {
    throw new Error(
      "CLOUD_SQL_CONNECTION_NAME must be set when DB_ENV=cloudsql.",
    );
  }

  return {
    ...getBaseConfig(),
    socketPath: process.env.DB_SOCKET_PATH ?? `/cloudsql/${instanceConnectionName}`,
  };
}

function getPoolConfig(): PoolOptions {
  return getDbEnvironment() === "cloudsql"
    ? getCloudSqlConfig()
    : getLocalConfig();
}

export const dbPool = createPool(getPoolConfig());
