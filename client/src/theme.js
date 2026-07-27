let savedTheme = localStorage.getItem('theme') || 'light';
let savedColorTheme = localStorage.getItem('colorTheme') || 'ocean';

let previewThemeMode = savedTheme;
let previewColorTheme = savedColorTheme;

export function getTheme() {
    return previewThemeMode;
}

export function getColorTheme() {
    return previewColorTheme;
}

export function getSavedTheme() {
    return savedTheme;
}

export function getSavedColorTheme() {
    return savedColorTheme;
}

export function setTheme(theme) {
    saveThemeSelection(theme, savedColorTheme);
}

export function setColorTheme(colorTheme) {
    saveThemeSelection(savedTheme, colorTheme);
}

// Temporary preview methods (don't save to localStorage yet)
export function setPreviewThemeMode(mode) {
    previewThemeMode = mode;
    applyTheme();
}

export function setPreviewColorTheme(color) {
    previewColorTheme = color;
    applyTheme();
}

// Revert to last saved theme (if user leaves without clicking Simpan)
export function revertToSavedTheme() {
    previewThemeMode = savedTheme;
    previewColorTheme = savedColorTheme;
    applyTheme();
}

// Save theme selection permanently to localStorage & backend
export function saveThemeSelection(mode, color) {
    if (mode) {
        savedTheme = mode;
        previewThemeMode = mode;
        localStorage.setItem('theme', mode);
    }
    if (color) {
        savedColorTheme = color;
        previewColorTheme = color;
        localStorage.setItem('colorTheme', color);
    }
    applyTheme();
}

export function toggleTheme() {
    const nextMode = savedTheme === 'light' ? 'dark' : 'light';
    saveThemeSelection(nextMode, savedColorTheme);
}

export function applyTheme() {
    document.documentElement.setAttribute('data-theme', previewThemeMode);
    document.documentElement.setAttribute('data-color-theme', previewColorTheme);
    
    if (previewThemeMode === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    const palettes = {
        ocean: { primary: '#4a9fba', hover: '#3b88a0' },
        emerald: { primary: '#10b981', hover: '#059669' },
        violet: { primary: '#8b5cf6', hover: '#7c3aed' },
        rose: { primary: '#f43f5e', hover: '#e11d48' }
    };

    const palette = palettes[previewColorTheme] || palettes.ocean;
    document.documentElement.style.setProperty('--primary', palette.primary);
    document.documentElement.style.setProperty('--primary-hover', palette.hover);
}

export function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        savedTheme = saved;
    } else {
        savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const savedColor = localStorage.getItem('colorTheme');
    if (savedColor) {
        savedColorTheme = savedColor;
    }
    previewThemeMode = savedTheme;
    previewColorTheme = savedColorTheme;
    applyTheme();
}
