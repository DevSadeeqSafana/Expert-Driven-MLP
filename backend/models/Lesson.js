import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'video_url'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    defaultValue: 0
  },
  orderNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'order_number'
  }
}, {
  tableName: 'lessons'
});

export default Lesson;
