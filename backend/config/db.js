import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path to sqlite database file inside the backend directory
const dbPath = path.resolve(__dirname, '../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to console.log if you want to see SQL queries during debugging
  define: {
    timestamps: true,
    underscored: true
  }
});

export default sequelize;
