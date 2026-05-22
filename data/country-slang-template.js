/**
 * Country/Southern US Slang Database Template
 * 
 * Covers Southern, rural, and country dialects from across the United States.
 * 
 * Instructions:
 * 1. Fill in 200-300 terms
 * 2. Include regional variations (Deep South, Appalachian, Texas, etc.)
 * 3. Save as country-slang.js (remove "-template")
 */

window.countrySlang = [
    // GENERAL SOUTHERN (Examples)
    {
        term: "y'all",
        meaning: 'you all',
        language: 'southern_us',
        category: 'pronoun',
        confidence: 0.99,
        context: 'Second person plural, ubiquitous in the South'
    },
    {
        term: "fixin' to",
        meaning: 'about to',
        language: 'southern_us',
        category: 'temporal',
        confidence: 0.98,
        context: 'Indicates imminent action'
    },
    {
        term: 'reckon',
        meaning: 'think',
        language: 'southern_us',
        category: 'cognition',
        confidence: 0.95,
        context: 'Used to express opinion or belief'
    },
    {
        term: 'bless your heart',
        meaning: 'sympathetic expression',
        language: 'southern_us',
        category: 'idiom',
        confidence: 0.92,
        context: 'Can be genuine sympathy or subtle insult'
    },
    {
        term: 'might could',
        meaning: 'might be able to',
        language: 'southern_us',
        category: 'modal',
        confidence: 0.88,
        context: 'Double modal construction'
    },
    
    // TEXAS SPECIFIC (Examples)
    {
        term: 'howdy',
        meaning: 'hello',
        language: 'texas',
        category: 'greeting',
        confidence: 0.96,
        context: 'Classic Texas greeting'
    },
    {
        term: 'tump',
        meaning: 'tip over',
        language: 'texas',
        category: 'verb',
        confidence: 0.85,
        context: 'To knock something over'
    },
    
    // APPALACHIAN (Examples)
    {
        term: 'holler',
        meaning: 'valley',
        language: 'appalachian',
        category: 'geography',
        confidence: 0.90,
        context: 'A hollow or small valley'
    },
    {
        term: 'poke',
        meaning: 'bag',
        language: 'appalachian',
        category: 'noun',
        confidence: 0.87,
        context: 'A sack or bag'
    },
    
    // Add your entries here...
    // Include: idioms, euphemisms, double modals, regional food terms
];

console.log('✅ Country slang database loaded:', window.countrySlang.length, 'terms');
