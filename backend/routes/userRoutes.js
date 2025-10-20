import express from 'express';
import User from '../models/users.js';

const router = express.Router();

// GET /user-profile - Display user profile
router.get('/user-profile', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/auth/google');
    res.render('user-profile', { user: req.user });
});

// POST /user-profile - Update user profile
router.post('/user-profile', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/auth/google');

    try {
        const { displayName, phone, address } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            displayName,
            phone,
            address
        });
        res.redirect('/user-profile');
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
