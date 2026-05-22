/**
 * Hispanic Slang & Spanglish Database Template
 * 
 * Covers Spanish slang, Spanglish, and regional variations
 * from Mexico, Caribbean, Central/South America.
 * 
 * Instructions:
 * 1. Fill in 200-300 terms
 * 2. Include regional variations (Mexican, Caribbean, etc.)
 * 3. Save as hispanic-slang.js (remove "-template")
 * 4. Load before multilingual-language-processor.js
 * 
 * Regions: spanish_mx (Mexico), spanish_caribbean, spanish_arg (Argentina), 
 *          spanish_spain, spanglish
 */

window.hispanicSlang = [
    // MEXICAN SLANG (Examples)
    {
        term: 'güey',
        meaning: 'dude',
        language: 'spanish_mx',
        category: 'address',
        confidence: 0.95,
        context: 'Common informal address, like "bro" or "man"'
    },
    {
        term: 'chido',
        meaning: 'cool',
        language: 'spanish_mx',
        category: 'quality',
        confidence: 0.92,
        context: 'Something good or awesome'
    },
    {
        term: 'chingón',
        meaning: 'badass',
        language: 'spanish_mx',
        category: 'quality',
        confidence: 0.90,
        context: 'Something/someone really impressive'
    },
    {
        term: 'no mames',
        meaning: 'no way',
        language: 'spanish_mx',
        category: 'exclamation',
        confidence: 0.93,
        context: 'Expression of disbelief (mildly vulgar)'
    },
    
    // CARIBBEAN SPANISH (Examples)
    {
        term: 'dale',
        meaning: 'okay',
        language: 'spanish_caribbean',
        category: 'agreement',
        confidence: 0.95,
        context: 'Common in Cuba/Puerto Rico, means "go ahead" or "alright"'
    },
    {
        term: 'qué bola',
        meaning: "what's up",
        language: 'spanish_caribbean',
        category: 'greeting',
        confidence: 0.88,
        context: 'Cuban greeting'
    },
    
    // SPANGLISH BLENDS (Examples)
    {
        term: 'parquear',
        meaning: 'to park',
        language: 'spanglish',
        category: 'verb',
        confidence: 0.90,
        context: 'Spanish adaptation of English "park"'
    },
    {
        term: 'lonche',
        meaning: 'lunch',
        language: 'spanglish',
        category: 'noun',
        confidence: 0.92,
        context: 'Spanish pronunciation of "lunch"'
    },
    
    // ARGENTINIAN SLANG (Examples)
    {
        term: 'che',
        meaning: 'hey',
        language: 'spanish_arg',
        category: 'interjection',
        confidence: 0.94,
        context: 'Common Argentine interjection'
    },
    {
        term: 'boludo',
        meaning: 'dude',
        language: 'spanish_arg',
        category: 'address',
        confidence: 0.90,
        context: 'Can be friendly or insulting depending on context'
    },
    
    // Add your entries here...
    // Include: family terms (papi, mami), food slang, regional expressions
];

console.log('✅ Hispanic slang database loaded:', window.hispanicSlang.length, 'terms');
