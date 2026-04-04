# reGive ♻️

**reGive** is a community-driven web platform that connects people who want to donate items they no longer need with those who can put them to good use — giving things a second life instead of sending them to a landfill.

🌐 **Live Demo:** [regive.onrender.com](https://regive.onrender.com)

---

## ✨ Features

- Browse and post items available for donation
- User authentication and profiles
- Clean, server-rendered UI powered by EJS
- Responsive design for desktop and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS (Embedded JavaScript) |
| Styling | CSS |
| Backend Hosting | [Render](https://render.com) |
| Frontend Hosting | [Vercel](https://vercel.com) |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
reGive/
├── .github/
│   └── workflows/       # GitHub Actions CI/CD pipelines
├── backend/             # Express server, routes, models, controllers
├── frontend/            # Client-side assets and views
├── package.json
├── package-lock.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/SreedeepCode/reGive.git
cd reGive

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root and fill in the required values:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
# Add any other environment variables here
```

### Running Locally

```bash
# Start the development server
npm start
```

The app will be available at `http://localhost:3000`.

---

## 📜 License

This project is open source. See the repository for license details.

---

## 👤 Author

**Sreedeep Rajeevan**
- GitHub: [@SreedeepCode](https://github.com/SreedeepCode)
- Email: sreedeeprajeevan@gmail.com
