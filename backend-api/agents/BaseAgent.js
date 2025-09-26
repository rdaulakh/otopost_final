const { Configuration, OpenAIApi } = require("openai");

class BaseAgent {
    constructor(name, role, capabilities = []) {
        this.name = name;
        this.role = role;
        this.capabilities = capabilities;
        this.status = 'idle';
        this.lastActivity = null;
        this.efficiency = 0;
        this.tasksCompleted = 0;
        this.errors = 0;
        
        // Initialize OpenAI
        this.configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai = new OpenAIApi(this.configuration);
    }

    async executeTask(prompt, context = {}) {
        this.status = 'working';
        this.lastActivity = new Date();
        
        try {
            console.log(`[${this.name}] Starting task execution...`);
            
            const enhancedPrompt = this.enhancePrompt(prompt, context);
            const response = await this.callOpenAI(enhancedPrompt);
            
            this.tasksCompleted++;
            this.updateEfficiency();
            this.status = 'idle';
            
            console.log(`[${this.name}] Task completed successfully`);
            return response;
            
        } catch (error) {
            this.errors++;
            this.status = 'error';
            console.error(`[${this.name}] Task execution failed:`, error.message);
            throw new Error(`${this.name} failed: ${error.message}`);
        }
    }

    enhancePrompt(prompt, context) {
        const roleContext = `You are ${this.name}, a specialized AI agent with the role: ${this.role}. 
Your capabilities include: ${this.capabilities.join(', ')}.`;
        
        const contextInfo = Object.keys(context).length > 0 
            ? `\n\nContext: ${JSON.stringify(context, null, 2)}`
            : '';
            
        return `${roleContext}\n\nTask: ${prompt}${contextInfo}`;
    }

    async callOpenAI(prompt) {
        try {
            const response = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1500
            });
            
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error(`[${this.name}] OpenAI API error:`, error.response ? error.response.data : error.message);
            throw new Error("Failed to get response from AI service");
        }
    }

    updateEfficiency() {
        const totalTasks = this.tasksCompleted + this.errors;
        this.efficiency = totalTasks > 0 ? (this.tasksCompleted / totalTasks) * 100 : 0;
    }

    getStatus() {
        return {
            name: this.name,
            role: this.role,
            status: this.status,
            lastActivity: this.lastActivity,
            efficiency: Math.round(this.efficiency),
            tasksCompleted: this.tasksCompleted,
            errors: this.errors,
            capabilities: this.capabilities
        };
    }

    async processStructuredData(prompt, expectedFormat = 'json') {
        try {
            const structuredPrompt = `${prompt}\n\nPlease respond in valid ${expectedFormat.toUpperCase()} format only.`;
            const response = await this.executeTask(structuredPrompt);
            
            if (expectedFormat === 'json') {
                const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanedResponse);
            }
            
            return response;
        } catch (error) {
            console.error(`[${this.name}] Structured data processing failed:`, error);
            throw error;
        }
    }
}

module.exports = BaseAgent;
