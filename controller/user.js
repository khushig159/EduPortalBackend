const Mentor = require('../model/mentor'); // adjust path if needed
const MentorRequest = require('../model/MentorRequest')
const Student = require('../model/user')
const { ObjectId } = require('mongodb');


exports.getmentors = async (req, res, next) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "No user ID found in request" });
        }
        // Fetch all mentors excluding sensitive fields
        const mentors = await Mentor.find()
            .select("-password -refreshTokenrecruiter -resetToken -resetTokenExpiration");

        res.status(200).json({
            success: true,
            count: mentors.length,
            data: mentors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch mentors"
        });
    }
};
exports.createRequest = async (req, res, next) => {
    try {
        const { menteeId, mentorId } = req.body;
        if (!menteeId || !mentorId) {
            return res.status(400).json({ success: false, message: 'menteeId and mentorId required' });
        }

        const request = new MentorRequest({ menteeId, mentorId });
        await request.save();

        // emit to mentor's room (mentor should be joined with userId = mentorId)
        const io = req.app.get('io');
        if (io) {
            io.to(mentorId.toString()).emit('newMentorRequest', {
                requestId: request._id,
                menteeId,
                mentorId,
                createdAt: request.createdAt,
            });
        }

        res.status(201).json({ success: true, requestId: request._id });
    } catch (err) {
        next(err);
    }
};

// mentor responds -> update DB and emit to request room
exports.respondRequest = async (req, res, next) => {
    try {
        const { requestId, status } = req.body;
        if (!requestId || !['accepted', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const request = await MentorRequest.findById(requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        request.status = status;
        request.updatedAt = new Date();
        await request.save();

        // emit to the request room so the mentee(s) who joined get notified
        const io = req.app.get('io');
        if (io) {
            io.to(requestId.toString()).emit('mentorResponse', {
                requestId,
                status,
            });
        }

        res.json({ success: true, message: 'Response recorded' });
    } catch (err) {
        next(err);
    }
};
exports.getuser = async (req, res, next) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "No user ID found in request" });
        }

        const user = await Student.findById(userId)
            // .lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user, message: "fetched user" })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: err.message })
    }
}
exports.getmentor = async (req, res, next) => {
    try {
        const mentorId = req.recruiteruserId; // set by authRecruiter middleware
        if (!mentorId) {
            return res.status(400).json({ message: "No mentor ID found in request" });
        }

        const mentor = await Mentor.findById(mentorId)
            .select("-password -refreshTokenrecruiter")
            .lean();

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        res.status(200).json({ mentor, message: "Fetched mentor" });
    } catch (err) {
        console.error("Error in getmentor:", err);
        res.status(500).json({ err: err.message });
    }
};