import { useState, useEffect, useRef } from 'react';
import { storyAPI } from '../services/api';

function StoryInterface({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      loadHistory();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await storyAPI.getHistory(sessionId);
      const history = response.data.data;

      const formattedMessages = history.flatMap(turn => [
        { role: 'user', content: turn.player_input, turnNumber: turn.turn_number },
        { role: 'assistant', content: turn.llm_response, turnNumber: turn.turn_number }
      ]);

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await storyAPI.generateTurn(sessionId, input);
      const { response: llmResponse, tokenReport, extractedEvent } = response.data.data;

      const assistantMessage = {
        role: 'assistant',
        content: llmResponse,
        event: extractedEvent
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTokenInfo(tokenReport);
    } catch (error) {
      console.error('Failed to generate story:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to generate response. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Please create or select a session to start playing
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Token Info */}
      {tokenInfo && (
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
          <span>Tokens: {tokenInfo.total}</span>
          <span className="ml-4">Cards: {tokenInfo.breakdown.cards.length}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-lg">Begin your adventure!</p>
            <p className="text-sm mt-2">Type your first action below to start the story.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.role === 'error'
                    ? 'bg-red-900 text-red-200'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="prose prose-invert max-w-none">
                  {message.content}
                </div>
                {message.event && (
                  <div className="text-xs text-gray-400 mt-2 italic">
                    Key event: {message.event}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Generating story...</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="What do you do?"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default StoryInterface;
