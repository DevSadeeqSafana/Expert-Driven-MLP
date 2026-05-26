import User from './User.js';
import Expert from './Expert.js';
import Course from './Course.js';
import Lesson from './Lesson.js';
import Enrollment from './Enrollment.js';
import Assessment from './Assessment.js';
import Question from './Question.js';
import Certificate from './Certificate.js';
import sequelize from '../config/db.js';

// User & Expert
User.hasOne(Expert, { foreignKey: 'userId', as: 'expertProfile' });
Expert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Expert & Course
Expert.hasMany(Course, { foreignKey: 'expertId', as: 'courses' });
Course.belongsTo(Expert, { foreignKey: 'expertId', as: 'expert' });

// Course & Lesson
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User & Enrollment
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course & Enrollment
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course & Assessment
Course.hasOne(Assessment, { foreignKey: 'courseId', as: 'assessment' });
Assessment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Assessment & Question
Assessment.hasMany(Question, { foreignKey: 'assessmentId', as: 'questions' });
Question.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });

// User & Certificate
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course & Certificate
Course.hasMany(Certificate, { foreignKey: 'courseId', as: 'certificates' });
Certificate.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export {
  sequelize,
  User,
  Expert,
  Course,
  Lesson,
  Enrollment,
  Assessment,
  Question,
  Certificate
};
