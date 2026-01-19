import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import useStore from '../store/useStore';

const PROVIDER_ICONS = {
  openai: '🤖',
  claude: '🧠',
  gemini: '✨',
  openrouter: '🔀',
  koboldcpp: '💻'
};

function LLMSettings() {
  const [config, setConfig] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  // Favorites from store
  const {
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    showFavoritesOnly,
    setShowFavoritesOnly
  } = useStore();

  // Load initial config
  useEffect(() => {
    loadConfig();
  }, []);

  // Load models when provider changes
  useEffect(() => {
    if (selectedProvider) {
      loadModels(selectedProvider);
    }
  }, [selectedProvider]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getLLMConfig();
      const data = response.data.data;

      setConfig(data);
      setProviders(data.availableProviders || []);
      setSelectedProvider(data.activeProvider);
      setModel(data.activeModel || '');

      // Get provider-specific config
      const providerConfig = data.providers?.[data.activeProvider];
      if (providerConfig) {
        setBaseUrl(providerConfig.baseUrl || '');
      }
    } catch (err) {
      setError('Failed to load LLM configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (provider) => {
    try {
      const providerInfo = providers.find(p => p.name === provider);
      if (providerInfo?.models) {
        // Use static models from provider info
        const models = Array.isArray(providerInfo.models)
          ? providerInfo.models
          : Object.values(providerInfo.models);
        setAvailableModels(models);
      }

      // Also try to fetch dynamic models
      const response = await settingsAPI.getLLMModels(provider);
      if (response.data.data?.length > 0) {
        setAvailableModels(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const handleProviderChange = (newProvider) => {
    setSelectedProvider(newProvider);
    setTestResult(null);
    setApiKey('');

    // Set default model for provider
    const providerInfo = providers.find(p => p.name === newProvider);
    if (providerInfo) {
      setModel(providerInfo.defaultModel || '');
      setBaseUrl(providerInfo.defaultBaseUrl || '');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const testConfig = {
        provider: selectedProvider,
        model: model
      };

      if (apiKey) testConfig.apiKey = apiKey;
      if (baseUrl) testConfig.baseUrl = baseUrl;

      const response = await settingsAPI.testLLMConnection(testConfig);
      setTestResult(response.data.data);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.error || 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateConfig = {
        provider: selectedProvider,
        model: model
      };

      if (apiKey) updateConfig.apiKey = apiKey;
      if (baseUrl) updateConfig.baseUrl = baseUrl;

      await settingsAPI.updateLLMConfig(updateConfig);
      await loadConfig();

      setTestResult({ success: true, message: 'Settings saved successfully!' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = (modelId) => {
    if (isFavorite(selectedProvider, modelId)) {
      removeFavorite(selectedProvider, modelId);
    } else {
      addFavorite(selectedProvider, modelId);
    }
  };

  const getProviderInfo = (providerName) => {
    return providers.find(p => p.name === providerName) || {};
  };

  // Get models sorted with favorites first
  const getSortedModels = () => {
    const favorites = getFavorites(selectedProvider);
    const favoriteModels = availableModels.filter(m => favorites.includes(m.id));
    const otherModels = availableModels.filter(m => !favorites.includes(m.id));

    if (showFavoritesOnly) {
      return favoriteModels;
    }

    return [...favoriteModels, ...otherModels];
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading LLM settings...
      </div>
    );
  }

  const currentProviderInfo = getProviderInfo(selectedProvider);
  const hasApiKey = config?.providers?.[selectedProvider]?.hasApiKey;
  const sortedModels = getSortedModels();
  const favoriteCount = getFavorites(selectedProvider).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">LLM Connection Settings</h2>
        <p className="text-gray-400 text-sm">
          Configure which AI provider and model to use for story generation.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Current Status */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Active Provider:</span>
            <div className="text-white font-medium">
              {PROVIDER_ICONS[config?.activeProvider]} {getProviderInfo(config?.activeProvider)?.displayName || config?.activeProvider}
            </div>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Active Model:</span>
            <div className="text-white font-medium">{config?.activeModel}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${hasApiKey ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {hasApiKey ? '● Connected' : '○ No API Key'}
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Provider
        </label>
        <div className="grid grid-cols-5 gap-2">
          {providers.map(provider => (
            <button
              key={provider.name}
              onClick={() => handleProviderChange(provider.name)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedProvider === provider.name
                  ? 'border-blue-500 bg-blue-900/30 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">{PROVIDER_ICONS[provider.name]}</div>
              <div className="text-xs">{provider.displayName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      {currentProviderInfo.requiresApiKey && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
            {hasApiKey && <span className="text-green-400 ml-2">(saved)</span>}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasApiKey ? '••••••••••••••••' : 'Enter API key...'}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-gray-500 text-xs mt-1">
            Leave blank to keep existing key. Enter new key to update.
          </p>
        </div>
      )}

      {/* Model Selection with Favorites */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Model
          </label>
          <div className="flex items-center gap-3">
            {favoriteCount > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                Show favorites only ({favoriteCount})
              </label>
            )}
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteCount > 0 && !showFavoritesOnly && (
          <div className="mb-3">
            <div className="text-xs text-yellow-400 mb-2">⭐ Favorites</div>
            <div className="flex flex-wrap gap-2">
              {getFavorites(selectedProvider).map(modelId => {
                const modelInfo = availableModels.find(m => m.id === modelId);
                return (
                  <button
                    key={modelId}
                    onClick={() => setModel(modelId)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                      model === modelId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span>⭐</span>
                    <span>{modelInfo?.name || modelId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Model List */}
        <div className="space-y-1 max-h-48 overflow-y-auto bg-gray-800 rounded-lg p-2">
          {sortedModels.map(m => (
            <div
              key={m.id}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                model === m.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
              onClick={() => setModel(m.id)}
            >
              <div className="flex items-center gap-2">
                {isFavorite(selectedProvider, m.id) && <span className="text-yellow-400">⭐</span>}
                <span>{m.name || m.id}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(m.id);
                }}
                className={`p-1 rounded hover:bg-gray-600 transition-colors ${
                  isFavorite(selectedProvider, m.id) ? 'text-yellow-400' : 'text-gray-500'
                }`}
                title={isFavorite(selectedProvider, m.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(selectedProvider, m.id) ? '★' : '☆'}
              </button>
            </div>
          ))}
        </div>

        {/* Custom Model Input */}
        <div className="mt-2">
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Or enter custom model ID..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Base URL Override */}
      {currentProviderInfo.supportsBaseUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Base URL (Optional)
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={currentProviderInfo.defaultBaseUrl || 'Leave blank for default'}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`px-4 py-3 rounded-lg ${
          testResult.success
            ? 'bg-green-900/50 border border-green-500 text-green-200'
            : 'bg-red-900/50 border border-red-500 text-red-200'
        }`}>
          <div className="font-medium">
            {testResult.success ? '✓ ' : '✗ '}{testResult.message}
          </div>
          {testResult.model && (
            <div className="text-sm mt-1 opacity-75">
              Model: {testResult.model}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default LLMSettings;
