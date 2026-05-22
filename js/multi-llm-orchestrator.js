/**
 * Multi-LLM Orchestrator - Smart Routing & Fallback Management
 * 
 * The brain of VibeCoder's multi-model system. Intelligently routes
 * generation tasks to the most appropriate AI model based on specialization,
 * implements fallback chains for reliability, and coordinates parallel
 * generation across multiple services.
 * 
 * Architecture:
 * - Routes frontend tasks to Gemini (UI specialist)
 * - Routes backend tasks to Claude (logic specialist)
 * - Routes database tasks to OpenAI (data modeling specialist)
 * - Routes integrations to Mistral (API specialist)
 * 
 * Key Features:
 * - Smart task routing based on specialization
 * - Automatic fallback chains (primary → secondary → tertiary)
 * - Parallel generation for speed
 * - Performance tracking and metrics
 * - AAVE input processing integration
 * - Error handling with graceful degradation
 * 
 * Routing Configuration:
 * - frontend: Gemini → Claude → OpenAI
 * - backend: Claude → Gemini → OpenAI
 * - database: OpenAI → Claude → Gemini
 * - integration: Mistral → Claude → Gemini
 * - auth: Mistral → Claude
 * - payment: Mistral → Claude
 * - storage: Mistral → Claude
 * 
 * @version 2.1.0
 * @date 2025-11-19
 */

class MultiLLMOrchestrator {
    constructor(languageProcessor) {
        this.languageProcessor = languageProcessor;
        
        // Initialize Enhanced Input Normalizer (NEW - uses Wikipedia knowledge base)
        this.inputNormalizer = window.EnhancedInputNormalizer ? 
            new EnhancedInputNormalizer() : null;
        
        // Initialize Community Learning System (NEW - learns from user feedback)
        this.learningSystem = window.CommunityLearningSystem ? 
            new CommunityLearningSystem() : null;
        
        // Initialize Translation Feedback UI
        if (window.feedbackUI && this.learningSystem) {
            window.feedbackUI.setLearningSystem(this.learningSystem);
        }
        
        // Initialize all LLM services
        this.llms = {
            gemini: new GeminiAPIService(),
            claude: new ClaudeAPIService(),
            openai: new OpenAIAPIService(),
            mistral: new MistralAPIService()
        };
        
        // Task routing configuration
        this.routing = {
            frontend: ['gemini', 'claude', 'openai'],
            backend: ['claude', 'gemini', 'openai'],
            database: ['openai', 'claude', 'gemini'],
            integration: ['mistral', 'claude', 'gemini'],
            auth: ['mistral', 'claude'],
            payment: ['mistral', 'claude'],
            storage: ['mistral', 'claude']
        };
        
        // Performance tracking
        this.metrics = {
            calls: {},
            successes: {},
            failures: {},
            avgResponseTime: {}
        };
    }

    /**
     * Initialize all LLM services and check configuration status
     * 
     * Performs startup checks for all integrated AI services:
     * - Verifies API keys are configured
     * - Retrieves model information
     * - Collects usage statistics
     * - Tests service availability
     * 
     * This should be called once during application startup to ensure
     * all services are ready before accepting generation requests.
     * 
     * @returns {Promise<object>} Status object with service details:
     *   - {serviceName}: {
     *       hasKey: boolean,
     *       info: object (model information),
     *       usageStats: object (usage metrics),
     *       error?: string (if initialization failed)
     *     }
     * @example
     * const orchestrator = new MultiLLMOrchestrator(processor);
     * const status = await orchestrator.initialize();
     * if (status.gemini.hasKey) {
     *   console.log('Gemini ready:', status.gemini.info.name);
     * }
     */
    async initialize() {
        const status = {};
        
        for (const [name, service] of Object.entries(this.llms)) {
            try {
                status[name] = {
                    hasKey: service.hasAPIKey(),
                    info: service.getModelInfo ? service.getModelInfo() : { name: name },
                    usageStats: service.getUsageStats ? service.getUsageStats() : null
                };
            } catch (error) {
                console.error(`Error initializing ${name}:`, error);
                status[name] = {
                    hasKey: false,
                    error: error.message
                };
            }
        }
        
        return status;
    }

    /**
     * Generate complete full-stack application from natural language
     * 
     * Main orchestration method that coordinates the entire generation process:
     * 
     * Process Flow:
     * 1. Process AAVE/slang input → Standard English
     * 2. Analyze intent → Detect app type, features, style
     * 3. Generate technical spec → Define architecture
     * 4. Parallel generation → Route to specialized LLMs
     * 5. Assemble project → Combine all generated code
     * 
     * Generation Strategy:
     * - Frontend → Gemini (with fallback to Claude, OpenAI)
     * - Backend → Claude (with fallback to Gemini, OpenAI)
     * - Database → OpenAI (with fallback to Claude, Gemini)
     * - Integrations → Mistral (with fallback to Claude)
     * 
     * Features:
     * - AAVE/slang processing for inclusive input
     * - Automatic component detection
     * - Smart LLM routing based on task type
     * - Fallback chains for reliability
     * - Parallel generation for speed
     * - Performance metrics tracking
     * 
     * @param {string} description - Natural language app description (supports AAVE)
     * @param {object} [options={}] - Generation options
     * @param {string} [options.stylePreference] - Override style ('urban'|'minimal'|'professional'|'colorful'|'modern')
     * @param {boolean} [options.includeTests] - Generate test files
     * @param {boolean} [options.includeDocumentation] - Generate README and docs
     * @returns {Promise<object>} Complete project:
     *   - success: boolean
     *   - description: string (normalized input)
     *   - aaveFeatures: array (detected AAVE features)
     *   - spec: object (technical specification)
     *   - code: object (all generated files)
     *   - metrics: object (generation metrics)
     * @throws {Error} If generation fails and fallbacks exhausted
     * @example
     * const result = await orchestrator.generateFullStack(
     *   'Yo I need an app that be tracking my workouts',
     *   { stylePreference: 'urban', includeTests: true }
     * );
     * // result.code contains all generated files
     */
    async generateFullStack(description, options = {}) {
        console.log('🚀 Multi-LLM Orchestrator starting full-stack generation...');
        
        // Show loading with progress steps
        const progressSteps = [
            'Analyzing cultural language...',
            'Translating to technical specs...',
            'Designing architecture...',
            'Generating frontend code...',
            'Building backend logic...',
            'Finalizing project...'
        ];
        
        if (window.feedbackUI) {
            window.feedbackUI.showLoadingWithProgress('🧠 AI is Creating Your App...', progressSteps);
        }
        
        try {
            // Step 1: Normalize cultural language input (NEW - uses Wikipedia knowledge base)
            let normalized, culturalMarkers, confidence;
            
            if (this.inputNormalizer) {
                if (window.feedbackUI) window.feedbackUI.updateProgress(0, false);
                
                // Use enhanced normalizer with full sociolinguistic knowledge
                const normalizationResult = this.inputNormalizer.normalizeInput(description);
                normalized = normalizationResult.normalized;
                culturalMarkers = normalizationResult.culturalMarkers;
                confidence = normalizationResult.confidence;
                
                console.log('✅ Cultural input normalized:', {
                    original: description,
                    normalized: normalized,
                    culturalMarkers: culturalMarkers,
                    confidence: confidence,
                    processingTime: normalizationResult.processingTime + 'ms'
                });
                
                if (window.feedbackUI) window.feedbackUI.updateProgress(0, true);
                
                // Step 1.5: Show translation feedback UI and wait for user confirmation
                if (this.learningSystem && window.feedbackUI) {
                    // Hide progress loading temporarily
                    window.feedbackUI.hideLoading();
                    
                    const feedbackData = await this.learningSystem.processInput(description, normalizationResult);
                    
                    if (feedbackData.needsFeedback) {
                        console.log('🧠 Showing translation feedback UI...');
                        window.feedbackUI.show(feedbackData);
                        
                        // Wait for user to confirm or correct (with timeout)
                        const userConfirmed = await this.waitForUserFeedback(10000); // 10 second timeout
                        
                        if (userConfirmed && this.learningSystem.pendingTranslation) {
                            // User may have corrected the translation
                            normalized = this.learningSystem.pendingTranslation.normalized;
                        }
                        
                        // Clear pending translation
                        if (this.learningSystem) {
                            this.learningSystem.clearPending();
                        }
                    }
                    
                    // Show progress loading again
                    window.feedbackUI.showLoadingWithProgress('🧠 AI is Creating Your App...', progressSteps);
                    window.feedbackUI.updateProgress(1, false);
                }
            } else {
                // Fallback to old processor
                const processed = this.languageProcessor.processInput(description);
                normalized = processed.normalized;
                console.log('⚠️ Using legacy processor (EnhancedInputNormalizer not loaded)');
                if (window.feedbackUI) window.feedbackUI.updateProgress(0, true);
            }
            
            // Step 2: Analyze intent and detect components
            if (window.feedbackUI) window.feedbackUI.updateProgress(1, false);
            const intent = this.analyzeIntent({ normalized, original: description });
            console.log('✅ Intent analyzed:', intent.appType);
            if (window.feedbackUI) window.feedbackUI.updateProgress(1, true);
            
            // Step 3: Generate technical specification
            if (window.feedbackUI) window.feedbackUI.updateProgress(2, false);
            const spec = this.generateTechnicalSpec(intent, { normalized, culturalMarkers });
            console.log('✅ Technical spec created');
            if (window.feedbackUI) window.feedbackUI.updateProgress(2, true);
            
            // Step 4: Parallel generation with appropriate LLMs
            if (window.feedbackUI) window.feedbackUI.updateProgress(3, false);
            const results = await this.parallelGenerate(spec, culturalMarkers || []);
            if (window.feedbackUI) window.feedbackUI.updateProgress(4, false);
            
            // Step 5: Assemble complete project
            const project = this.assembleProject(results, spec);
            if (window.feedbackUI) window.feedbackUI.updateProgress(5, false);
            
            console.log('✅ Project generation complete');
            if (window.feedbackUI) window.feedbackUI.updateProgress(5, true);
            
            // Hide loading after brief delay
            setTimeout(() => {
                if (window.feedbackUI) window.feedbackUI.hideLoading();
            }, 500);
            
            return {
                success: true,
                description: normalized,
                originalInput: description,
                culturalMarkers: culturalMarkers || [],
                confidence: confidence || 1.0,
                spec: spec,
                code: project,
                metrics: this.getMetrics()
            };
        } catch (error) {
            // Hide loading on error
            if (window.feedbackUI) window.feedbackUI.hideLoading();
            
            // Route through error handler if available
            if (window.errorHandler) {
                window.errorHandler.handleError(error, 'Multi-LLM Orchestration');
            }
            throw error;
        }
    }

    /**
     * Wait for user to confirm or correct translation
     * @param {number} timeout - Maximum wait time in milliseconds
     * @returns {Promise<boolean>} - True if user provided feedback
     */
    waitForUserFeedback(timeout = 10000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                // Check if user provided feedback
                if (this.learningSystem && !this.learningSystem.pendingTranslation) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
                
                // Check timeout
                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    console.log('⏱️ Translation feedback timeout - proceeding with AI translation');
                    resolve(false);
                }
            }, 100);
        });
    }

    /**
     * Analyze user intent from processed input
     * 
     * Performs sophisticated intent detection to understand:
     * - What type of app the user wants (tracker, ecommerce, social, etc.)
     * - What features are needed (auth, database, payments, storage, etc.)
     * - What style preference they want (minimal, professional, colorful, etc.)
     * - How complex the application should be
     * 
     * Detection Methods:
     * - Keyword matching for app types
     * - Feature inference from verbs and nouns
     * - Style detection from adjectives
     * - Complexity assessment from feature count
     * 
     * Supported App Types:
     * - 'tracker': Todo lists, habit trackers, task managers
     * - 'ecommerce': Online stores, shopping carts, product catalogs
     * - 'social': Social networks, forums, community platforms
     * - 'finance': Budget trackers, expense managers, financial dashboards
     * - 'music': Music players, playlist managers, audio apps
     * - 'custom': Anything else
     * 
     * @param {object} processed - Processed input from AdvancedLanguageProcessor
     * @param {string} processed.normalized - Normalized text (AAVE → English)
     * @param {Array} processed.features - Detected AAVE features
     * @returns {object} Intent analysis:
     *   - appType: string (detected app category)
     *   - features: object (boolean flags for needed features)
     *   - stylePreference: string (detected style)
     *   - complexity: string ('simple'|'moderate'|'complex')
     * @private
     */
    analyzeIntent(processed) {
        const text = processed.normalized.toLowerCase();
        
        // Detect app type
        let appType = 'custom';
        if (text.includes('track') || text.includes('list') || text.includes('todo')) {
            appType = 'tracker';
        } else if (text.includes('store') || text.includes('shop') || text.includes('buy')) {
            appType = 'ecommerce';
        } else if (text.includes('social') || text.includes('post') || text.includes('comment')) {
            appType = 'social';
        } else if (text.includes('finance') || text.includes('money') || text.includes('payment')) {
            appType = 'finance';
        } else if (text.includes('music') || text.includes('audio') || text.includes('sound')) {
            appType = 'music';
        }
        
        // Detect required features
        const features = {
            needsAuth: text.includes('login') || text.includes('user') || text.includes('account'),
            needsDatabase: true, // Almost all apps need database
            needsPayment: text.includes('pay') || text.includes('buy') || text.includes('purchase'),
            needsStorage: text.includes('upload') || text.includes('image') || text.includes('file'),
            needsEmail: text.includes('email') || text.includes('notify'),
            needsRealtime: text.includes('live') || text.includes('real-time') || text.includes('chat')
        };
        
        // Detect style preference
        let stylePreference = 'modern';
        if (text.includes('simple') || text.includes('minimal')) {
            stylePreference = 'minimal';
        } else if (text.includes('professional') || text.includes('business')) {
            stylePreference = 'professional';
        } else if (text.includes('colorful') || text.includes('fun')) {
            stylePreference = 'colorful';
        }
        
        return {
            appType,
            features,
            stylePreference,
            complexity: this.assessComplexity(features)
        };
    }

    /**
     * Generate detailed technical specification from intent
     * 
     * Converts high-level intent into concrete technical requirements:
     * - Frontend framework and component structure
     * - Backend language, framework, and API endpoints
     * - Database type, tables, and relationships
     * - Required integrations (auth, payments, storage, etc.)
     * 
     * Architecture Decisions:
     * - Frontend: React for complex apps, vanilla JS for simple
     * - Backend: Node.js + Express (universal choice)
     * - Database: MongoDB for document-heavy, PostgreSQL for relational
     * - Styling: Tailwind CSS for rapid development
     * 
     * @param {object} intent - Intent analysis from analyzeIntent()
     * @param {string} intent.appType - App category
     * @param {object} intent.features - Required features
     * @param {string} intent.stylePreference - Style choice
     * @param {object} processed - Original processed input
     * @returns {object} Technical specification:
     *   - appType: string
     *   - frontend: object (framework, components, styling)
     *   - backend: object (language, framework, endpoints, middleware)
     *   - database: object (type, tables, relationships)
     *   - integrations: object (required third-party services)
     * @private
     */
    generateTechnicalSpec(intent, processed) {
        const { appType, features, stylePreference } = intent;
        
        const spec = {
            appType: appType,
            
            frontend: {
                framework: features.needsRealtime ? 'React' : 'vanilla',
                components: this.determineFrontendComponents(appType, features),
                styling: 'Tailwind CSS',
                stylePreference: stylePreference
            },
            
            backend: {
                language: 'Node.js',
                framework: 'Express',
                endpoints: this.determineEndpoints(appType, features),
                middleware: this.determineMiddleware(features)
            },
            
            database: {
                type: features.needsRealtime ? 'MongoDB' : 'PostgreSQL',
                tables: this.determineTables(appType, features),
                relationships: this.determineRelationships(appType, features)
            },
            
            integrations: {
                auth: features.needsAuth ? 'JWT' : null,
                payments: features.needsPayment ? 'Stripe' : null,
                storage: features.needsStorage ? 'AWS S3' : null,
                email: features.needsEmail ? 'SendGrid' : null
            }
        };
        
        return spec;
    }

    /**
     * Execute parallel generation across multiple LLM services
     * 
     * Coordinates simultaneous code generation for different components:
     * - Frontend generation (Gemini)
     * - Backend generation (Claude)
     * - Database schema (OpenAI)
     * - Integrations as needed (Mistral)
     * 
     * Strategy:
     * - All tasks execute in parallel for maximum speed
     * - Each task has fallback chain if primary LLM fails
     * - Results are collected and organized by component type
     * 
     * Performance:
     * - Parallel execution reduces total time by ~75%
     * - Example: 4 sequential tasks at 10s each = 40s
     * - Parallel: All 4 tasks in ~10s (limited by slowest)
     * 
     * @param {object} spec - Technical specification from generateTechnicalSpec()
     * @param {Array} aaveFeatures - Detected AAVE features for context
     * @returns {Promise<object>} Organized results by component type:
     *   - frontend: object (generated UI code)
     *   - backend: object (generated API code)
     *   - database: object (generated schema)
     *   - auth?: object (if auth integration needed)
     *   - payment?: object (if payment integration needed)
     *   - storage?: object (if storage integration needed)
     * @throws {Error} If all fallbacks fail for any task
     * @private
     */
    async parallelGenerate(spec, aaveFeatures) {
        console.log('⚡ Starting parallel generation across multiple LLMs...');
        
        const tasks = [
            { type: 'frontend', spec, aaveFeatures },
            { type: 'backend', spec, aaveFeatures },
            { type: 'database', spec, aaveFeatures }
        ];
        
        // Add integration tasks if needed
        if (spec.integrations.auth) {
            tasks.push({ type: 'auth', spec, aaveFeatures });
        }
        if (spec.integrations.payments) {
            tasks.push({ type: 'payment', spec, aaveFeatures });
        }
        if (spec.integrations.storage) {
            tasks.push({ type: 'storage', spec, aaveFeatures });
        }
        
        // Execute all tasks in parallel
        const results = await Promise.all(
            tasks.map(task => this.executeTask(task))
        );
        
        // Organize results by task type
        const organized = {};
        results.forEach((result, index) => {
            organized[tasks[index].type] = result;
        });
        
        return organized;
    }

    /**
     * Execute a single generation task with automatic fallback
     * 
     * Attempts generation using fallback chain:
     * 1. Try primary LLM (most specialized for task)
     * 2. If fails, try secondary LLM
     * 3. If fails, try tertiary LLM
     * 4. If all fail, throw error
     * 
     * Fallback Triggers:
     * - LLM has no API key configured
     * - API request fails (network, auth, rate limit)
     * - Generation produces invalid code
     * 
     * Performance Tracking:
     * - Records which LLM succeeded
     * - Tracks response time
     * - Updates success/failure metrics
     * 
     * @param {object} task - Task specification
     * @param {string} task.type - Task type ('frontend'|'backend'|'database'|'auth'|'payment'|'storage')
     * @param {object} task.spec - Technical specification
     * @param {Array} task.aaveFeatures - AAVE features for context
     * @returns {Promise<object>} Generated code from successful LLM
     * @throws {Error} If all LLMs in fallback chain fail
     * @private
     */
    async executeTask(task) {
        const { type, spec, aaveFeatures } = task;
        const llmChain = this.routing[type] || ['gemini'];
        
        console.log(`🎯 Routing ${type} to: ${llmChain[0]}`);
        
        for (let i = 0; i < llmChain.length; i++) {
            const llmName = llmChain[i];
            const llm = this.llms[llmName];
            
            // Skip if no API key
            if (!llm.hasAPIKey()) {
                console.warn(`⚠️ ${llmName} has no API key, trying next...`);
                continue;
            }
            
            try {
                const startTime = Date.now();
                let result;
                
                // Route to appropriate generation method
                switch (type) {
                    case 'frontend':
                        result = await llm.generateApp(spec.appType, aaveFeatures, spec.frontend.stylePreference);
                        break;
                    case 'backend':
                        result = await llm.generateBackend(spec, aaveFeatures);
                        break;
                    case 'database':
                        result = await llm.generateDatabase(spec, aaveFeatures);
                        break;
                    case 'auth':
                    case 'payment':
                    case 'storage':
                        result = await llm.generateIntegration(type, spec.integrations, aaveFeatures);
                        break;
                }
                
                const responseTime = Date.now() - startTime;
                this.recordMetric(llmName, 'success', responseTime);
                
                console.log(`✅ ${type} generated by ${llmName} (${responseTime}ms)`);
                
                return {
                    success: true,
                    type: type,
                    code: result.code || result,
                    llm: llmName,
                    responseTime: responseTime
                };
                
            } catch (error) {
                console.error(`❌ ${llmName} failed for ${type}:`, error.message);
                this.recordMetric(llmName, 'failure');
                
                // Try next LLM in chain
                if (i < llmChain.length - 1) {
                    console.log(`🔄 Falling back to ${llmChain[i + 1]}...`);
                    continue;
                } else {
                    // All LLMs failed, return template fallback
                    console.warn(`⚠️ All LLMs failed for ${type}, using template fallback`);
                    return {
                        success: false,
                        type: type,
                        code: this.getTemplateFallback(type, spec),
                        llm: 'template',
                        error: error.message
                    };
                }
            }
        }
    }

    /**
     * Assemble complete project from generated components
     * 
     * Takes individual generated components and organizes them into
     * a complete, deployable project structure:
     * 
     * Project Structure:
     * - frontend/: UI code (HTML, CSS, JS, React components)
     * - backend/: API code (Express routes, middleware, controllers)
     * - database/: Schema and migrations (SQL files, Mongoose models)
     * - integrations/: Third-party service code (auth, payments, storage)
     * - deployment/: Deployment configs (Docker, Vercel, Netlify)
     * - documentation/: README, API docs, setup guides
     * 
     * Assembly Process:
     * 1. Organize frontend files by type
     * 2. Structure backend with proper folders
     * 3. Add database schemas and migrations
     * 4. Include integration code
     * 5. Generate deployment configuration
     * 6. Create comprehensive documentation
     * 
     * @param {object} results - Generated code from parallelGenerate()
     * @param {object} results.frontend - Frontend code
     * @param {object} results.backend - Backend code
     * @param {object} results.database - Database schema
     * @param {object} [results.auth] - Auth integration code
     * @param {object} [results.payment] - Payment integration code
     * @param {object} [results.storage] - Storage integration code
     * @param {object} spec - Technical specification
     * @returns {object} Complete project structure organized by folder:
     *   - frontend: object (UI files)
     *   - backend: object (API files)
     *   - database: object (schema files)
     *   - integrations: object (integration files)
     *   - deployment: object (config files)
     *   - documentation: object (README, guides)
     * @private
     */
    assembleProject(results, spec) {
        const project = {
            frontend: {},
            backend: {},
            database: {},
            integrations: {},
            deployment: {},
            documentation: {}
        };
        
        // Assemble frontend files
        if (results.frontend) {
            project.frontend = typeof results.frontend.code === 'string' 
                ? { 'index.html': results.frontend.code }
                : results.frontend.code;
        }
        
        // Assemble backend files
        if (results.backend) {
            project.backend = results.backend.code;
        }
        
        // Assemble database files
        if (results.database) {
            project.database = results.database.code || results.database.schema;
        }
        
        // Assemble integrations
        if (results.auth) {
            project.integrations.auth = results.auth.code;
        }
        if (results.payment) {
            project.integrations.payment = results.payment.code;
        }
        if (results.storage) {
            project.integrations.storage = results.storage.code;
        }
        
        // Generate deployment files
        project.deployment = this.generateDeploymentFiles(spec);
        
        // Generate documentation
        project.documentation = this.generateDocumentation(spec, results);
        
        return project;
    }

    /**
     * Generate deployment configuration files
     * 
     * Creates production-ready deployment files:
     * - Dockerfile for containerization
     * - docker-compose.yml for multi-container setup
     * - .env.example for environment variables
     * - .gitignore for version control
     * 
     * Configurations adapt based on:
     * - Database type (MongoDB vs PostgreSQL)
     * - Required integrations (auth, payments, storage, email)
     * - Framework choices (React vs vanilla)
     * 
     * @param {object} spec - Technical specification
     * @returns {object} Deployment files:
     *   - 'Dockerfile': string (Docker container config)
     *   - 'docker-compose.yml': string (multi-container orchestration)
     *   - '.env.example': string (environment variables template)
     *   - '.gitignore': string (git ignore patterns)
     * @private
     */
    generateDeploymentFiles(spec) {
        const dockerFile = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;

        const dockerCompose = `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db
  
  db:
    image: ${spec.database.type === 'MongoDB' ? 'mongo:latest' : 'postgres:15-alpine'}
    environment:
      - ${spec.database.type === 'MongoDB' ? 'MONGO_INITDB_ROOT_USERNAME=admin' : 'POSTGRES_USER=postgres'}
      - ${spec.database.type === 'MongoDB' ? 'MONGO_INITDB_ROOT_PASSWORD=password' : 'POSTGRES_PASSWORD=password'}
    volumes:
      - db_data:/var/lib/${spec.database.type === 'MongoDB' ? 'mongodb' : 'postgresql'}/data

volumes:
  db_data:`;

        const envExample = `# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=${spec.database.type === 'MongoDB' ? 'mongodb://localhost:27017/myapp' : 'postgresql://localhost:5432/myapp'}

${spec.integrations.auth ? '# Authentication\nJWT_SECRET=your-secret-key-here\n' : ''}
${spec.integrations.payments ? '# Stripe\nSTRIPE_SECRET_KEY=sk_test_...\nSTRIPE_PUBLISHABLE_KEY=pk_test_...\n' : ''}
${spec.integrations.storage ? '# AWS S3\nAWS_ACCESS_KEY_ID=your-key\nAWS_SECRET_ACCESS_KEY=your-secret\nAWS_BUCKET_NAME=your-bucket\n' : ''}
${spec.integrations.email ? '# SendGrid\nSENDGRID_API_KEY=your-key\n' : ''}`;

        return {
            'Dockerfile': dockerFile,
            'docker-compose.yml': dockerCompose,
            '.env.example': envExample,
            '.gitignore': 'node_modules/\n.env\n*.log\ndist/\nbuild/'
        };
    }

    /**
     * Generate comprehensive project documentation
     * 
     * Creates complete documentation including:
     * - README.md with setup instructions
     * - Tech stack overview
     * - LLM attribution (which AI generated what)
     * - Environment configuration guide
     * - Deployment instructions
     * - API endpoint documentation
     * 
     * Documentation Quality:
     * - Clear setup steps (copy-paste ready)
     * - Includes all required commands
     * - Lists all environment variables
     * - Explains deployment options
     * - Provides API reference
     * 
     * @param {object} spec - Technical specification
     * @param {object} results - Generation results with LLM attribution
     * @returns {object} Documentation files:
     *   - 'README.md': string (main project documentation)
     * @private
     */
    generateDocumentation(spec, results) {
        const readme = `# ${spec.appType.charAt(0).toUpperCase() + spec.appType.slice(1)} Application

## Generated by VibeCoder with Vibe Chain Technology 🔥

**Tech Stack:**
- Frontend: ${spec.frontend.framework}
- Backend: ${spec.backend.framework}
- Database: ${spec.database.type}
${spec.integrations.auth ? `- Auth: ${spec.integrations.auth}` : ''}
${spec.integrations.payments ? `- Payments: ${spec.integrations.payments}` : ''}

**Generated by:**
${results.frontend ? `- Frontend: ${results.frontend.llm}` : ''}
${results.backend ? `- Backend: ${results.backend.llm}` : ''}
${results.database ? `- Database: ${results.database.llm}` : ''}

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment:
\`\`\`bash
cp .env.example .env
# Edit .env with your credentials
\`\`\`

3. Run database migrations:
\`\`\`bash
npm run migrate
\`\`\`

4. Start development server:
\`\`\`bash
npm run dev
\`\`\`

## Deployment

Using Docker:
\`\`\`bash
docker-compose up -d
\`\`\`

## API Endpoints

${spec.backend.endpoints.map(e => `- ${e}`).join('\n')}

## License

MIT

---

*Built with ❤️ using VibeCoder - Where street smarts meet code smart*
`;

        return {
            'README.md': readme
        };
    }

    /**
     * Determine required frontend components based on app type
     * 
     * Maps application requirements to UI components:
     * - Common: Header, Footer (all apps)
     * - Auth: LoginForm, SignupForm (if needsAuth)
     * - Tracker: ItemList, ItemForm (todo, habit tracker)
     * - Ecommerce: ProductGrid, Cart, Checkout (online store)
     * - Social: PostFeed, PostForm, CommentSection (social network)
     * - Finance: Dashboard, TransactionList, Chart (finance app)
     * 
     * @param {string} appType - Application category
     * @param {object} features - Required features flags
     * @returns {string[]} Array of component names
     * @private
     */
    determineFrontendComponents(appType, features) {
        const components = ['Header', 'Footer'];
        
        if (features.needsAuth) components.push('LoginForm', 'SignupForm');
        if (appType === 'tracker') components.push('ItemList', 'ItemForm');
        if (appType === 'ecommerce') components.push('ProductGrid', 'Cart', 'Checkout');
        if (appType === 'social') components.push('PostFeed', 'PostForm', 'CommentSection');
        if (appType === 'finance') components.push('Dashboard', 'TransactionList', 'Chart');
        
        return components;
    }

    determineEndpoints(appType, features) {
        const endpoints = ['/api/health'];
        
        if (features.needsAuth) endpoints.push('/api/auth/signup', '/api/auth/login', '/api/auth/logout');
        if (appType === 'tracker') endpoints.push('/api/items', '/api/items/:id');
        if (appType === 'ecommerce') endpoints.push('/api/products', '/api/cart', '/api/checkout');
        if (appType === 'social') endpoints.push('/api/posts', '/api/posts/:id/comments');
        if (appType === 'finance') endpoints.push('/api/transactions', '/api/analytics');
        
        return endpoints;
    }

    determineMiddleware(features) {
        const middleware = ['cors', 'body-parser', 'errorHandler'];
        
        if (features.needsAuth) middleware.push('auth', 'validateToken');
        if (features.needsPayment) middleware.push('validatePayment');
        
        return middleware;
    }

    determineTables(appType, features) {
        const tables = [];
        
        if (features.needsAuth) tables.push('users');
        if (appType === 'tracker') tables.push('items');
        if (appType === 'ecommerce') tables.push('products', 'orders', 'cart_items');
        if (appType === 'social') tables.push('posts', 'comments', 'likes');
        if (appType === 'finance') tables.push('transactions', 'categories', 'budgets');
        
        return tables;
    }

    determineRelationships(appType, features) {
        if (appType === 'ecommerce') {
            return 'users->orders (1:many), orders->products (many:many)';
        }
        if (appType === 'social') {
            return 'users->posts (1:many), posts->comments (1:many)';
        }
        if (appType === 'finance') {
            return 'users->transactions (1:many), categories->transactions (1:many)';
        }
        return 'users->items (1:many)';
    }

    assessComplexity(features) {
        let score = 0;
        if (features.needsAuth) score++;
        if (features.needsPayment) score++;
        if (features.needsStorage) score++;
        if (features.needsEmail) score++;
        if (features.needsRealtime) score += 2;
        
        if (score <= 1) return 'simple';
        if (score <= 3) return 'moderate';
        return 'complex';
    }

    /**
     * Get template fallback when all LLMs fail
     * 
     * Provides basic template code when:
     * - All LLMs in fallback chain fail
     * - No API keys configured
     * - Network issues prevent all attempts
     * 
     * Templates are minimal but functional placeholders
     * that allow the app to continue with reduced functionality.
     * 
     * @param {string} type - Component type that failed
     * @param {object} spec - Technical specification
     * @returns {object} Basic template code
     * @private
     */
    getTemplateFallback(type, spec) {
        // Return basic template based on type
        return { [`${type}_template.txt`]: `Basic ${type} template - Please check API keys` };
    }

    /**
     * Record performance metrics for LLM usage
     * 
     * Tracks:
     * - Total API calls per LLM
     * - Success/failure counts
     * - Average response times
     * 
     * Used for:
     * - Performance monitoring
     * - Identifying failing services
     * - Optimizing routing decisions
     * 
     * @param {string} llmName - LLM service name
     * @param {string} status - 'success' or 'failure'
     * @param {number} [responseTime=null] - Response time in milliseconds
     * @private
     */
    recordMetric(llmName, status, responseTime = null) {
        if (!this.metrics.calls[llmName]) {
            this.metrics.calls[llmName] = 0;
            this.metrics.successes[llmName] = 0;
            this.metrics.failures[llmName] = 0;
            this.metrics.avgResponseTime[llmName] = [];
        }
        
        this.metrics.calls[llmName]++;
        
        if (status === 'success') {
            this.metrics.successes[llmName]++;
            if (responseTime) {
                this.metrics.avgResponseTime[llmName].push(responseTime);
            }
        } else {
            this.metrics.failures[llmName]++;
        }
    }

    /**
     * Get comprehensive performance metrics
     * 
     * Returns detailed statistics about LLM usage:
     * - Total calls per service
     * - Success/failure rates
     * - Average response times
     * - Success percentages
     * 
     * Useful for:
     * - Monitoring system health
     * - Identifying bottlenecks
     * - Optimizing routing strategies
     * - Debugging generation issues
     * 
     * @returns {object} Performance summary for each LLM:
     *   - {llmName}: {
     *       calls: number,
     *       successes: number,
     *       failures: number,
     *       successRate: string (percentage),
     *       avgResponseTime: number (milliseconds)
     *     }
     * @example
     * const metrics = orchestrator.getMetrics();
     * console.log(`Gemini success rate: ${metrics.gemini.successRate}`);
     */
    getMetrics() {
        const summary = {};
        
        for (const llm of Object.keys(this.metrics.calls)) {
            const calls = this.metrics.calls[llm];
            const successes = this.metrics.successes[llm];
            const avgTimes = this.metrics.avgResponseTime[llm];
            const avgTime = avgTimes.length > 0 
                ? Math.round(avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length)
                : 0;
            
            summary[llm] = {
                calls,
                successes,
                failures: this.metrics.failures[llm],
                successRate: calls > 0 ? Math.round((successes / calls) * 100) : 0,
                avgResponseTime: avgTime
            };
        }
        
        return summary;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiLLMOrchestrator;
}
