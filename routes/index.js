const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        // Get user progress
        const progress = await Progress.findOne({ userId: req.user._id });
        
        if (!progress) {
            // Initialize progress for new users
            const newProgress = new Progress({ userId: req.user._id });
            await newProgress.save();
            return res.render('dashboard', { progress: newProgress });
        }
        
        res.render('dashboard', { progress });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;