const Performance = require('../models/performance');

exports.createReview = async (req, res) => {
    try {
        req.body.reviewer = req.user.id;

        // Calculate overall rating
        if (req.body.ratings) {
            const ratings = Object.values(req.body.ratings);
            req.body.overallRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        }

        const performance = await Performance.create(req.body);

        res.status(201).json({
            success: true,
            data: performance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getReviews = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
            query = Performance.find();
        } else {
            query = Performance.find({ employee: req.user.id });
        }

        query = query
            .populate('employee', 'fullName email department')
            .populate('reviewer', 'fullName email');

        const reviews = await query;

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        let performance = await Performance.findById(req.params.id);

        if (!performance) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Recalculate overall rating if ratings are updated
        if (req.body.ratings) {
            const ratings = Object.values(req.body.ratings);
            req.body.overallRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        }

        performance = await Performance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: performance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


exports.getReview = async (req, res) => {
    try {
        const review = await Performance.findById(req.params.id)
            .populate('employee', 'fullName email department position')
            .populate('reviewer', 'fullName email');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Performance.find({ employee: req.user.id })
            .populate('reviewer', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Performance.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.acknowledgeReview = async (req, res) => {
    try {
        const review = await Performance.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.employee.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to acknowledge this review'
            });
        }

        review.status = 'Acknowledged';
        review.employeeFeedback = req.body.feedback;
        await review.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.generatePerformanceReport = async (req, res) => {
    try {
        const { department, startDate, endDate } = req.query;

        const matchQuery = {};
        if (department) {
            matchQuery['employee.department'] = department;
        }
        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await Performance.find(matchQuery)
            .populate('employee', 'fullName email department')
            .populate('reviewer', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};