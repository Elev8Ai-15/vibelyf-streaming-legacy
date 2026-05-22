/**
 * VIBELYF BUILD ENGINE - STAGE 3: DEFINITION RESEARCHER (Gemini)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const chalk = require('chalk');
const config = require('../config/config');

class DefinitionResearcher {
    constructor() {
        this.genAI = new GoogleGenerativeAI(config.apis.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.apis.gemini.model });
    }

    async researchTermDefinition(term, context) {
        console.log(chalk.gray(`  Researching: "${term}"`));
        const prompt = this.buildResearchPrompt(term, context);
        
        try {
            const response = await this.callGemini(prompt);
            const definition = this.parseAndValidate(response, term);
            console.log(chalk.green(`    ✓ ${definition.confidence}% confidence`));
            return definition;
        } catch (error) {
            console.error(chalk.red(`    ✗ Failed: ${error.message}`));
            throw error;
        }
    }

    async batchResearch(detectedTerms) {
        console.log(chalk.blue(`\n📚 STAGE 3: DEFINITION RESEARCH`));
        console.log(chalk.gray(`Researching ${detectedTerms.length} terms...`));

        const results = [];
        for (const term of detectedTerms) {
            try {
                const definition = await this.researchTermDefinition(term.term, term);
                definition.sourceSong = term.sourceSong;
                results.push(definition);
                await this.delay(1000);
            } catch (error) {
                results.push({
                    term: term.term,
                    error: error.message,
                    needsManualReview: true,
                    sourceSong: term.sourceSong
                });
            }
        }

        const successful = results.filter(r => !r.error);
        console.log(chalk.green(`✅ Research complete: ${successful.length}/${detectedTerms.length} successful\n`));
        return results;
    }

    buildResearchPrompt(term, context) {
        return `Research this slang term and return ONLY valid JSON:

TERM: "${term}"
CONTEXT: ${context.likelyMeaning}
USAGE: "${context.contextInLyrics}"
SOURCE: ${context.sourceSong?.title} by ${context.sourceSong?.artist}

Return this exact JSON structure:
{
    "term": "${term}",
    "meaning": "One-sentence meaning",
    "definition": "2-3 sentence detailed definition",
    "origin": "Cultural origin",
    "etymology": "Word formation history",
    "category": "aave|hispanic|digital|southern|internet|prison|gang|appalachian|british|asian_american|elitist",
    "confidence": 0-100,
    "context": "Where/how used",
    "examples": ["example1", "example2", "example3"],
    "relatedTerms": ["term1", "term2", "term3"],
    "sources": ["source1", "source2", "source3"]
}`;
    }

    async callGemini(prompt) {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    parseAndValidate(responseText, term) {
        let cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const termData = JSON.parse(cleaned);
        
        termData.dateAdded = new Date().toISOString().split('T')[0];
        termData.addedByBuildEngine = true;
        termData.needsReview = termData.confidence < 90;
        
        return termData;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DefinitionResearcher;
