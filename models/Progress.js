const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: Number,
    text: String,
    completed: { type: Boolean, default: false }
});

const resourceSchema = new mongoose.Schema({
    type: String,
    title: String,
    duration: String,
    completed: { type: Boolean, default: false }
});

const moduleSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    icon: String,
    status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
    tasks: [taskSchema],
    resources: [resourceSchema],
    xp: Number,
    startedAt: Date,
    completedAt: Date
});

const milestoneSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    icon: String,
    status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    deadline: String
});

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentPhase: { type: Number, default: 1, min: 1, max: 4 },
    currentModule: { type: Number, default: 1 },
    totalXP: { type: Number, default: 0 },
    completedModules: { type: Number, default: 0 },
    monthlyIncome: { type: Number, default: 0 },
    modules: [moduleSchema],
    milestones: [milestoneSchema],
    lastUpdated: { type: Date, default: Date.now }
});

// Initialize default progress when created
progressSchema.pre('save', function(next) {
    if (this.isNew) {
        // Initialize modules
        const initialModules = [
            {
                id: 1,
                title: "Fundamentos de JavaScript",
                description: "Domine os conceitos básicos de JavaScript incluindo variáveis, funções, estruturas de controle e manipulação do DOM.",
                icon: "fa-code",
                status: "active",
                tasks: [
                    { id: 1, text: "Assistir 10 horas de vídeos tutoriais" },
                    { id: 2, text: "Completar 50 exercícios básicos" },
                    { id: 3, text: "Criar 3 mini-projetos práticos" }
                ],
                resources: [
                    {
                        type: "Curso",
                        title: "JavaScript Moderno do Zero",
                        duration: "8h"
                    }
                ],
                xp: 100
            },
            // Add other initial modules with status "locked"
        ];

        // Initialize milestones
        const initialMilestones = [
            {
                id: 1,
                title: "JavaScript Dominado",
                description: "Completar todos os módulos de JavaScript e construir 3 projetos complexos.",
                icon: "fa-js",
                deadline: "Mês 3"
            },
            // Add other milestones
        ];

        this.modules = initialModules;
        this.milestones = initialMilestones;
    }
    next();
});

module.exports = mongoose.model('Progress', progressSchema);