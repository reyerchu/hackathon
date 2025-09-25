const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await controller.authenticate(username, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Verify token route
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        const result = await controller.verifyToken(token);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Grant assistant organiser role
router.post('/grant-assistant-organiser', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await controller.grantAssistantOrganiser(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Revoke assistant organiser role
router.post('/revoke-assistant-organiser', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await controller.revokeAssistantOrganiser(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Grant recruiter permission
router.post('/grant-recruiter', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await controller.grantRecruiterPermission(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Revoke recruiter permission
router.post('/revoke-recruiter', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await controller.revokeRecruiterPermission(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user metadata
router.patch('/metadata/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const result = await controller.updateMetadata(userId, updates);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
router.delete('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await controller.deleteUser(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;