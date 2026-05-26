import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Assessment = sequelize.define('Assessment', {
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
  passingScore: {
    type: DataTypes.INTEGER, // e.g. 70
    defaultValue: 70,
    field: 'passing_score'
  }
}, {
  tableName: 'assessments'
});

export default Assessment;
