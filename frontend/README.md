# Deployment Pipeline Repository

This repository contains the code for both **backend** and **frontend** applications and is configured with a GitHub Actions deployment pipeline that handles linting, testing, building, deployment, tagging, and notifications.

## Requirements

- Node.js 20  
- npm (Node package manager)  
- [Playwright](https://playwright.dev/) (for frontend end-to-end tests)  
- Access to `Render` API (for deployment)  
- Discord webhook (for CI/CD notifications)  

---

## Getting Started

Clone the repository:

```bash
git clone git@github.com:Markus-Kivinen/Blogger.git
cd Blogger

# Create .env containing, or load them as environment variables
MONGODB_URI=mongodb+srv://****
TEST_MONGODB_URI=mongodb+srv://****
PORT=3003
SECRET=your_jwt_secret

# Install dependencies
npm ci && npm --prefix frontend ci
# Run linting
npm run lint && npm --prefix frontend run lint
# Run tests
npm run test && npm --prefix frontend run test
# Build frontend
npm run build:ui
# Run the server
npm start

To run the frontend in development mode:
npm --prefix frontend run dev

