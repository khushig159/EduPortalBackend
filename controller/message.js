const Message = require('../model/Messages');

// Get chat history between two users
exports.getMessagesBetween = async (req, res, next) => {
    const { user1, user2 } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json({ messages });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Send a new message
exports.sendMessage = async (req, res, next) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ message: 'senderId, receiverId, and content are required' });
    }

    try {
        const newMessage = new Message({
            senderId,
            receiverId,
            content,
            seen: false,
            timestamp: new Date()
        });

        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// Mark all messages as seen from sender to receiver
exports.markMessagesAsSeen = async (req, res, next) => {
    const { senderId, receiverId } = req.body;

    try {
        await Message.updateMany(
            { senderId, receiverId, seen: false },
            { $set: { seen: true } }
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error updating seen status' });
    }
};
