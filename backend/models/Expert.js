import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Expert = sequelize.define('Expert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  expertise: {
    type: DataTypes.STRING,
    allowNull: false
  },
  years_experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
    field: 'verification_status'
  },
  certificates: {
    type: DataTypes.TEXT, // Store JSON string of certificate array/file urls
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  }
}, {
  tableName: 'experts'
});

export default Expert;
