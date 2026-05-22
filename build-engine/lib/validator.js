/**
 * VIBELYF BUILD ENGINE - STAGE 4: VALIDATION ENGINE
 */

const chalk = require('chalk');
const config = require('../config/config');

class ValidationEngine {
    constructor(existingDatabase) {
        this.database = existingDatabase;
        this.existingTerms = this.flattenDatabase();
    }

    validateNewTerm(termData) {
        const validations = {
            isDuplicate: this.checkDuplicate(termData.term),
            hasRequiredFields: this.checkRequiredFields(termData),
            isValidCategory: this.checkCategory(termData.category),
            hasQualitySources: this.checkSources(termData.sources),
            meetsConfidenceThreshold: termData.confidence >= config.validation.minConfidenceScore,
            hasValidExamples: this.checkExamples(termData.examples)
        };

        const passed = Object.values(validations).every(v => v === true);
        const score = this.calculateValidationScore(validations);

        return {
            term: termData.term,
            passed: passed,
            score: score,
            validations: validations,
            recommendation: this.getRecommendation(score, validations)
        };
    }

    batchValidate(termsArray) {
        console.log(chalk.blue(`\n✅ STAGE 4: VALIDATION`));
        console.log(chalk.gray(`Validating ${termsArray.length} terms...`));

        const results = termsArray.map(term => {
            if (term.error) {
                return { ...term, validation: { passed: false, recommendation: 'ERROR' } };
            }
            
            const validation = this.validateNewTerm(term);
            console.log(chalk.gray(`  ${term.term}: ${validation.recommendation} (${validation.score}%)`));
            return { ...term, validation };
        });

        const passed = results.filter(r => r.validation.passed);
        console.log(chalk.green(`✅ Validation complete: ${passed.length}/${termsArray.length} passed\n`));

        return results;
    }

    checkDuplicate(term) {
        const normalized = term.toLowerCase().trim();
        return !this.existingTerms.includes(normalized);
    }

    checkRequiredFields(termData) {
        return config.validation.requiredFields.every(field => 
            termData[field] !== undefined && termData[field] !== ''
        );
    }

    checkCategory(category) {
        return config.validation.validCategories.includes(category);
    }

    checkSources(sources) {
        return Array.isArray(sources) && sources.length >= config.validation.minSources;
    }

    checkExamples(examples) {
        return Array.isArray(examples) && examples.length >= config.validation.minExamples;
    }

    calculateValidationScore(validations) {
        const weights = {
            isDuplicate: 30,
            hasRequiredFields: 25,
            isValidCategory: 15,
            hasQualitySources: 15,
            meetsConfidenceThreshold: 10,
            hasValidExamples: 5
        };

        let score = 0;
        for (const [key, value] of Object.entries(validations)) {
            if (value === true) {
                score += weights[key];
            }
        }
        return score;
    }

    getRecommendation(score, validations) {
        if (score >= 90) return 'AUTO_APPROVE';
        if (score >= 70) return 'NEEDS_REVIEW';
        if (validations.isDuplicate === false) return 'REJECT_DUPLICATE';
        return 'NEEDS_MANUAL_REVIEW';
    }

    flattenDatabase() {
        const terms = [];
        if (!this.database) return terms;

        for (const category in this.database) {
            if (Array.isArray(this.database[category])) {
                this.database[category].forEach(item => {
                    if (item.term) {
                        terms.push(item.term.toLowerCase().trim());
                    }
                });
            }
        }
        return terms;
    }
}

module.exports = ValidationEngine;
