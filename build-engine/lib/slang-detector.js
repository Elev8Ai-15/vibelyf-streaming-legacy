/**
 * VIBENICITY BUILD ENGINE - STAGE 2: SLANG DETECTOR (OpenAI)
 * Uses GPT-4 to identify new slang terms in lyrics
 */

const OpenAI = require('openai');
const chalk = require('chalk');
const config = require('../config/config');

class SlangDetector {
    constructor(existingDatabase) {
        this.openai = new OpenAI({
            apiKey: config.apis.openai.apiKey
        });
        this.existingTerms = this.extractExistingTerms(existingDatabase);
    }

    /**
     * Main function: Detect slang in lyrics
     */
    async detectSlangInLyrics(lyricsText, songMetadata) {
        console.log(chalk.blue(`\n🔍 STAGE 2: SLANG DETECTION`));
        console.log(chalk.gray(`Analyzing: ${songMetadata.artist} - ${songMetadata.title}`));

        const prompt = this.buildDetectionPrompt(lyricsText, songMetadata);
        
        try {
            const response = await this.callOpenAI(prompt);
            const detected = this.parseResponse(response);
            
            console.log(chalk.green(`  ✓ Found ${detected.detectedTerms.length} potential new terms`));
            
            return detected;
        } catch (error) {
            console.error(chalk.red(`  ✗ Detection failed: ${error.message}`));
            return { detectedTerms: [] };
        }
    }

    /**
     * Batch process multiple songs
     */
    async detectSlangBatch(songsData) {
        console.log(chalk.blue(`\n🔍 STAGE 2: BATCH SLANG DETECTION`));
        console.log(chalk.gray(`Processing ${songsData.length} songs...`));

        const allDetected = [];

        for (const song of songsData) {
            try {
                const detected = await this.detectSlangInLyrics(song.lyrics, {
                    title: song.title,
                    artist: song.artist,
                    genre: song.genre
                });

                detected.detectedTerms.forEach(term => {
                    term.sourceSong = {
                        title: song.title,
                        artist: song.artist,
                        genre: song.genre,
                        url: song.url
                    };
                    allDetected.push(term);
                });

                // Rate limiting
                await this.delay(config.rateLimits.delayBetweenRequests);
            } catch (error) {
                console.error(chalk.yellow(`  ⚠ Skipped ${song.title}: ${error.message}`));
            }
        }

        // Deduplicate terms
        const uniqueTerms = this.deduplicateTerms(allDetected);
        
        console.log(chalk.green(`\n✅ Detection complete: ${uniqueTerms.length} unique new terms found`));
        
        return uniqueTerms;
    }

    /**
     * Build detection prompt for OpenAI
     */
    buildDetectionPrompt(lyricsText, songMetadata) {
        const sampleTerms = this.existingTerms.slice(0, 50).join(', ');
        
        return `You are an expert linguist specializing in African American Vernacular English (AAVE), Hispanic slang, internet slang, and emerging cultural language.

TASK: Analyze the following song lyrics and identify NEW slang terms that are NOT in the existing database.

EXISTING DATABASE (${this.existingTerms.length} terms): 
${sampleTerms}... (and ${this.existingTerms.length - 50} more)

SONG LYRICS:
"""
${lyricsText.substring(0, 2000)}
"""

SONG METADATA:
- Title: ${songMetadata.title}
- Artist: ${songMetadata.artist}
- Genre: ${songMetadata.genre}

INSTRUCTIONS:
1. Find terms that are:
   - Non-standard English (slang, vernacular, colloquialisms)
   - NOT already in the existing database
   - Used in a culturally significant way
   - Likely to be repeated in other songs/social media

2. For each term, provide:
   - The exact term as it appears
   - The likely meaning based on context
   - Usage context in the lyrics
   - Confidence score (0-100%)

3. Ignore:
   - Typos or artist-specific made-up words
   - Standard English words
   - Terms already in the database
   - Proper nouns (unless used as slang)

OUTPUT FORMAT (JSON):
{
    "detectedTerms": [
        {
            "term": "string",
            "likelyMeaning": "string",
            "contextInLyrics": "string (the line where it appears)",
            "confidenceScore": number (0-100),
            "potentialCategory": "aave | hispanic | digital | internet | gang | etc",
            "reasoning": "Why you think this is new slang"
        }
    ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no extra text.`;
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(prompt) {
        try {
            const response = await this.openai.chat.completions.create({
                model: config.apis.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a linguistic expert specializing in cultural slang analysis. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: config.apis.openai.temperature,
                max_tokens: config.apis.openai.maxTokens
            });

            return response.choices[0].message.content;
        } catch (error) {
            throw new Error(`OpenAI API call failed: ${error.message}`);
        }
    }

    /**
     * Parse OpenAI response
     */
    parseResponse(responseText) {
        try {
            // Remove markdown code blocks if present
            let cleaned = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const parsed = JSON.parse(cleaned);
            
            // Validate structure
            if (!parsed.detectedTerms || !Array.isArray(parsed.detectedTerms)) {
                throw new Error('Invalid response structure');
            }

            return parsed;
        } catch (error) {
            console.error(chalk.red('Failed to parse OpenAI response:'), responseText.substring(0, 200));
            throw new Error(`Parse error: ${error.message}`);
        }
    }

    /**
     * Extract existing terms from database
     */
    extractExistingTerms(database) {
        const terms = [];
        
        if (!database) return terms;

        for (const category in database) {
            if (Array.isArray(database[category])) {
                database[category].forEach(item => {
                    if (item.term) {
                        terms.push(item.term.toLowerCase().trim());
                    }
                });
            }
        }

        return terms;
    }

    /**
     * Deduplicate detected terms
     */
    deduplicateTerms(terms) {
        const unique = new Map();
        
        terms.forEach(term => {
            const key = term.term.toLowerCase().trim();
            
            // Keep the one with highest confidence
            if (!unique.has(key) || unique.get(key).confidenceScore < term.confidenceScore) {
                unique.set(key, term);
            }
        });

        return Array.from(unique.values());
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SlangDetector;
