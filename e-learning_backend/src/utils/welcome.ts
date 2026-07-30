export const welcome = () => {
  const date = new Date(Date.now());
  const hours = date.getHours();
  let greeting = '';

  // Time-based greeting
  if (hours < 12) {
    greeting = 'Good Morning';
  } else if (hours < 18) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Learning API Server</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 900px;
      width: 100%;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .logo {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -1px;
    }

    .tagline {
      font-size: 18px;
      opacity: 0.9;
      font-weight: 300;
    }

    .greeting {
      margin-top: 20px;
      font-size: 16px;
      opacity: 0.8;
    }

    .content {
      padding: 40px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 30px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }

    .section-icon {
      margin-right: 10px;
      font-size: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .info-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .info-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }

    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .endpoints-list {
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e5e7eb;
    }

    .endpoint-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .endpoint-item:last-child {
      border-bottom: none;
    }

    .endpoint-method {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 15px;
      min-width: 60px;
      text-align: center;
    }

    .endpoint-path {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      color: #374151;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .feature-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 32px;
      margin-bottom: 15px;
    }

    .feature-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .feature-desc {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }

    .footer {
      background: #f9fafb;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .footer-text {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .footer-link {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .footer-link:hover {
      color: #764ba2;
    }

    .version-badge {
      display: inline-block;
      background: #e5e7eb;
      color: #374151;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      .header {
        padding: 30px 20px;
      }

      .logo {
        font-size: 36px;
      }

      .content {
        padding: 30px 20px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">E-Learning</div>
      <div class="tagline">E-Learning Backend API Server</div>
      <div class="greeting">${greeting}! 👋</div>
    </div>

    <div class="content">
      <div class="status-badge">
        <span class="status-dot"></span>
        Server is Running
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-icon">📊</span>
          Server Information
        </div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Version</div>
            <div class="info-value">1.0.0</div>
          </div>
          <div class="info-card">
            <div class="info-label">Environment</div>
            <div class="info-value">Development</div>
          </div>
          <div class="info-card">
            <div class="info-label">Current Time</div>
            <div class="info-value">${date.toLocaleTimeString()}</div>
          </div>
          <div class="info-card">
            <div class="info-label">API Base</div>
            <div class="info-value">/api/v1</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-icon">🚀</span>
          Key Features
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔐</div>
            <div class="feature-title">Authentication</div>
            <div class="feature-desc">Secure JWT-based authentication with refresh tokens and OAuth support</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <div class="feature-title">Payment Integration</div>
            <div class="feature-desc">Multiple payment gateways including Stripe, SSLCommerz, and more</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <div class="feature-title">Course Management</div>
            <div class="feature-desc">Complete e-learning platform with courses, modules, and assessments</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="section-icon">🔗</span>
          Available Endpoints
        </div>
        <div class="endpoints-list">
          <div class="endpoint-item">
            <span class="endpoint-method">POST</span>
            <span class="endpoint-path">/api/v1/auth/login</span>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-method">POST</span>
            <span class="endpoint-path">/api/v1/auth/register</span>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-method">GET</span>
            <span class="endpoint-path">/api/v1/users</span>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-method">GET</span>
            <span class="endpoint-path">/api/v1/journey</span>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-method">GET</span>
            <span class="endpoint-path">/api/v1/admin-capsules</span>
          </div>

          <div class="endpoint-item">
            <span class="endpoint-method">POST</span>
            <span class="endpoint-path">/api/v1/payments</span>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-method">GET</span>
            <span class="endpoint-path">/api/v1/notifications</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        E-Learning Platform API
      </div>
      <div class="footer-links">
        <a href="/test" class="footer-link">Test Endpoint</a>
        <a href="/test/en" class="footer-link">Test (English)</a>
        <a href="/test/bn" class="footer-link">Test (Bengali)</a>
      </div>
      <div class="version-badge">v1.0.0</div>
    </div>
  </div>
</body>
</html>
`;
};
