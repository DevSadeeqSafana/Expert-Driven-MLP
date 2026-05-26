import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  expertId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'expert_id',
    references: {
      model: 'experts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
    allowNull: false
  }
}, {
  tableName: 'courses'
});

export default Course;
