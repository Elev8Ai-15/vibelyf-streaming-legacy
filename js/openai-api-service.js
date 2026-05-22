/**
 * OpenAI API Service - Database Schema & Data Modeling
 * 
 * Specializes in:
 * - Complex database schema design (SQL and NoSQL)
 * - Entity relationships and normalization
 * - Database migrations (up/down scripts)
 * - Seed data generation
 * - Query optimization strategies
 * - Data modeling best practices
 * 
 * Model: GPT-4 Turbo (gpt-4-turbo-preview)
 * - 4,096 max tokens
 * - Best for structured data design
 * - Excellent at complex relationships
 * 
 * Supported Databases:
 * - PostgreSQL (relational, ACID compliant)
 * - MySQL (relational, popular)
 * - MongoDB (NoSQL, document-based)
 * - SQLite (embedded, lightweight)
 * 
 * Extends: BaseAPIService for shared functionality
 * - Inherited: API key management, rate limiting, error handling
 * - Inherited: Usage tracking, retry logic, validation
 * - Custom: Dual prefix validation (sk- and sk-proj- both valid)
 * 
 * @extends BaseAPIService
 * @version 2.1.0
 * @date 2025-11-19
 */

class OpenAIAPIService extends BaseAPIService {
    constructor() {
        super(
            'OpenAI API',
            'vibecoder_openai_api_key',
            'sk-' // Both 'sk-' and 'sk-proj-' are valid
        );
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4-turbo-preview';
        this.maxTokens = 4096;
        
        // Rate limiting configuration
        this.maxConcurrentRequests = 3;
        this.minRequestInterval = 1000;
    }
    
    /**
     * Override validation to allow both OpenAI API key formats
     * 
     * OpenAI uses two prefix formats:
     * - 'sk-' for older API keys
     * - 'sk-proj-' for newer project-scoped keys
     * 
     * This override accepts both formats while maintaining
     * all other validation from BaseAPIService.
     * 
     * @param {string} apiKey - OpenAI API key to validate
     * @returns {{valid: boolean, error?: string}} Validation result
     * @override
     */
    validateAPIKey(apiKey) {
        const baseValidation = super.validateAPIKey(apiKey);
        if (!baseValidation.valid && apiKey && apiKey.startsWith('sk-proj-')) {
            // Allow sk-proj- prefix
            return { valid: true };
        }
        return baseValidation;
    }

    /**
     * Generate complete database schema
     * 
     * Creates production-ready database with:
     * - Normalized table/collection structure
     * - Primary keys, foreign keys, indexes
     * - Data type optimization
     * - Relationships (1:1, 1:many, many:many)
     * - Constraints (CHECK, UNIQUE, NOT NULL)
     * - Migration scripts (up/down)
     * - Seed data for testing
     * 
     * SQL Features:
     * - Proper normalization (3NF)
     * - JOINable relationships
     * - Index optimization
     * - Timestamps (created_at, updated_at)
     * - Soft delete support (deleted_at)
     * 
     * NoSQL Features:
     * - Document structure design
     * - Embedded vs referenced relationships
     * - Schema validation rules
     * - Index strategies
     * - Denormalization patterns
     * 
     * @param {object} spec - Database specification
     * @param {string} spec.appType - Application type for schema inference
     * @param {object} spec.database - Database configuration
     * @param {string} spec.database.type - Database type ('PostgreSQL'|'MySQL'|'MongoDB'|'SQLite')
     * @param {string[]} [spec.database.tables] - Required tables/collections
     * @param {string} [spec.database.relationships] - Relationship descriptions
     * @param {object} spec.backend - Backend framework info
     * @param {string} spec.backend.framework - Backend framework (for ORM selection)
     * @param {Array} [aaveFeatures] - Detected AAVE features for context
     * @returns {Promise<object>} Generated database schema:
     *   - success: boolean
     *   - schema: object with file paths and SQL/schema contents
     *   - model: string (model name used)
     *   - type: string (database type)
     * @throws {Error} If API key not configured or generation fails
     * @example
     * const schema = await openai.generateDatabase({
     *   appType: 'ecommerce',
     *   database: {
     *     type: 'PostgreSQL',
     *     tables: ['users', 'products', 'orders'],
     *     relationships: 'users have many orders, orders have many products'
     *   },
     *   backend: { framework: 'Express' }
     * });
     */
    async generateDatabase(spec, aaveFeatures = null) {
        if (!this.hasAPIKey()) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = this.buildDatabasePrompt(spec, aaveFeatures);
        
        return await this.queuedRequest(async () => {
            const response = await this.callOpenAIAPI(prompt);
            const schema = this.extractSchema(response);
            
            return {
                success: true,
                schema: schema,
                model: this.model,
                type: spec.database?.type || 'PostgreSQL'
            };
        });
    }

    /**
     * Generate database migration scripts
     * 
     * Creates migration files to transform database from current to new schema:
     * - ALTER TABLE statements for schema changes
     * - ADD/DROP COLUMN operations
     * - CREATE/DROP INDEX statements
     * - Data transformation scripts (if needed)
     * - Rollback procedures (down migrations)
     * 
     * @param {object} currentSchema - Current database schema
     * @param {object} newSchema - Desired database schema
     * @returns {Promise<string>} Generated migration code with up/down scripts
     * @throws {Error} If API key not configured
     * @example
     * const migrations = await openai.generateMigrations(
     *   { users: { columns: ['id', 'name'] } },
     *   { users: { columns: ['id', 'name', 'email'] } }
     * );
     */
    async generateMigrations(currentSchema, newSchema) {
        const prompt = this.buildMigrationPrompt(currentSchema, newSchema);
        const response = await this.callOpenAIAPI(prompt);
        return this.extractCode(response);
    }

    /**
     * Generate realistic seed data for testing
     * 
     * Creates sample data that:
     * - Respects foreign key constraints
     * - Uses realistic values (names, emails, dates)
     * - Includes edge cases for testing
     * - Maintains referential integrity
     * - Provides diverse test scenarios
     * 
     * @param {object} schema - Database schema to generate data for
     * @param {object} [options={}] - Seed data options
     * @param {number} [options.recordCount=10] - Records per table
     * @param {boolean} [options.realistic=true] - Use real-world examples
     * @param {boolean} [options.includeEdgeCases=true] - Include edge cases
     * @returns {Promise<string>} Generated seed data (SQL INSERTs or JS scripts)
     * @throws {Error} If API key not configured
     * @example
     * const seeds = await openai.generateSeedData(schema, {
     *   recordCount: 50,
     *   realistic: true,
     *   includeEdgeCases: true
     * });
     */
    async generateSeedData(schema, options = {}) {
        const prompt = this.buildSeedDataPrompt(schema, options);
        const response = await this.callOpenAIAPI(prompt);
        return this.extractCode(response);
    }

    /**
     * Build comprehensive database generation prompt
     */
    buildDatabasePrompt(spec, aaveFeatures) {
        const { appType, database, backend } = spec;
        
        let prompt = `You are VibeCoder's database architect. Design a complete, production-ready database schema.

**PROJECT SPECIFICATION:**
App Type: ${appType}
Database Type: ${database.type}
Required Tables/Collections: ${database.tables?.join(', ') || 'determine from app type'}
Backend Framework: ${backend.framework}

${database.relationships ? `**RELATIONSHIPS:**
${database.relationships}` : ''}

${aaveFeatures ? `**CONTEXT (from AAVE analysis):**
User expressed: ${aaveFeatures.map(f => f.feature).join(', ')}
This suggests data patterns: ${this.inferDataPatterns(aaveFeatures)}` : ''}

**REQUIREMENTS:**

${database.type === 'PostgreSQL' || database.type === 'MySQL' ? `
**For SQL Database (${database.type}):**
1. Create normalized schema with proper relationships
2. Define all tables with appropriate data types
3. Add PRIMARY KEY, FOREIGN KEY constraints
4. Include indexes for performance
5. Add CHECK constraints for data validation
6. Create JOINable relationships (1:1, 1:many, many:many)
7. Include timestamps (created_at, updated_at)
8. Add soft delete columns if appropriate (deleted_at)
9. Generate migration files (up/down)
10. Include seed data for testing

**OUTPUT FORMAT (SQL):**
Return JSON with:
\`\`\`json
{
  "schema.sql": "-- Complete schema definition",
  "migrations/001_initial.sql": "-- Initial migration",
  "seeds/sample_data.sql": "-- Sample data",
  "models/User.js": "// ORM model if using Sequelize/Knex",
  "README.md": "// Database documentation"
}
\`\`\`
` : ''}

${database.type === 'MongoDB' ? `
**For NoSQL Database (MongoDB):**
1. Design document schemas with proper structure
2. Define collections and their relationships (embedded vs referenced)
3. Add schema validation rules
4. Create indexes for query optimization
5. Design for denormalization where appropriate
6. Include timestamps (createdAt, updatedAt)
7. Add soft delete fields if needed
8. Generate Mongoose schemas
9. Include seed data
10. Design for scalability

**OUTPUT FORMAT (MongoDB):**
Return JSON with:
\`\`\`json
{
  "models/User.js": "// Mongoose schema",
  "models/[OtherModels].js": "// Other schemas",
  "seeds/index.js": "// Seed data script",
  "config/database.js": "// MongoDB connection",
  "README.md": "// Database documentation"
}
\`\`\`
` : ''}

**BEST PRACTICES:**
- Use appropriate data types (VARCHAR, INT, TIMESTAMP, etc.)
- Add NOT NULL constraints where appropriate
- Create proper indexes for frequently queried fields
- Include audit trail columns (created_by, updated_by)
- Design for data integrity and consistency
- Plan for future scalability
- Add comprehensive comments

Generate production-ready, scalable database schema with proper relationships and constraints.`;

        return prompt;
    }

    /**
     * Build migration generation prompt
     */
    buildMigrationPrompt(currentSchema, newSchema) {
        return `Generate database migration to transform the current schema to the new schema.

**CURRENT SCHEMA:**
${JSON.stringify(currentSchema, null, 2)}

**NEW SCHEMA:**
${JSON.stringify(newSchema, null, 2)}

Generate both UP and DOWN migrations with:
- ALTER TABLE statements
- ADD/DROP COLUMN operations
- CREATE/DROP INDEX statements
- Data transformation scripts if needed
- Rollback procedures

Return complete migration files.`;
    }

    /**
     * Build seed data generation prompt
     */
    buildSeedDataPrompt(schema, options) {
        return `Generate realistic seed data for the following database schema:

${JSON.stringify(schema, null, 2)}

**Requirements:**
- Generate ${options.recordCount || 10} records per table
- Use realistic, diverse data
- Respect foreign key constraints
- Include edge cases for testing
- ${options.realistic ? 'Use real-world examples' : 'Use test data'}

Return as SQL INSERT statements or JavaScript seed scripts.`;
    }

    /**
     * Infer data patterns from AAVE features
     */
    inferDataPatterns(aaveFeatures) {
        const features = aaveFeatures.map(f => f.feature.toLowerCase());
        
        if (features.includes('habitual_be')) {
            return 'recurring events table, scheduled tasks, frequency tracking';
        }
        if (features.includes('perfective_done')) {
            return 'completion status fields, audit trail, state management';
        }
        if (features.includes('remote_past_been')) {
            return 'historical data archive, temporal tables, long-term storage';
        }
        
        return 'standard relational design with proper normalization';
    }

    /**
     * Call OpenAI API with rate limiting and error handling
     * 
     * Makes authenticated request to OpenAI API with:
     * - System message for database architect role
     * - Automatic rate limiting via queue
     * - Retry logic with exponential backoff
     * - Token usage tracking
     * - Error handling with status codes
     * 
     * @param {string} prompt - Prompt to send to GPT-4
     * @param {object} [options={}] - Optional configuration
     * @param {number} [options.maxTokens] - Override max tokens (default: 4096)
     * @param {number} [options.temperature] - Model temperature 0-1 (default: 0.7)
     * @returns {Promise<string>} Generated text response
     * @throws {Error} If API request fails after retries
     * @private
     */
    async callOpenAIAPI(prompt, options = {}) {
        return await this.queuedRequest(async () => {
            const requestBody = {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert database architect specializing in schema design, normalization, and optimization.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || this.maxTokens,
                temperature: options.temperature || 0.7
            };

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
                error.status = response.status;
                error.errorData = errorData;
                throw error;
            }

            const data = await response.json();
            
            // Track token usage if available
            if (data.usage) {
                this.totalTokens += data.usage.total_tokens || 0;
            }
            
            return data.choices[0].message.content;
        });
    }

    /**
     * Extract schema from OpenAI response
     */
    extractSchema(response) {
        // Try to extract JSON with file structure
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (e) {
                console.warn('Failed to parse JSON structure, extracting code blocks');
            }
        }

        // Fallback: extract all code blocks
        const schemaFiles = {};
        const codeMatches = response.matchAll(/```(\w+)?\n([\s\S]*?)\n```/g);
        
        let index = 0;
        for (const match of codeMatches) {
            const language = match[1] || 'sql';
            const code = match[2];
            const filename = this.guessFilename(code, language, index);
            schemaFiles[filename] = code;
            index++;
        }

        return Object.keys(schemaFiles).length > 0 ? schemaFiles : { 'schema.sql': response };
    }

    /**
     * Extract code from response
     */
    extractCode(response) {
        return this.extractSchema(response); // Same extraction logic
    }

    /**
     * Guess filename from code content
     */
    guessFilename(code, language, index) {
        if (code.includes('CREATE TABLE') || code.includes('ALTER TABLE')) {
            if (code.includes('DROP TABLE')) {
                return `migrations/${String(index + 1).padStart(3, '0')}_migration.sql`;
            }
            return 'schema.sql';
        }
        if (code.includes('INSERT INTO')) {
            return 'seeds/sample_data.sql';
        }
        if (code.includes('mongoose.Schema') || code.includes('new Schema')) {
            return 'models/Model.js';
        }
        if (code.includes('Sequelize') || code.includes('DataTypes')) {
            return 'models/Model.js';
        }
        if (language === 'markdown' || code.includes('# Database')) {
            return 'README.md';
        }
        
        return `file${index}.${language}`;
    }

    /**
     * Test OpenAI API key validity
     * 
     * Performs minimal API call to verify:
     * - API key is valid and active (both sk- and sk-proj- formats)
     * - Account has access to GPT-4 Turbo model
     * - Network connectivity to OpenAI servers
     * - Sufficient quota/credits available
     * 
     * @param {string} [apiKey=null] - API key to test (uses stored key if null)
     * @returns {Promise<object>} Test result:
     *   - valid: boolean (true if key works)
     *   - message: string (success message)
     *   - error: string (error message if failed)
     * @example
     * const result = await openai.testAPIKey('sk-proj-...');
     * if (result.valid) {
     *   console.log('OpenAI API key works!');
     * }
     */
    async testAPIKey(apiKey = null) {
        const testKey = apiKey || this.apiKey;
        
        if (!testKey) {
            return { valid: false, error: 'No API key provided' };
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${testKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'user', content: 'Respond with: "API key is valid"' }
                    ],
                    max_tokens: 50
                })
            });

            if (response.ok) {
                return { valid: true, message: 'OpenAI API key is valid' };
            } else {
                const errorData = await response.json();
                return { valid: false, error: errorData.error?.message || 'Invalid API key' };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get model information and capabilities
     * 
     * Returns details about GPT-4 Turbo model:
     * - Model name and provider
     * - Specialization areas
     * - Token limits
     * - Key strengths
     * 
     * @returns {object} Model information:
     *   - name: string (model display name)
     *   - provider: string (API provider)
     *   - specialization: string (what it's best at)
     *   - maxTokens: number (maximum output tokens)
     *   - strengths: string[] (key capabilities)
     * @example
     * const info = openai.getModelInfo();
     * console.log(`Using ${info.name} for ${info.specialization}`);
     */
    getModelInfo() {
        return {
            name: 'GPT-4 Turbo',
            provider: 'OpenAI',
            specialization: 'Database schemas, complex data structures, relationships',
            maxTokens: this.maxTokens,
            strengths: [
                'Database schema design',
                'Complex relationships',
                'Data normalization',
                'Migration generation',
                'Query optimization'
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIAPIService;
}
