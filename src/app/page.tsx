export default function Home() {
  return (
    <main>
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div style={{ fontSize: '32px' }}>⚡</div>
          <h1 className="header-title">HUD NEWS</h1>
          <div className="header-status">
            <div className="status-dot"></div>
            <span>LIVE FEED ACTIVE</span>
          </div>
        </div>
        
        <div className="header-status" style={{ fontSize: '12px' }}>
          <div className="status-dot"></div>
          <span>AI RANKING</span>
          <div className="status-dot accent"></div>
          <span>SOURCES: 5</span>
          <div className="status-dot blue"></div>
          <span>LAST UPDATE: {new Date().toLocaleTimeString()}</span>
        </div>

        <div className="header-actions">
          <button className="hud-button" title="Bookmarks">🔖</button>
          <button className="hud-button" title="Settings">⚙️</button>
        </div>
      </header>

      {/* News Feed */}
      <div className="news-feed-container">
        <div className="grid-bg"></div>
        <div className="fade-top"></div>
        <div className="fade-bottom"></div>
        
        <div className="news-feed">
          {/* Sample Articles */}
          <article className="article-card">
            <div className="article-score">92%</div>
            <div className="article-meta">
              <span>🌐</span>
              <span className="article-source">HACKERNEWS</span>
              <span>•</span>
              <span>about 2 hours ago</span>
              <span>•</span>
              <span>👤 Dr. Sarah Chen</span>
            </div>
            <h2 className="article-title">
              AI Breakthrough: New Neural Network Architecture Achieves Human-Level Performance
            </h2>
            <p className="article-summary">
              Researchers at leading tech companies have developed a revolutionary neural network that demonstrates human-level performance across multiple cognitive tasks.
            </p>
            <div className="article-footer">
              <div className="article-stats">
                <span>📈 847</span>
                <span>💬 234</span>
              </div>
              <a href="#" style={{ color: 'rgba(0, 255, 65, 0.7)', fontSize: '12px' }}>Read more →</a>
            </div>
            <div className="article-tags">
              <span className="tag">AI</span>
              <span className="tag">Machine Learning</span>
              <span className="tag">Research</span>
            </div>
          </article>

          <article className="article-card">
            <div className="article-score">78%</div>
            <div className="article-meta">
              <span>🔴</span>
              <span className="article-source">REDDIT</span>
              <span>•</span>
              <span>about 4 hours ago</span>
              <span>•</span>
              <span>👤 Mike Rodriguez</span>
            </div>
            <h2 className="article-title">
              Quantum Computing Startup Raises $100M Series B for Commercial Applications
            </h2>
            <p className="article-summary">
              A quantum computing company has secured significant funding to bring quantum solutions to enterprise customers in finance and logistics.
            </p>
            <div className="article-footer">
              <div className="article-stats">
                <span>📈 567</span>
                <span>💬 89</span>
                <span>⬆️ 1240</span>
              </div>
              <a href="#" style={{ color: 'rgba(0, 255, 65, 0.7)', fontSize: '12px' }}>Read more →</a>
            </div>
            <div className="article-tags">
              <span className="tag">Quantum Computing</span>
              <span className="tag">Startup</span>
              <span className="tag">Funding</span>
            </div>
          </article>

          <article className="article-card">
            <div className="article-score">76%</div>
            <div className="article-meta">
              <span>🌐</span>
              <span className="article-source">HACKERNEWS</span>
              <span>•</span>
              <span>about 6 hours ago</span>
              <span>•</span>
              <span>👤 Alex Kumar</span>
            </div>
            <h2 className="article-title">
              New Programming Language Promises 10x Performance Improvements
            </h2>
            <p className="article-summary">
              A systems programming language designed for high-performance computing shows remarkable benchmarks in early testing.
            </p>
            <div className="article-footer">
              <div className="article-stats">
                <span>📈 423</span>
                <span>💬 156</span>
              </div>
              <a href="#" style={{ color: 'rgba(0, 255, 65, 0.7)', fontSize: '12px' }}>Read more →</a>
            </div>
            <div className="article-tags">
              <span className="tag">Programming</span>
              <span className="tag">Performance</span>
              <span className="tag">Systems</span>
            </div>
          </article>

          <article className="article-card">
            <div className="article-score">64%</div>
            <div className="article-meta">
              <span>🤖</span>
              <span className="article-source">TLDR AI</span>
              <span>•</span>
              <span>about 8 hours ago</span>
              <span>•</span>
              <span>👤 Dr. Maria Santos</span>
            </div>
            <h2 className="article-title">
              Climate Tech Innovation: Solar Efficiency Reaches Record 47%
            </h2>
            <p className="article-summary">
              Scientists have achieved a new world record in solar cell efficiency, bringing us closer to cost-effective renewable energy.
            </p>
            <div className="article-footer">
              <div className="article-stats">
                <span>📈 345</span>
                <span>💬 78</span>
              </div>
              <a href="#" style={{ color: 'rgba(0, 255, 65, 0.7)', fontSize: '12px' }}>Read more →</a>
            </div>
            <div className="article-tags">
              <span className="tag">Climate Tech</span>
              <span className="tag">Solar</span>
              <span className="tag">Renewable Energy</span>
            </div>
          </article>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="control-button" title="Slower">⏪</button>
        <button className="control-button active" title="Pause">⏸️</button>
        <button className="control-button" title="Faster">⏩</button>
        <div className="speed-indicator">
          <div className="speed-value">60s</div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>CYCLE</div>
        </div>
        <button className="control-button" title="Reset">🔄</button>
      </div>
    </main>
  )
}
