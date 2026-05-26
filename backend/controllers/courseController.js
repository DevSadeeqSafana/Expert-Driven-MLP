import { Course, Lesson, Expert, User } from '../models/index.js';

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { category, level } = req.query;
    const filter = { status: 'published' };

    if (category) {
      filter.category = category;
    }
    if (level) {
      filter.level = level;
    }

    const courses = await Course.findAll({
      where: filter,
      include: [
        {
          model: Expert,
          as: 'expert',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['fullname', 'avatar']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: Lesson,
          as: 'lessons'
        },
        {
          model: Expert,
          as: 'expert',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['fullname', 'avatar', 'bio']
            }
          ]
        }
      ],
      order: [
        [{ model: Lesson, as: 'lessons' }, 'order_number', 'ASC']
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course details',
      error: error.message
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Experts only)
export const createCourse = async (req, res) => {
  try {
    // Find expert profile associated with this user
    const expert = await Expert.findOne({ where: { userId: req.user.id } });

    if (!expert || expert.verification_status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Only verified experts can create courses'
      });
    }

    const { title, description, thumbnail, category, level, price, duration, status } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a title and category'
      });
    }

    const course = await Course.create({
      expertId: expert.id,
      title,
      description,
      thumbnail,
      category,
      level: level || 'beginner',
      price: price || 0.0,
      duration: duration || 0,
      status: status || 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating course',
      error: error.message
    });
  }
};

// @desc    Add lesson to a course
// @route   POST /api/lessons
// @access  Private (Course Expert creator only)
export const createLesson = async (req, res) => {
  try {
    const { courseId, title, videoUrl, notes, duration, orderNumber } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId and title'
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if the current user is the owner of the course
    const expert = await Expert.findOne({ where: { userId: req.user.id } });
    if (!expert || course.expertId !== expert.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this course'
      });
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      videoUrl,
      notes,
      duration: duration || 0,
      orderNumber: orderNumber || 0
    });

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully!',
      lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding lesson',
      error: error.message
    });
  }
};
