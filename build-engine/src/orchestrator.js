/**
 * VIBENICITY BUILD ENGINE - MAIN ORCHESTRATOR
 * Coordinates all pipeline stages
 */

const chalk = require('chalk');
const GeniusScanner = require('../lib/genius-scanner');
const SlangDetector = require('../lib/slang-detector');
const DefinitionResearcher = require('../lib/researcher');
const ValidationEngine = require('../lib/validator');
const DatabaseManager = require('../lib/database-manager');
const config = require('../config/config');

class BuildEngineOrchestrator {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.existingDatabase = null;
    }

    async initialize() {
        console.log(chalk.bold.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🚀 VIBENICITY BUILD ENGINE v1.0.0               ║
║                                                           ║
║    Automated Cultural Language Ingestion Pipeline        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));

        console.log(chalk.gray('Initializing...\n'));
        
        // Load existing database
        this.existingDatabase = await this.dbManager.loadDatabase();
        
        if (!this.existingDatabase) {
            console.error(chalk.red('❌ Failed to load existing database'));
            process.exit(1);
        }

        console.log(chalk.green(`✓ Loaded database: ${this.existingDatabase.metadata.totalTerms} terms`));
        console.log(chalk.gray(`  Version: ${this.existingDatabase.metadata.version}`));
        console.log(chalk.gray(`  Last updated: ${this.existingDatabase.metadata.lastUpdated}\n`));
    }

    async runFullPipeline() {
        try {
            await this.initialize();

            console.log(chalk.bold.yellow('🎬 STARTING FULL PIPELINE\n'));
            console.log(chalk.gray('═'.repeat(60)));

            // STAGE 1: Scan lyrics
            const scanner = new GeniusScanner();
            const scannedSongs = await scanner.scanTrendingSongs();

            if (scannedSongs.length === 0) {
                console.log(chalk.yellow('\n⚠️  No songs found. Exiting.'));
                return;
            }

            // STAGE 2: Detect slang
            const detector = new SlangDetector(this.existingDatabase);
            const detectedTerms = await detector.detectSlangBatch(scannedSongs);

            if (detectedTerms.length === 0) {
                console.log(chalk.yellow('\n⚠️  No new slang detected. Exiting.'));
                return;
            }

            // STAGE 3: Research definitions
            const researcher = new DefinitionResearcher();
            const researchedTerms = await researcher.batchResearch(detectedTerms);

            // STAGE 4: Validate
            const validator = new ValidationEngine(this.existingDatabase);
            const validatedTerms = await validator.batchValidate(researchedTerms);

            // STAGE 5: Save to pending
            const pendingTerms = await this.dbManager.savePendingTerms(validatedTerms);

            // Summary
            this.printSummary(scannedSongs.length, detectedTerms.length, pendingTerms.length);

        } catch (error) {
            console.error(chalk.red(`\n❌ Pipeline failed: ${error.message}`));
            console.error(error.stack);
            process.exit(1);
        }
    }

    printSummary(scanned, detected, pending) {
        console.log(chalk.bold.cyan('\n' + '═'.repeat(60)));
        console.log(chalk.bold.cyan('                     PIPELINE COMPLETE'));
        console.log(chalk.bold.cyan('═'.repeat(60) + '\n'));

        console.log(chalk.white('📊 RESULTS:'));
        console.log(chalk.gray(`   Songs scanned:     ${scanned}`));
        console.log(chalk.gray(`   Terms detected:    ${detected}`));
        console.log(chalk.gray(`   Pending approval:  ${pending}`));

        console.log(chalk.white('\n📍 NEXT STEPS:'));
        console.log(chalk.gray('   1. Open dashboard: npm run dashboard'));
        console.log(chalk.gray('   2. Review pending terms in data/pending_terms.json'));
        console.log(chalk.gray('   3. Approve terms via dashboard'));
        console.log(chalk.gray('   4. Terms will be merged into vocabulary database\n'));

        console.log(chalk.bold.green('✅ Build Engine run complete!\n'));
    }
}

// CLI Execution
if (require.main === module) {
    const orchestrator = new BuildEngineOrchestrator();
    orchestrator.runFullPipeline();
}

module.exports = BuildEngineOrchestrator;
