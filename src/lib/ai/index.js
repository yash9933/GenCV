import GeminiClient from './gemini';
import GPTClient from './gpt';

/**
 * AI Client Factory
 * Supports both Gemini and GPT providers with conditional initialization
 */
class AIClientFactory {
  constructor() {
    this.clients = {};
    
    // Initialize Gemini client (always available)
    try {
      this.clients.gemini = new GeminiClient();
    } catch (error) {
      console.warn('Failed to initialize Gemini client:', error.message);
    }
    
    // Initialize GPT client only if OpenAI API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        this.clients.gpt = new GPTClient();
      } catch (error) {
        console.warn('Failed to initialize GPT client:', error.message);
      }
    } else {
      console.log('OpenAI API key not found, GPT client not initialized');
    }
  }

  /**
   * Get AI client by provider
   * @param {string} provider - 'gemini' or 'gpt'
   * @returns {Object} - AI client instance
   */
  getClient(provider = 'gemini') {
    const client = this.clients[provider];
    if (!client) {
      throw new Error(`AI provider '${provider}' is not available. Available providers: ${Object.keys(this.clients).join(', ')}`);
    }
    return client;
  }

  /**
   * Get available providers
   * @returns {Array} - List of available provider names
   */
  getAvailableProviders() {
    return Object.keys(this.clients);
  }

  /**
   * Generate resume content using specified provider
   * @param {string} provider - 'gemini' or 'gpt'
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated content
   */
  async generateResumeContent(provider = 'gemini', params) {
    const client = this.getClient(provider);
    return await client.generateResumeContent(params);
  }

  /**
   * Generate bullet points using specified provider
   * @param {string} provider - 'gemini' or 'gpt'
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated bullet points
   */
  async generateBulletPoints(provider = 'gemini', params) {
    const client = this.getClient(provider);
    
    // Check if the client has the generateBulletPoints method
    if (typeof client.generateBulletPoints === 'function') {
      return await client.generateBulletPoints(params);
    } else {
      // Fallback to generateResumeContent for clients that don't have the new method
      return await client.generateResumeContent(params);
    }
  }
}

export default AIClientFactory;

