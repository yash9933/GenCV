import GeminiClient from './gemini';
// import GPTClient from './gpt'; // Commented out to disable GPT

/**
 * AI Client Factory
 * Allows easy switching between different AI providers
 */
class AIClientFactory {
  constructor() {
    this.clients = {
      gemini: new GeminiClient(),
      // gpt: new GPTClient() // Commented out to disable GPT
    };
  }

  /**
   * Get AI client by provider
   * @param {string} provider - 'gemini' or 'gpt'
   * @returns {Object} - AI client instance
   */
  getClient(provider = 'gemini') {
    const client = this.clients[provider];
    if (!client) {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
    return client;
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
}

export default AIClientFactory;

