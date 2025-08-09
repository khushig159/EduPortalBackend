const express = require('express');
const router = express.Router();
const messagecontroller = require('../controller/message');

// Get all messages between two users
router.get('/:user1/:user2', messagecontroller.getMessagesBetween);

// Mark messages as seen
router.put('/seen', messagecontroller.markMessagesAsSeen);

module.exports = router;
