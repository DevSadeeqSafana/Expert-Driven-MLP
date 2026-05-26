import { User, Expert } from '../models/index.js';

// @desc    Apply/Update expert certificate details
// @route   POST /api/experts/apply
// @access  Private
export const applyAsExpert = async (req, res) => {
  try {
    const { expertise, yearsExperience, certificates } = req.body;

    // Find if user already has an expert profile
    let expert = await Expert.findOne({ where: { userId: req.user.id } });

    if (expert) {
      // Update existing application
      expert.expertise = expertise || expert.expertise;
      expert.years_experience = yearsExperience !== undefined ? yearsExperience : expert.years_experience;
      expert.certificates = certificates ? JSON.stringify(certificates) : expert.certificates;
      expert.verification_status = 'pending'; // Reset status to pending for re-review
      await expert.save();
    } else {
      // Create new application
      expert = await Expert.create({
        userId: req.user.id,
        expertise: expertise || 'General expertise',
        years_experience: yearsExperience || 0,
        certificates: certificates ? JSON.stringify(certificates) : null,
        verification_status: 'pending'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expert application submitted successfully. Pending Admin review.',
      expert
    });
  } catch (error) {
    console.error('Expert application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting expert application',
      error: error.message
    });
  }
};

// @desc    Verify expert application (Approve or Reject) - ADMIN ONLY
// @route   PUT /api/experts/verify/:id
// @access  Private/Admin
export const verifyExpert = async (req, res) => {
  try {
    const { id } = req.params; // Expert Profile ID
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be approved or rejected'
      });
    }

    const expert = await Expert.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert application not found'
      });
    }

    expert.verification_status = status;
    await expert.save();

    // If approved, verify the associated User is set to 'expert' role
    if (status === 'approved') {
      const user = await User.findByPk(expert.userId);
      if (user) {
        user.role = 'expert';
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Expert application has been ${status}!`,
      expert
    });
  } catch (error) {
    console.error('Verify expert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during expert verification',
      error: error.message
    });
  }
};

// @desc    Get all verified experts
// @route   GET /api/experts
// @access  Public
export const getExperts = async (req, res) => {
  try {
    const experts = await Expert.findAll({
      where: { verification_status: 'approved' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'avatar', 'bio']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: experts.length,
      experts
    });
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching experts',
      error: error.message
    });
  }
};

// @desc    Get pending applications - ADMIN ONLY
// @route   GET /api/experts/pending
// @access  Private/Admin
export const getPendingApplications = async (req, res) => {
  try {
    const applications = await Expert.findAll({
      where: { verification_status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'phone', 'avatar']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending applications',
      error: error.message
    });
  }
};
