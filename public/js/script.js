document.addEventListener('DOMContentLoaded', async () => {
    // Load user progress
    const progress = await fetchProgress();
    
    // Initialize UI
    initDashboard(progress);
    initProgressPage(progress);
    initRoutinePage(progress);
    initMilestonesPage(progress);
    
    // Setup event listeners
    setupEventListeners();
});

async function fetchProgress() {
    try {
        const response = await fetch('/progress');
        if (!response.ok) throw new Error('Failed to fetch progress');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        // Fallback to local storage if available
        const localProgress = localStorage.getItem('progress');
        return localProgress ? JSON.parse(localProgress) : null;
    }
}

function initDashboard(progress) {
    if (!progress) return;
    
    // Update stats
    document.getElementById('completed-modules').textContent = progress.completedModules;
    document.getElementById('total-xp').textContent = progress.totalXP;
    document.getElementById('streak-days').textContent = progress.streak || 0;
    document.getElementById('completion-rate').textContent = `${Math.round((progress.completedModules / progress.modules.length) * 100)}%`;
    
    // Render current phase modules
    const currentPhaseModules = progress.modules.filter(m => 
        Math.ceil(m.id / 4) === progress.currentPhase
    );
    renderPathItems(currentPhaseModules, document.getElementById('path-items'));
    updateProgressLine(currentPhaseModules);
}

async function updateTaskStatus(moduleId, taskId, completed) {
    try {
        const response = await fetch(`/progress/tasks/${moduleId}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        // Fallback to local storage
        const progress = JSON.parse(localStorage.getItem('progress'));
        const module = progress.modules.find(m => m.id == moduleId);
        const task = module.tasks.find(t => t.id == taskId);
        task.completed = completed;
        localStorage.setItem('progress', JSON.stringify(progress));
        return task;
    }
}

async function completeModule(moduleId) {
    try {
        const response = await fetch(`/progress/modules/${moduleId}/complete`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Failed to complete module');
        const result = await response.json();
        
        // Show achievement
        showAchievement(result.module.title, result.xpEarned);
        
        // Update UI
        if (result.unlocked) {
            showUnlockedModule(result.unlocked);
        }
        
        return result;
    } catch (error) {
        console.error('Error:', error);
        // Fallback to local storage
        const progress = JSON.parse(localStorage.getItem('progress'));
        const module = progress.modules.find(m => m.id == moduleId);
        module.status = 'completed';
        module.completedAt = new Date();
        progress.totalXP += module.xp;
        progress.completedModules += 1;
        
        // Unlock next module
        const nextModule = progress.modules.find(m => m.id == module.id + 1);
        if (nextModule) {
            nextModule.status = 'active';
            progress.currentModule = nextModule.id;
            showUnlockedModule(nextModule);
        }
        
        localStorage.setItem('progress', JSON.stringify(progress));
        showAchievement(module.title, module.xp);
        return { module, unlocked: nextModule || null };
    }
}

function showUnlockedModule(module) {
    const popup = document.createElement('div');
    popup.className = 'unlock-popup';
    popup.innerHTML = `
        <div class="unlock-icon">
            <i class="fas fa-lock-open"></i>
        </div>
        <h3>NOVO MÓDULO DESBLOQUEADO!</h3>
        <p>${module.title}</p>
        <button class="btn btn-primary" onclick="this.parentElement.remove()">CONTINUAR</button>
    `;
    document.body.appendChild(popup);
}

// ... (other existing functions from previous frontend code)