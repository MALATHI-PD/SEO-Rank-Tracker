<div align="center">

# 🚀 Rank Pilot

### AI-Powered SEO Analyzer & Keyword Rank Tracker

Analyze any website's SEO health, track keyword rankings on Google, and monitor performance over time — all in one dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel&logoColor=white)](https://seo-rank-tracker-drab-alpha.vercel.app/)

**🔗 [Live Demo](https://seo.kavipriya.in/)**

</div>

---

## 📖 Overview

**Rank Pilot** is a full-stack MERN application that combines automated web scraping, AI-driven analysis, and real Google SERP tracking to give website owners actionable SEO insights. Enter any URL to receive an instant, AI-generated SEO audit — or track specific keywords to see exactly where your site ranks on Google, updated automatically over time.

## ✨ Features

- **🔍 Instant SEO Analysis** — Enter any URL and get a comprehensive audit covering SEO, performance, accessibility, and best practices, scored out of 100.
- **🤖 AI-Powered Insights** — Uses Google's Gemini AI to evaluate page content, structure, and metadata, surfacing prioritized issues with actionable recommendations.
- **📊 Keyword Rank Tracking** — Track how your website ranks on Google for specific keywords, scanning up to 5 pages of live search results.
- **📈 Ranking History & Trends** — Visualize position changes over time with an interactive ranking chart.
- **🏆 Competitor Discovery** — Automatically surfaces the top-ranking competitors for each tracked keyword.
- **🕵️ Automated Browser Scraping** — Uses Playwright via Browserbase to render pages and extract metadata, headings, links, images, load time, and word count.
- **📂 Analysis History** — Every analysis is saved and searchable, with pagination and status filtering.
- **🔐 Authenticated Accounts** — Each user's analyses and tracked keywords are private and scoped to their account.
- **🌓 Light & Dark Mode** — Clean, responsive UI built with Tailwind CSS.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express |
| **Database** | MongoDB with Mongoose |
| **AI Engine** | Google Gemini API |
| **Browser Automation** | Playwright + Browserbase |
| **Auth** | JWT-based authentication |



## 📁 Project Structure

```
SEO_Rank_Tracker/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Dashboard, Analyze, RankTracker, RankDetail, History
│   │   ├── context/        # App-level context (auth, API client)
│   │   └── components/     # Shared UI components
│   └── ...
├── server/                 # Express backend
│   ├── controllers/        # Route handlers (analysis, rank tracking, auth)
│   ├── models/              # Mongoose schemas (User, Analysis, KeywordTracking)
│   ├── routes/              # Express route definitions
│   ├── services/            # Scraper, Gemini AI, and rank-checking services
│   └── middleware/          # Auth middleware
└── README.md
```





   

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analysis/analyze` | Start a new SEO analysis for a URL |
| `GET` | `/api/analysis/list` | Get paginated analysis history |
| `GET` | `/api/analysis/:id` | Get a single analysis by ID |
| `DELETE` | `/api/analysis/:id` | Delete an analysis |
| `POST` | `/api/rank/add` | Start tracking a new keyword |
| `GET` | `/api/rank/list` | Get all tracked keywords |
| `GET` | `/api/rank/:id` | Get details and history for a tracked keyword |
| `POST` | `/api/rank/:id/refresh` | Manually refresh a keyword's ranking |
| `PUT` | `/api/rank/:id/toggle` | Pause or resume tracking for a keyword |
| `DELETE` | `/api/rank/:id` | Stop tracking a keyword |

All routes above (except registration/login) require a valid auth token.

## 🗺️ Roadmap

- [ ] Scheduled daily rank checks via cron job
- [ ] Email/Slack alerts on ranking changes
- [ ] Multi-location and multi-language rank tracking
- [ ] Exportable PDF audit reports
- [ ] Team/workspace support

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss what you'd like to change before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Kavipriya**
GitHub: [@krithi30011996](https://github.com/krithi30011996)

---

<div align="center">
©2026 Kavipriya. All rights reserved.
</div>
