const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { ensureAuthenticated } = require('../middleware/auth');

// Get user progress
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user._id });
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        res.json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update task status
router.put('/tasks/:moduleId/:taskId', ensureAuthenticated, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user._id });
        const module = progress.modules.id(req.params.moduleId);
        const task = module.tasks.id(req.params.taskId);
        
        task.completed = req.body.completed;
        await progress.save();
        
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Complete module
router.put('/modules/:moduleId/complete', ensureAuthenticated, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user._id });
        const module = progress.modules.id(req.params.moduleId);
        
        // Check if all tasks are completed
        const allTasksCompleted = module.tasks.every(task => task.completed);
        if (!allTasksCompleted) {
            return res.status(400).json({ message: 'Complete all tasks first' });
        }
        
        // Update module status
        module.status = 'completed';
        module.completedAt = new Date();
        
        // Add XP
        progress.totalXP += module.xp;
        progress.completedModules += 1;
        
        // Check if we should unlock next module
        const nextModule = progress.modules.find(m => m.id === module.id + 1);
        if (nextModule && nextModule.status === 'locked') {
            nextModule.status = 'active';
            progress.currentModule = nextModule.id;
        }
        
        // Check if we should complete any milestones
        updateMilestones(progress);
        
        await progress.save();
        
        res.json({
            module,
            unlocked: nextModule || null,
            xpEarned: module.xp
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Helper function to update milestones
function updateMilestones(progress) {
    progress.milestones.forEach(milestone => {
        // Example: Check if JavaScript modules are completed
        if (milestone.id === 1 && progress.completedModules >= 3) {
            milestone.status = 'completed';
            milestone.progress = 100;
        }
        // Add other milestone checks
    });
}

module.exports = router;