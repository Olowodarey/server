import { DataSource } from "typeorm";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../../../.env") });

/**
 * Strip query params that node-postgres does not support (e.g. channel_binding,
 * sslmode) so the driver does not hang waiting for features it cannot negotiate.
 * SSL is handled via the TypeORM `ssl` option instead.
 */
function sanitizeDbUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return raw;
  }
}

const dbUrl = sanitizeDbUrl(process.env.DATABASE_URL);

export default new DataSource({
  type: "postgres",
  url: dbUrl,
  host: dbUrl ? undefined : process.env.DB_HOST,
  port: dbUrl ? undefined : parseInt(process.env.DB_PORT, 10) || 5432,
  username: dbUrl ? undefined : process.env.DB_USERNAME,
  password: dbUrl ? undefined : process.env.DB_PASSWORD,
  database: dbUrl ? undefined : process.env.DB_NAME,
  ssl: dbUrl ? { rejectUnauthorized: false } : process.env.DB_SSL === "true",
  connectTimeoutMS: 10_000,
  entities: [
    join(__dirname, "../../../libs/database/src/entities/**/*.entity.{ts,js}"),
  ],
  migrations: [
    join(__dirname, "../../../libs/database/src/migrations/**/*.{ts,js}"),
  ],
});
