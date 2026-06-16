import { Enrollment, Course, Expert, User, Lesson } from '../models/index.js';

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Learner)
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Please provide a courseId' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({ userId: req.user.id, courseId, progress: 0, completed: false });

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in "${course.title}"!`,
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Server error during enrollment', error: error.message });
  }
};

// @desc    Get current user's enrollments
// @route   GET /api/enrollments/my
// @access  Private
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            { model: Lesson, as: 'lessons', attributes: ['id', 'title', 'duration'] },
            {
              model: Expert, as: 'expert',
              include: [{ model: User, as: 'user', attributes: ['fullname', 'avatar'] }]
            }
          ]
        }
      ]
    });

    res.status(200).json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching enrollments', error: error.message });
  }
};

// @desc    Check if current user is enrolled in a specific course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
    res.status(200).json({ success: true, enrolled: !!enrollment, enrollment: enrollment || null });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ success: false, message: 'Server error checking enrollment', error: error.message });
  }
};
