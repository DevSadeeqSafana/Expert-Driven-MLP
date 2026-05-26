import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Certificate = sequelize.define('Certificate', {
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
  certificateUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'certificate_url'
  }
}, {
  tableName: 'certificates'
});

export default Certificate;
