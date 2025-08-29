import GeminiClient from './gemini';

/**
 * AI Client Factory
 * Simplified to use only Gemini provider
 */
class AIClientFactory {
  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Get AI client
   * @returns {Object} - AI client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Generate resume content
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated content
   */
  async generateResumeContent(params) {
    return await this.client.generateResumeContent(params);
  }
}

export default AIClientFactory;

