import express from 'express';
import llmService from '../services/LLMService.js';

const router = express.Router();

/**
 * GET /api/settings/llm
 * Get current LLM configuration
 */
router.get('/llm', (req, res) => {
  try {
    const config = llmService.getConfig();
    const providers = llmService.getProvidersInfo();

    res.json({
      success: true,
      data: {
        ...config,
        availableProviders: providers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/settings/llm
 * Update LLM provider configuration
 */
router.put('/llm', async (req, res) => {
  try {
    const { provider, apiKey, model, baseUrl } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider is required'
      });
    }

    // Build config from provided values
    const config = {};
    if (apiKey !== undefined) config.apiKey = apiKey;
    if (model !== undefined) config.model = model;
    if (baseUrl !== undefined) config.baseUrl = baseUrl;

    // Update and switch to the provider
    await llmService.setProvider(provider, config);
    const currentConfig = llmService.getConfig();

    res.json({
      success: true,
      data: currentConfig
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/settings/llm/test
 * Test connection to a provider
 */
router.post('/llm/test', async (req, res) => {
  try {
    const { provider, apiKey, model, baseUrl } = req.body;

    // If config provided, temporarily update before testing
    if (provider && (apiKey || model || baseUrl)) {
      const config = {};
      if (apiKey) config.apiKey = apiKey;
      if (model) config.model = model;
      if (baseUrl) config.baseUrl = baseUrl;

      await llmService.updateConfig(provider, config);
    }

    const result = await llmService.testConnection(provider);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/settings/llm/models
 * Get available models for a provider
 */
router.get('/llm/models', async (req, res) => {
  try {
    const { provider } = req.query;
    const models = await llmService.getModels(provider);

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/settings/llm/providers
 * Get all available providers info
 */
router.get('/llm/providers', (req, res) => {
  try {
    const providers = llmService.getProvidersInfo();

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
