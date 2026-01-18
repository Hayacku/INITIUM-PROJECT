/**
 * Utilitaires de validation pour INITIUM
 * Assure l'intégrité des données XP, progression, etc.
 */

/**
 * Clamp un nombre entre min et max
 * @param {number} value - Valeur à clamp
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} Valeur clampée
 */
export const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
};

/**
 * Valide et normalise un pourcentage de progression
 * @param {number} progress - Progression à valider (0-100)
 * @returns {number} Progression valide entre 0 et 100
 */
export const validateProgress = (progress) => {
    if (typeof progress !== 'number' || isNaN(progress)) {
        console.warn('Invalid progress:', progress);
        return 0;
    }
    return clamp(progress, 0, 100);
};

/**
 * Valide un montant d'XP
 * @param {number} xp - XP à valider
 * @returns {number} XP valide (>= 0)
 */
export const validateXP = (xp) => {
    if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
        console.warn('Invalid XP:', xp);
        return 0;
    }
    return Math.max(0, Math.floor(xp));
};

/**
 * Valide un niveau utilisateur
 * @param {number} level - Niveau à valider
 * @returns {number} Niveau valide (>= 1)
 */
export const validateLevel = (level) => {
    if (typeof level !== 'number' || isNaN(level) || level < 1) {
        console.warn('Invalid level:', level);
        return 1;
    }
    return Math.max(1, Math.floor(level));
};

/**
 * Normalise une date à minuit (00:00:00) pour comparaisons cohérentes
 * @param {Date} date - Date à normaliser
 * @returns {Date} Date normalisée
 */
export const normalizeDate = (date = new Date()) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si email valide
 */
export const validateEmail = (email) => {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valide un username
 * @param {string} username - Username à valider
 * @returns {boolean} True si username valide
 */
export const validateUsername = (username) => {
    if (typeof username !== 'string') return false;
    // 3-20 caractères, alphanumérique + underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Sécurise un texte en retirant les caractères dangereux pour XSS
 * @param {string} text - Texte à sécuriser
 * @returns {string} Texte sécurisé
 */
export const sanitizeText = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Valide et calcule le streak (série) d'une habitude
 * @param {Array} completedDates - Tableau de dates de complétion
 * @returns {number} Nombre de jours consécutifs
 */
export const calculateStreak = (completedDates = []) => {
    if (!Array.isArray(completedDates) || completedDates.length === 0) return 0;

    // Trier les dates par ordre décroissant
    const sortedDates = completedDates
        .map(d => normalizeDate(new Date(d)))
        .sort((a, b) => b - a);

    const today = normalizeDate();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streak = 0;
    let currentDate = sortedDates[0] >= today ? today : yesterday;

    for (const date of sortedDates) {
        if (date.getTime() === currentDate.getTime()) {
            streak++;
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (date < currentDate) {
            break;
        }
    }

    return streak;
};
