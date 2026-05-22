// ════════════════════════════════════════════════════════════════════════════
// LINGUISTICS ENGINE (V32 CORE)
// "The Universal Vibe Compiler"
// ════════════════════════════════════════════════════════════════════════════
const Linguistics = {
    // 1. ARCHETYPES (The DNA of VibeLyf)
    defaults: {
        'ice': 'bg-cyan-950/30 backdrop-blur-xl border border-cyan-400/20 text-cyan-50 shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)] relative overflow-hidden',
        'fire': 'bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30 text-orange-50 shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] animate-pulse-slow',
        'neon': 'bg-black/90 border border-violet-500 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.6)] font-mono tracking-wider',
        'glass': 'bg-white/5 backdrop-blur-2xl border border-white/10 text-white shadow-2xl rounded-2xl',
        'luxury': 'bg-[#0a0a0a] border-b border-[#d4af37]/40 text-[#d4af37] font-serif tracking-[0.2em] uppercase shadow-none rounded-none',
        'minimal': 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg',
        'kawaii': 'bg-pink-500/5 border-2 border-pink-300 text-pink-500 rounded-3xl font-bold shadow-[4px_4px_0px_rgba(244,114,182,1)]',
        'cyber': 'bg-zinc-900 border-l-4 border-l-green-400 text-green-400 font-mono border-y border-r border-zinc-800',
        'matrix': 'bg-black text-green-500 font-mono border border-green-900 shadow-[inset_0_0_20px_rgba(0,255,0,0.2)]',
        'clay': 'bg-zinc-800 border-none shadow-[inset_6px_6px_12px_rgba(255,255,255,0.05),inset_-6px_-6px_12px_rgba(0,0,0,0.5)] rounded-3xl',
        'dark': 'bg-black border border-zinc-900 text-zinc-100 shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)]',
        'ocean': 'bg-gradient-to-b from-blue-900/40 to-teal-900/40 border border-blue-400/20 text-blue-100 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
        'nature': 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 text-green-100 shadow-[0_0_30px_-5px_rgba(34,197,94,0.2)]',
        'sunset': 'bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 border border-pink-400/20 text-pink-100 shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]',
        'aurora': 'bg-gradient-to-br from-purple-900/30 via-cyan-900/30 to-green-900/30 border border-cyan-400/20 text-cyan-100 animate-gradient',
        'brutalist': 'bg-white text-black border-4 border-black font-mono uppercase tracking-widest shadow-[8px_8px_0px_black]'
    },

    // 2. CUSTOM SPECS (User's Vibe Studio) - Enhanced with error handling
    customSpecs: (() => {
        try {
            return JSON.parse(localStorage.getItem('vibe_custom_specs') || '{}');
        } catch (e) {
            console.warn('Linguistics: Failed to load custom specs', e);
            return {};
        }
    })(),

    // 3. MERGED ACCESSOR
    get vibeSpecs() {
        return { ...this.defaults, ...this.customSpecs };
    },

    // 4. REGISTRY SYSTEM (Used by Vibe Studio & Oculus)
    register(key, spec) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanKey) return false;
        
        this.customSpecs[cleanKey] = spec;
        return this.save();
    },
    
    unregister(key) {
        if (this.customSpecs[key.toLowerCase()]) {
            delete this.customSpecs[key.toLowerCase()];
            return this.save();
        }
        return false;
    },
    
    listCustom() { return Object.keys(this.customSpecs); },
    
    // Enhanced save method with error handling
    save() {
        try {
            localStorage.setItem('vibe_custom_specs', JSON.stringify(this.customSpecs));
            return true;
        } catch (e) {
            console.error('Linguistics: Failed to save custom specs', e);
            return false;
        }
    },

    // 5. THE COMPILER (Active Detection) - Enhanced to prevent duplicates
    compile(text) {
        const detected = [];
        const seen = new Set();
        const lower = text.toLowerCase();
        
        // Scan ALL specs (defaults + custom)
        for (const [key, spec] of Object.entries(this.vibeSpecs)) {
            if (lower.includes(key) && !seen.has(key)) {
                detected.push({ key: key.toUpperCase(), spec });
                seen.add(key);
            }
        }
        return detected;
    },

    // 6. THE UNIVERSAL PROTOCOL (AI System Prompt)
    getGlobalInstructions() {
        const allKeys = Object.keys(this.vibeSpecs).map(k => k.toUpperCase()).join(', ');
        const customKeys = this.listCustom();
        const customNote = customKeys.length > 0 
            ? `\n\n🎨 USER CUSTOM VIBES: ${customKeys.map(k => k.toUpperCase()).join(', ')}`
            : '';
        
        return `
        GLOBAL CULTURAL PROTOCOL:
        You are a Semantic Translator. The user may speak ANY language.
        
        YOUR TASK:
        1. Analyze the user's aesthetic intent.
        2. Map it to one of the **Available Archetypes**: [${allKeys}]
        ${customNote}
        
        MAPPING EXAMPLES:
        - "Hielo" / "Glacé" / "Cold" → ICE
        - "Fuego" / "Hot" / "Spicy" → FIRE
        - "Kawaii" / "Cute" / "Pink" → KAWAII
        - "Luxe" / "Premium" / "Gold" → LUXURY
        - "Pog" / "Gamer" → NEON or CYBER
        
        If you detect an Archetype, YOU MUST USE THE COMPILED CSS CLASSES provided below.
        `;
    },

    // 7. SLANG DICTIONARY (For UI Feedback Chips)
    coreSlang: {
        'fire': 'amazing', 'bussin': 'excellent', 'slaps': 'great', 'no cap': 'truthfully', 
        'bet': 'agreed', 'vibe': 'atmosphere', 'drip': 'stylish', 'cooked': 'done', 
        'rizz': 'charisma', 'based': 'authentic', 'mid': 'mediocre', 'lit': 'exciting',
        'ship': 'deploy', 'nuke': 'delete', 'spin up': 'create', 'cook': 'build'
    },

    analyze(text) {
        const detected = [];
        for (const [slang, meaning] of Object.entries(this.coreSlang)) {
            if (text.toLowerCase().includes(slang)) detected.push({ term: slang, meaning });
        }
        return detected.slice(0, 5);
    },

    get count() {
        return Object.keys(this.defaults).length + Object.keys(this.customSpecs).length + Object.keys(this.coreSlang).length;
    }
};

// ════════════════════════════════════════════════════════════════════════════
// EXPORT TO WINDOW OBJECT
// ════════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.LinguisticsEngine = Linguistics;
    console.log('✅ Linguistics Engine V32 loaded:', Linguistics.count, 'total specs');
    console.log('📊 Defaults:', Object.keys(Linguistics.defaults).length);
    console.log('🎨 Custom:', Object.keys(Linguistics.customSpecs).length);
    console.log('💬 Slang:', Object.keys(Linguistics.coreSlang).length);
}

// ════════════════════════════════════════════════════════════════════════════
// MODULE EXPORT (if used in Node.js environment)
// ════════════════════════════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Linguistics;
}
