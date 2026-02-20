/**
 * Calculates XP based on category, effort, and duration.
 * 
 * @param {string} category - The category of the quest (e.g., 'learning', 'health', 'work').
 * @param {string} effort - The effort level ('low', 'medium', 'high', 'epic').
 * @param {number} durationMinutes - Estimated duration in minutes.
 * @returns {number} The calculated XP.
 */
export const calculateXP = (category, effort, durationMinutes = 0) => {
    let baseXP = 50;

    // 1. Base XP from Effort
    switch (effort) {
        case 'low': baseXP = 30; break;
        case 'medium': baseXP = 50; break;
        case 'high': baseXP = 100; break;
        case 'epic': baseXP = 500; break;
        default: baseXP = 50;
    }

    // 2. Duration Multiplier (approx 1 XP per minute for low effort, scaling up)
    // We dampen the duration effect to avoid huge numbers for long tasks
    let durationXP = 0;
    if (durationMinutes > 0) {
        // Logarithmic scale for duration to prevent abuse
        // 15 min -> ~15 XP
        // 60 min -> ~45 XP
        // 4 hours -> ~100 XP
        durationXP = Math.round(Math.sqrt(durationMinutes) * 5);
    }

    let totalXP = baseXP + durationXP;

    // 3. Category Multipliers
    const multipliers = {
        'learning': 1.2, // Encouraging learning
        'health': 1.1,   // Encouraging health
        'work': 1.0,
        'social': 1.1,
        'creative': 1.1,
        'personal': 1.0
    };

    if (multipliers[category]) {
        totalXP *= multipliers[category];
    }

    return Math.round(totalXP);
};
