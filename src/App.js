import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadApiKey();
    
    // Listen for clear conversation shortcut
    if (window.electron) {
      window.electron.onClearConversation(() => {
        setMessages([]);
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadApiKey = async () => {
    if (window.electron) {
      const key = await window.electron.getApiKey();
      setApiKey(key);
      setTempApiKey(key);
    }
  };

  const saveApiKey = async () => {
    if (window.electron) {
      await window.electron.setApiKey(tempApiKey);
      setApiKey(tempApiKey);
      setShowSettings(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'sonar-chat',
          max_tokens: 2048,
          messages: newMessages
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setMessages([...newMessages, assistantMessage]);
      } else if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key in settings.`
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const minimizeWindow = () => {
    if (window.electron) {
      window.electron.minimizeWindow();
    }
  };

  const closeWindow = () => {
    if (window.electron) {
      window.electron.closeWindow();
    }
  };

  return (
    <div className="app">
      <div className="titlebar">
        <div className="titlebar-drag">
          <span className="app-title">🦜 Interview Assistant</span>
        </div>
        <div className="titlebar-controls">
          <button onClick={() => setShowSettings(!showSettings)} title="Settings">⚙️</button>
          <button onClick={clearConversation} title="Clear (Ctrl+Shift+Q)">🗑️</button>
          <button onClick={minimizeWindow} title="Minimize">−</button>
          <button onClick={closeWindow} title="Hide (Ctrl+Shift+H)">×</button>
        </div>
      </div>

      {showSettings ? (
        <div className="settings">
          <h3>Settings</h3>
          <label>
            Anthropic API Key:
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="sk-ant-..."
            />
          </label>
          <div className="settings-buttons">
            <button onClick={saveApiKey}>Save</button>
            <button onClick={() => setShowSettings(false)}>Cancel</button>
          </div>
          <div className="shortcuts">
            <h4>Keyboard Shortcuts:</h4>
            <p><kbd>Ctrl+Shift+H</kbd> - Toggle visibility</p>
            <p><kbd>Ctrl+Shift+Q</kbd> - Clear conversation</p>
          </div>
        </div>
      ) : (
        <>
          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome">
                <h2>👋 Welcome!</h2>
                <p>Your AI assistant powered by Perplexity AI (Sonar Chat model) is ready to help during interviews and meetings.</p>
                <p className="hint">💡 This window is hidden from screen sharing</p>
                {!apiKey && (
                  <p className="warning">⚠️ Please add your API key in settings</p>
                )}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content loading">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
              disabled={!apiKey || isLoading}
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || !apiKey || isLoading}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;