import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  assessmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'assessment_id',
    references: {
      model: 'assessments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionA: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_a'
  },
  optionB: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_b'
  },
  optionC: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_c'
  },
  optionD: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_d'
  },
  answer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false
  }
}, {
  tableName: 'questions'
});

export default Question;
