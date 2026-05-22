/**
 * Asian Slang Database Template
 * 
 * Covers Chinese, Japanese, Korean, and other Asian language slang/loanwords
 * commonly used in English contexts.
 * 
 * Instructions:
 * 1. Fill in 200-300 terms for each language
 * 2. Include term, meaning, language, category, confidence, and context
 * 3. Save as asian-slang.js (remove "-template" from filename)
 * 4. Load before multilingual-language-processor.js in your HTML
 * 
 * Categories: appearance, quality, emotion, action, greeting, food, culture, internet
 * Confidence: 0.0 - 1.0 (how confident the translation is)
 */

// Make globally available
window.asianSlang = [
    // JAPANESE SLANG (Examples - add 200-300 more)
    {
        term: 'kawaii',
        meaning: 'cute',
        language: 'japanese',
        category: 'appearance',
        confidence: 0.95,
        context: 'Used to describe something adorable or charming, widely used in Western contexts'
    },
    {
        term: 'sugoi',
        meaning: 'amazing',
        language: 'japanese',
        category: 'quality',
        confidence: 0.92,
        context: 'Expresses awe or impressiveness'
    },
    {
        term: 'baka',
        meaning: 'idiot',
        language: 'japanese',
        category: 'insult',
        confidence: 0.98,
        context: 'Common insult, often used playfully in anime culture'
    },
    {
        term: 'senpai',
        meaning: 'upperclassman',
        language: 'japanese',
        category: 'honorific',
        confidence: 0.95,
        context: 'Refers to someone with more experience or higher status'
    },
    {
        term: 'otaku',
        meaning: 'geek',
        language: 'japanese',
        category: 'identity',
        confidence: 0.90,
        context: 'Someone obsessed with anime/manga/Japanese culture'
    },
    
    // KOREAN SLANG (Examples - add 200-300 more)
    {
        term: 'daebak',
        meaning: 'awesome',
        language: 'korean',
        category: 'quality',
        confidence: 0.90,
        context: 'Expresses amazement or excitement, popularized by K-pop'
    },
    {
        term: 'oppa',
        meaning: 'older brother',
        language: 'korean',
        category: 'honorific',
        confidence: 0.93,
        context: 'Used by females to address older males, term of endearment'
    },
    {
        term: 'aegyo',
        meaning: 'cuteness',
        language: 'korean',
        category: 'behavior',
        confidence: 0.88,
        context: 'Acting cute or charming to be endearing'
    },
    
    // CHINESE SLANG (Examples - add 200-300 more)
    {
        term: 'aiyah',
        meaning: 'oh no',
        language: 'chinese',
        category: 'exclamation',
        confidence: 0.92,
        context: 'Expression of surprise, frustration, or dismay'
    },
    {
        term: 'wumao',
        meaning: 'fifty cent party',
        language: 'chinese',
        category: 'politics',
        confidence: 0.85,
        context: 'Internet commenters allegedly paid by Chinese government'
    },
    
    // SINGLISH (Singapore English - Examples - add 100-200 more)
    {
        term: 'lah',
        meaning: 'emphasis particle',
        language: 'singlish',
        category: 'particle',
        confidence: 0.95,
        context: 'Sentence-final particle for emphasis or softening tone'
    },
    {
        term: 'alamak',
        meaning: 'oh my god',
        language: 'singlish',
        category: 'exclamation',
        confidence: 0.90,
        context: 'Expression of surprise or shock'
    },
    
    // Add your own entries here...
    // Aim for 200-300 terms per major language (Japanese, Korean, Chinese)
    // Include:
    // - Internet slang (weeb, waifu, etc.)
    // - Food terms (ramen, boba, etc.)
    // - Cultural concepts (face, filial piety, etc.)
    // - Honorifics and address terms
    // - Emotional expressions
    // - Actions and behaviors
];

console.log('✅ Asian slang database loaded:', window.asianSlang.length, 'terms');
