/**
 * VIBELYF Claude API Generator
 * 
 * Transforms natural language into production-ready APIs
 * Integrates with culturalVocabularyMaster for enhanced intent detection
 * 
 * @version 1.0.0
 * @author VIBELYF + Claude
 */

const ClaudeAPIGenerator = {
    
    // Configuration
    config: {
        claudeEndpoint: 'https://api.anthropic.com/v1/messages',
        // UPGRADED May 2026: Sonnet 4.6 is current latest. 1M context beta available.
        claudeModel: 'claude-sonnet-4-6',
        // NOTE: This key was hardcoded in the Genspark export. Phase 1.H moves it
        //       to the Cloudflare Workers proxy. Rotate this key before Phase 1.F (GitHub push).
        claudeApiKey: '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',
        maxTokens: 4096,
        debug: true
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Initialize the generator
     * @param {string} apiKey - Claude API key
     */
    init(apiKey) {
        this.config.claudeApiKey = apiKey;
        this.log('🚀 Claude API Generator initialized');
        return this;
    },

    /**
     * Set API key
     */
    setApiKey(key) {
        this.config.claudeApiKey = key;
    },

    // ═══════════════════════════════════════════════════════════════
    // MAIN ENTRY POINT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Generate an API from natural language
     * @param {string} userMessage - User's API description
     * @returns {Promise<GenerationResult>}
     */
    async generate(userMessage) {
        const startTime = Date.now();
        
        const result = {
            success: false,
            files: {},
            endpoints: [],
            schema: null,
            deployConfig: null,
            stats: { startTime, endTime: null, duration: null },
            errors: []
        };

        try {
            this.log('📝 Processing request:', userMessage);

            // Step 1: Parse through linguistics layer
            const parsed = await this.parseIntent(userMessage);
            this.log('🧠 Parsed intent:', parsed);

            // Step 2: Generate schema via Claude
            const schema = await this.extractSchema(parsed);
            result.schema = schema;
            this.log('📊 Extracted schema:', schema);

            // Step 3: Generate code files
            result.files = this.generateCode(schema);
            this.log('💻 Generated files:', Object.keys(result.files));

            // Step 4: Build endpoint list
            result.endpoints = this.buildEndpointList(schema);

            // Step 5: Generate deployment configs
            result.deployConfig = this.generateDeployConfig(schema);

            result.success = true;

        } catch (error) {
            result.errors.push(error.message);
            this.log('❌ Error:', error);
        }

        result.stats.endTime = Date.now();
        result.stats.duration = result.stats.endTime - result.stats.startTime;

        return result;
    },

    // ═══════════════════════════════════════════════════════════════
    // INTENT PARSING (Linguistics Integration)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Parse user intent through cultural vocabulary layer
     * @param {string} message - Raw user message
     * @returns {ParsedIntent}
     */
    async parseIntent(message) {
        const result = {
            original: message,
            normalized: message,
            slangDetected: [],
            entities: [],
            actions: [],
            relationships: [],
            features: [],
            confidence: 0
        };

        // Normalize through cultural vocabulary
        const normalized = this.normalizeWithCulturalVocab(message);
        result.normalized = normalized.text;
        result.slangDetected = normalized.detected;

        // Extract entities
        result.entities = this.extractEntities(result.normalized);

        // Detect actions
        result.actions = this.detectActions(result.normalized);

        // Find relationships
        result.relationships = this.detectRelationships(result.normalized, result.entities);

        // Extract features
        result.features = this.extractFeatures(result.normalized);

        // Calculate confidence
        result.confidence = this.calculateConfidence(result);

        return result;
    },

    /**
     * Normalize message using VIBELYF's cultural vocabulary
     */
    normalizeWithCulturalVocab(text) {
        const detected = [];
        let normalized = text.toLowerCase();

        // Check if cultural vocabulary is loaded
        if (window.culturalVocabularyMaster && window.culturalVocabularyMaster.terms) {
            const terms = window.culturalVocabularyMaster.terms;
            
            terms.forEach(termObj => {
                const term = termObj.term.toLowerCase();
                const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
                
                if (regex.test(normalized)) {
                    detected.push({
                        term: termObj.term,
                        meaning: termObj.meaning || termObj.definition,
                        category: termObj.category,
                        origin: termObj.origin
                    });
                    
                    // Replace with normalized meaning if available
                    if (termObj.meaning) {
                        // Keep original for context but note the detection
                        // Don't replace - let Claude understand the full context
                    }
                }
            });
        }

        // Fallback normalizations for common patterns not in vocab
        const fallbackMap = {
            'yo ': '',
            'gonna ': 'going to ',
            'wanna ': 'want to ',
            'gotta ': 'have to ',
            'gimme ': 'give me ',
            'lemme ': 'let me ',
            'kinda ': 'kind of ',
            'sorta ': 'sort of ',
            'tryna ': 'trying to ',
            'finna ': 'going to ',
            'boutta ': 'about to '
        };

        Object.entries(fallbackMap).forEach(([slang, replacement]) => {
            if (normalized.includes(slang)) {
                normalized = normalized.replace(new RegExp(slang, 'g'), replacement);
            }
        });

        return { text: normalized.trim(), detected };
    },

    /**
     * Extract entities from text
     */
    extractEntities(text) {
        const entities = new Set();
        
        // Common entity patterns
        const patterns = [
            /(?:api|system|app|platform)\s+(?:for|to\s+(?:manage|track|handle))\s+(?:my\s+)?(\w+)/gi,
            /(\w+)\s+(?:api|system|management|tracking|inventory|collection)/gi,
            /(?:manage|track|store|handle|create|list)\s+(?:my\s+)?(\w+)/gi,
            /(?:for|with)\s+(?:my\s+)?(\w+s?)(?:\s+(?:and|,))?/gi
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const entity = this.cleanEntityName(match[1]);
                if (entity && entity.length > 2 && !this.isStopWord(entity)) {
                    entities.add(entity);
                }
            }
        });

        // Always include User if auth-related words present
        if (/\b(user|login|auth|account|sign\s*up|register)\b/i.test(text)) {
            entities.add('user');
        }

        return Array.from(entities).map(name => ({
            name: this.singularize(name),
            plural: this.pluralize(this.singularize(name))
        }));
    },

    /**
     * Detect CRUD actions
     */
    detectActions(text) {
        const actionMap = {
            create: /\b(create|add|make|new|register|post|insert)\b/i,
            read: /\b(get|list|view|show|display|fetch|retrieve|search|find|browse|read)\b/i,
            update: /\b(update|edit|modify|change|patch|put)\b/i,
            delete: /\b(delete|remove|cancel|destroy|trash)\b/i
        };

        const detected = [];
        Object.entries(actionMap).forEach(([action, pattern]) => {
            if (pattern.test(text)) {
                detected.push(action);
            }
        });

        // Default to full CRUD if nothing specific detected
        return detected.length > 0 ? detected : ['create', 'read', 'update', 'delete'];
    },

    /**
     * Detect relationships between entities
     */
    detectRelationships(text, entities) {
        const relationships = [];
        
        const patterns = [
            { regex: /(\w+)\s+(?:has|have|contains?)\s+(?:many|multiple)\s+(\w+)/gi, type: 'one-to-many' },
            { regex: /(\w+)\s+belongs?\s+to\s+(?:a\s+)?(\w+)/gi, type: 'many-to-one' },
            { regex: /each\s+(\w+)\s+(?:has|can\s+have)\s+(\w+)/gi, type: 'one-to-many' }
        ];

        patterns.forEach(({ regex, type }) => {
            let match;
            while ((match = regex.exec(text)) !== null) {
                relationships.push({
                    from: this.singularize(match[1].toLowerCase()),
                    to: this.singularize(match[2].toLowerCase()),
                    type
                });
            }
        });

        return relationships;
    },

    /**
     * Extract feature requirements
     */
    extractFeatures(text) {
        const features = [];
        
        const featurePatterns = {
            auth: /\b(login|auth|user|account|password|sign\s*up)\b/i,
            search: /\b(search|filter|find|query|lookup)\b/i,
            pagination: /\b(page|paginate|limit|offset)\b/i,
            upload: /\b(upload|image|photo|file|picture|media)\b/i,
            payment: /\b(pay|payment|checkout|stripe|price|cost)\b/i
        };

        Object.entries(featurePatterns).forEach(([feature, pattern]) => {
            if (pattern.test(text)) {
                features.push(feature);
            }
        });

        return features;
    },

    /**
     * Calculate parsing confidence
     */
    calculateConfidence(parsed) {
        let score = 0;
        if (parsed.entities.length > 0) score += 40;
        if (parsed.entities.length > 2) score += 10;
        if (parsed.actions.length > 0) score += 20;
        if (parsed.relationships.length > 0) score += 15;
        if (parsed.features.length > 0) score += 15;
        return Math.min(score, 100);
    },

    // ═══════════════════════════════════════════════════════════════
    // SCHEMA EXTRACTION (Claude Integration)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Extract full schema using Claude
     */
    async extractSchema(parsed) {
        const prompt = this.buildSchemaPrompt(parsed);
        
        // Strategy: Try Gemini first (CORS-safe), then Claude, then local fallback
        
        // 1. Try Gemini 3.5 Flash (browser-safe, fast)
        try {
            const geminiResponse = await this.callGeminiForSchema(prompt);
            if (geminiResponse) {
                this.log('✅ Schema extracted via Gemini 3.5 Flash (CORS-safe)');
                return this.parseSchemaResponse(geminiResponse);
            }
        } catch (geminiError) {
            this.log('⚠️ Gemini schema extraction failed:', geminiError.message);
        }

        // 2. Try Claude (may fail due to CORS in browser — fixed by Phase 1.H Workers proxy)
        try {
            const response = await this.callClaude(prompt);
            this.log('✅ Schema extracted via Claude Sonnet 4.6');
            return this.parseSchemaResponse(response);
        } catch (error) {
            this.log('⚠️ Claude unavailable (likely CORS):', error.message);
        }
        
        // 3. Final fallback: local schema generation
        this.log('🔧 Using local schema generation (no AI available)');
        return this.generateLocalSchema(parsed);
    },

    /**
     * Build schema extraction prompt
     */
    buildSchemaPrompt(parsed) {
        const culturalContext = parsed.slangDetected.length > 0
            ? `\n\nCULTURAL CONTEXT DETECTED:\n${parsed.slangDetected.map(s => `- "${s.term}" (${s.category}): ${s.meaning}`).join('\n')}`
            : '';

        return `You are an expert API architect. Generate a complete database schema for this API request.

USER REQUEST: "${parsed.original}"

NORMALIZED: "${parsed.normalized}"

DETECTED ENTITIES: ${parsed.entities.map(e => e.name).join(', ') || 'Infer from context'}
DETECTED ACTIONS: ${parsed.actions.join(', ')}
DETECTED FEATURES: ${parsed.features.join(', ') || 'None specified'}
${culturalContext}

Generate a JSON schema with:
1. All entities with fields (include id, createdAt, updatedAt)
2. Field types: string, int, float, boolean, datetime, text, json
3. Required/optional markers
4. Relationships between entities
5. Any authentication if users are involved

RESPOND WITH ONLY VALID JSON (no markdown):
{
  "apiName": "descriptive_name",
  "description": "What this API does",
  "entities": [
    {
      "name": "EntityName",
      "fields": [
        {"name": "id", "type": "string", "required": true, "unique": true},
        {"name": "fieldName", "type": "string", "required": true}
      ]
    }
  ],
  "relationships": [
    {"from": "Entity1", "to": "Entity2", "type": "one-to-many"}
  ],
  "auth": true
}`;
    },

    /**
     * Call Gemini API for schema extraction (browser-safe, CORS enabled)
     */
    async callGeminiForSchema(prompt) {
        // Get Gemini API key from Code Generator or localStorage
        const apiKey = window.VibeLyfCodeGenerator?.config?.apiKey || 
                       localStorage.getItem('gemini_api_key');
        
        if (!apiKey) {
            throw new Error('No Gemini API key available');
        }
        
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 4096
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) throw new Error('Empty Gemini response');
        return text;
    },

    /**
     * Call Claude API (may fail in browser due to CORS)
     */
    async callClaude(prompt) {
        if (!this.config.claudeApiKey) {
            throw new Error('Claude API key not set');
        }

        const response = await fetch(this.config.claudeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.config.claudeModel,
                max_tokens: this.config.maxTokens,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    },

    /**
     * Parse Claude's schema response
     */
    parseSchemaResponse(response) {
        // Strip markdown if present
        let json = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        try {
            return JSON.parse(json);
        } catch (e) {
            // Try to extract JSON from response
            const match = json.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
            throw new Error('Failed to parse schema from Claude response');
        }
    },

    /**
     * Generate schema locally (fallback)
     */
    generateLocalSchema(parsed) {
        const schema = {
            apiName: parsed.entities[0]?.name + '_api' || 'generated_api',
            description: `API for managing ${parsed.entities.map(e => e.plural).join(', ')}`,
            entities: [],
            relationships: parsed.relationships,
            auth: parsed.features.includes('auth')
        };

        // Add User entity if auth detected
        if (schema.auth) {
            schema.entities.push({
                name: 'User',
                fields: [
                    { name: 'id', type: 'string', required: true, unique: true },
                    { name: 'email', type: 'string', required: true, unique: true },
                    { name: 'password', type: 'string', required: true },
                    { name: 'name', type: 'string', required: false },
                    { name: 'createdAt', type: 'datetime', required: true },
                    { name: 'updatedAt', type: 'datetime', required: true }
                ]
            });
        }

        // Generate entity schemas
        parsed.entities.forEach(entity => {
            if (entity.name.toLowerCase() === 'user' && schema.auth) return;

            schema.entities.push({
                name: this.capitalize(entity.name),
                fields: [
                    { name: 'id', type: 'string', required: true, unique: true },
                    { name: 'name', type: 'string', required: true },
                    { name: 'description', type: 'text', required: false },
                    { name: 'status', type: 'string', required: false },
                    { name: 'createdAt', type: 'datetime', required: true },
                    { name: 'updatedAt', type: 'datetime', required: true }
                ]
            });
        });

        return schema;
    },

    // ═══════════════════════════════════════════════════════════════
    // CODE GENERATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Generate all code files from schema
     */
    generateCode(schema) {
        const files = {};

        // Package.json
        files['package.json'] = this.genPackageJson(schema);

        // Main server file
        files['src/index.js'] = this.genServerFile(schema);

        // Database config
        files['src/config/database.js'] = this.genDatabaseConfig();

        // Prisma schema
        files['prisma/schema.prisma'] = this.genPrismaSchema(schema);

        // Generate per-entity files
        schema.entities.forEach(entity => {
            const name = entity.name.toLowerCase();
            files[`src/routes/${name}.routes.js`] = this.genRoutes(entity, schema);
            files[`src/controllers/${name}.controller.js`] = this.genController(entity);
            files[`src/services/${name}.service.js`] = this.genService(entity);
        });

        // Auth files if needed
        if (schema.auth) {
            files['src/routes/auth.routes.js'] = this.genAuthRoutes();
            files['src/controllers/auth.controller.js'] = this.genAuthController();
            files['src/middleware/auth.js'] = this.genAuthMiddleware();
        }

        // Utilities
        files['src/middleware/errorHandler.js'] = this.genErrorHandler();
        files['src/utils/response.js'] = this.genResponseUtils();

        // Config files
        files['.env.example'] = this.genEnvExample(schema);
        files['.gitignore'] = this.genGitignore();
        files['README.md'] = this.genReadme(schema);

        return files;
    },

    /**
     * Generate package.json
     */
    genPackageJson(schema) {
        const pkg = {
            name: this.toKebabCase(schema.apiName || 'vibelyf-api'),
            version: '1.0.0',
            description: schema.description || 'Generated by VIBELYF',
            main: 'src/index.js',
            scripts: {
                start: 'node src/index.js',
                dev: 'nodemon src/index.js',
                'db:generate': 'prisma generate',
                'db:push': 'prisma db push',
                'db:migrate': 'prisma migrate dev'
            },
            dependencies: {
                'express': '^4.18.2',
                '@prisma/client': '^5.7.0',
                'cors': '^2.8.5',
                'helmet': '^7.1.0',
                'morgan': '^1.10.0',
                'dotenv': '^16.3.1'
            },
            devDependencies: {
                'prisma': '^5.7.0',
                'nodemon': '^3.0.2'
            }
        };

        if (schema.auth) {
            pkg.dependencies['jsonwebtoken'] = '^9.0.2';
            pkg.dependencies['bcryptjs'] = '^2.4.3';
        }

        return JSON.stringify(pkg, null, 2);
    },

    /**
     * Generate main server file
     */
    genServerFile(schema) {
        const routeImports = schema.entities
            .map(e => `const ${e.name.toLowerCase()}Routes = require('./routes/${e.name.toLowerCase()}.routes');`)
            .join('\n');

        const routeMounts = schema.entities
            .map(e => `app.use('/api/${e.name.toLowerCase()}s', ${e.name.toLowerCase()}Routes);`)
            .join('\n');

        return `/**
 * ${schema.apiName || 'Generated API'}
 * Generated by VIBELYF API Generator
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
${routeImports}
${schema.auth ? "const authRoutes = require('./routes/auth.routes');" : ''}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        api: '${schema.apiName || 'VIBELYF API'}',
        timestamp: new Date().toISOString() 
    });
});

// Routes
${schema.auth ? "app.use('/api/auth', authRoutes);" : ''}
${routeMounts}

// Error handling
app.use(errorHandler);

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(\`🚀 ${schema.apiName || 'API'} running on port \${PORT}\`);
});

module.exports = app;
`;
    },

    /**
     * Generate database config
     */
    genDatabaseConfig() {
        return `const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

module.exports = prisma;
`;
    },

    /**
     * Generate Prisma schema
     */
    genPrismaSchema(schema) {
        let prisma = `// Generated by VIBELYF API Generator

generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
}

`;

        schema.entities.forEach(entity => {
            prisma += `model ${entity.name} {\n`;
            
            entity.fields.forEach(field => {
                const type = this.toPrismaType(field.type);
                const optional = field.required ? '' : '?';
                const unique = field.unique ? ' @unique' : '';
                let def = '';
                
                if (field.name === 'id') def = ' @id @default(uuid())';
                else if (field.name === 'createdAt') def = ' @default(now())';
                else if (field.name === 'updatedAt') def = ' @updatedAt';
                
                prisma += `    ${field.name.padEnd(16)} ${type}${optional}${unique}${def}\n`;
            });

            prisma += `}\n\n`;
        });

        return prisma;
    },

    /**
     * Generate routes file
     */
    genRoutes(entity, schema) {
        const name = entity.name.toLowerCase();
        const ctrl = `${name}Controller`;

        return `const express = require('express');
const router = express.Router();
const ${ctrl} = require('../controllers/${name}.controller');
${schema.auth ? "const { authenticate } = require('../middleware/auth');" : ''}

// GET /${name}s
router.get('/', ${schema.auth ? 'authenticate, ' : ''}${ctrl}.getAll);

// GET /${name}s/:id
router.get('/:id', ${schema.auth ? 'authenticate, ' : ''}${ctrl}.getById);

// POST /${name}s
router.post('/', ${schema.auth ? 'authenticate, ' : ''}${ctrl}.create);

// PUT /${name}s/:id
router.put('/:id', ${schema.auth ? 'authenticate, ' : ''}${ctrl}.update);

// DELETE /${name}s/:id
router.delete('/:id', ${schema.auth ? 'authenticate, ' : ''}${ctrl}.remove);

module.exports = router;
`;
    },

    /**
     * Generate controller file
     */
    genController(entity) {
        const name = entity.name.toLowerCase();
        const Name = entity.name;

        return `const ${name}Service = require('../services/${name}.service');
const { success, error } = require('../utils/response');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await ${name}Service.findAll({ page: +page, limit: +limit });
        return success(res, result);
    } catch (err) {
        return error(res, err.message);
    }
};

exports.getById = async (req, res) => {
    try {
        const result = await ${name}Service.findById(req.params.id);
        if (!result) return error(res, '${Name} not found', 404);
        return success(res, result);
    } catch (err) {
        return error(res, err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const result = await ${name}Service.create(req.body);
        return success(res, result, 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

exports.update = async (req, res) => {
    try {
        const result = await ${name}Service.update(req.params.id, req.body);
        if (!result) return error(res, '${Name} not found', 404);
        return success(res, result);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

exports.remove = async (req, res) => {
    try {
        await ${name}Service.remove(req.params.id);
        return success(res, { message: '${Name} deleted' });
    } catch (err) {
        return error(res, err.message);
    }
};
`;
    },

    /**
     * Generate service file
     */
    genService(entity) {
        const name = entity.name.toLowerCase();
        const Name = entity.name;

        return `const prisma = require('../config/database');

exports.findAll = async ({ page = 1, limit = 20 }) => {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
        prisma.${name}.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.${name}.count()
    ]);

    return {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
};

exports.findById = async (id) => {
    return prisma.${name}.findUnique({ where: { id } });
};

exports.create = async (data) => {
    return prisma.${name}.create({ data });
};

exports.update = async (id, data) => {
    return prisma.${name}.update({ where: { id }, data });
};

exports.remove = async (id) => {
    return prisma.${name}.delete({ where: { id } });
};
`;
    },

    /**
     * Generate auth routes
     */
    genAuthRoutes() {
        return `const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', require('../middleware/auth').authenticate, authController.me);

module.exports = router;
`;
    },

    /**
     * Generate auth controller
     */
    genAuthController() {
        return `const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'vibelyf-secret-change-me';

exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return error(res, 'Email already registered', 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        return success(res, { 
            user: { id: user.id, email: user.email, name: user.name },
            token 
        }, 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return error(res, 'Invalid credentials', 401);

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return error(res, 'Invalid credentials', 401);

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        return success(res, { 
            user: { id: user.id, email: user.email, name: user.name },
            token 
        });
    } catch (err) {
        return error(res, err.message);
    }
};

exports.me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ 
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        return success(res, user);
    } catch (err) {
        return error(res, err.message);
    }
};
`;
    },

    /**
     * Generate auth middleware
     */
    genAuthMiddleware() {
        return `const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vibelyf-secret-change-me';

exports.authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
`;
    },

    /**
     * Generate error handler
     */
    genErrorHandler() {
        return `exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
`;
    },

    /**
     * Generate response utilities
     */
    genResponseUtils() {
        return `exports.success = (res, data, status = 200) => {
    return res.status(status).json({
        success: true,
        data
    });
};

exports.error = (res, message, status = 500) => {
    return res.status(status).json({
        success: false,
        error: message
    });
};
`;
    },

    /**
     * Generate .env.example
     */
    genEnvExample(schema) {
        return `# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

${schema.auth ? '# Auth\nJWT_SECRET=your-super-secret-key-change-in-production' : ''}
`;
    },

    /**
     * Generate .gitignore
     */
    genGitignore() {
        return `node_modules/
.env
*.db
*.db-journal
prisma/migrations/
`;
    },

    /**
     * Generate README
     */
    genReadme(schema) {
        const endpoints = schema.entities.map(e => {
            const name = e.name.toLowerCase();
            return `### ${e.name}s
- \`GET /api/${name}s\` - List all
- \`GET /api/${name}s/:id\` - Get by ID  
- \`POST /api/${name}s\` - Create
- \`PUT /api/${name}s/:id\` - Update
- \`DELETE /api/${name}s/:id\` - Delete`;
        }).join('\n\n');

        return `# ${schema.apiName || 'Generated API'}

${schema.description || 'API generated by VIBELYF'}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Setup database
npx prisma db push

# Start server
npm run dev
\`\`\`

## Endpoints

${schema.auth ? `### Auth
- \`POST /api/auth/register\` - Register user
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/me\` - Get current user

` : ''}${endpoints}

## Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`
PORT=3000
DATABASE_URL="file:./dev.db"
${schema.auth ? 'JWT_SECRET=your-secret-key' : ''}
\`\`\`

---
Generated by **VIBELYF API Generator** 🚀
`;
    },

    /**
     * Build endpoint list for UI
     */
    buildEndpointList(schema) {
        const endpoints = [];

        if (schema.auth) {
            endpoints.push(
                { method: 'POST', path: '/api/auth/register', description: 'Register user' },
                { method: 'POST', path: '/api/auth/login', description: 'Login' },
                { method: 'GET', path: '/api/auth/me', description: 'Get current user' }
            );
        }

        schema.entities.forEach(entity => {
            const path = `/api/${entity.name.toLowerCase()}s`;
            endpoints.push(
                { method: 'GET', path, description: `List ${entity.name}s` },
                { method: 'GET', path: `${path}/:id`, description: `Get ${entity.name} by ID` },
                { method: 'POST', path, description: `Create ${entity.name}` },
                { method: 'PUT', path: `${path}/:id`, description: `Update ${entity.name}` },
                { method: 'DELETE', path: `${path}/:id`, description: `Delete ${entity.name}` }
            );
        });

        return endpoints;
    },

    /**
     * Generate deployment configs
     */
    generateDeployConfig(schema) {
        return {
            railway: {
                name: schema.apiName || 'vibelyf-api',
                build: { builder: 'NIXPACKS' },
                deploy: { startCommand: 'npm start' }
            },
            render: {
                services: [{
                    type: 'web',
                    name: schema.apiName || 'vibelyf-api',
                    env: 'node',
                    buildCommand: 'npm install && npx prisma generate && npx prisma db push',
                    startCommand: 'npm start'
                }]
            },
            dockerfile: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "src/index.js"]`
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // ZIP GENERATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create downloadable ZIP file
     */
    async createZip(files, filename = 'api-generated.zip') {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library required for ZIP generation');
        }

        const zip = new JSZip();

        Object.entries(files).forEach(([path, content]) => {
            zip.file(path, content);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return blob;
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    log(...args) {
        if (this.config.debug) {
            console.log('[ClaudeAPIGenerator]', ...args);
        }
    },

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    cleanEntityName(name) {
        if (!name) return null;
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    },

    isStopWord(word) {
        const stops = ['the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'my', 'your', 'our', 'api', 'app', 'system'];
        return stops.includes(word.toLowerCase());
    },

    singularize(word) {
        if (!word) return word;
        word = word.toLowerCase();
        
        const irregulars = { people: 'person', children: 'child', men: 'man', women: 'woman' };
        if (irregulars[word]) return irregulars[word];
        
        if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
        if (word.endsWith('es') && word.length > 3) return word.slice(0, -2);
        if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
        
        return word;
    },

    pluralize(word) {
        if (!word) return word;
        word = word.toLowerCase();
        
        const irregulars = { person: 'people', child: 'children', man: 'men', woman: 'women' };
        if (irregulars[word]) return irregulars[word];
        
        if (word.endsWith('y') && !['ay', 'ey', 'oy', 'uy'].some(v => word.endsWith(v))) {
            return word.slice(0, -1) + 'ies';
        }
        if (['s', 'x', 'ch', 'sh'].some(e => word.endsWith(e))) {
            return word + 'es';
        }
        
        return word + 's';
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    toKebabCase(str) {
        return str.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
    },

    toPrismaType(type) {
        const map = {
            string: 'String', text: 'String', int: 'Int', integer: 'Int',
            float: 'Float', number: 'Float', boolean: 'Boolean', bool: 'Boolean',
            datetime: 'DateTime', date: 'DateTime', json: 'Json'
        };
        return map[type?.toLowerCase()] || 'String';
    }
};

// ═══════════════════════════════════════════════════════════════
// REQUEST DETECTION HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Detect if a message is an API generation request
 */
function isAPIRequest(message) {
    const patterns = [
        /\b(build|create|make|generate|gimme|give\s*me)\b.*\bapi\b/i,
        /\bapi\b.*\b(for|to)\b/i,
        /\b(need|want)\b.*\b(api|backend|server)\b/i,
        /\b(crud|rest|restful)\b/i
    ];
    
    return patterns.some(p => p.test(message));
}

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClaudeAPIGenerator, isAPIRequest };
}

// Export for browser (window object)
if (typeof window !== 'undefined') {
    window.ClaudeAPIGenerator = ClaudeAPIGenerator;
    window.isAPIRequest = isAPIRequest;
    console.log('✅ ClaudeAPIGenerator exported to window object');
}
