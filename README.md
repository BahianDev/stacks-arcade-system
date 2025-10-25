# Sansa Arcade Games

Welcome to **SANSA Arcade Games**, a collection of retro-styled mini-games built with React and TypeScript. Some titles include Web3 features with wallet integration.

## 🎮 Games
- **Token Sniper**, **Block Buster**, and **Word Up** require a connected wallet via [RainbowKit](https://rainbowkit.com/) and [wagmi](https://wagmi.sh/).

## 🔗 Hot Wallet & Transactions
The project uses [wagmi](https://wagmi.sh/) for sending transactions through its `useSendTransaction` hook and [viem](https://viem.sh/) utilities such as `parseEther`.

To ensure users can pay gas fees, a **Hot Wallet Modal** lets players deposit ETH into a temporary wallet. The modal displays the address, private key, current balance, and provides a form to fund the wallet with a desired amount.

## 🛠️ Tech Stack
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) for the frontend.
- [TypeScript](https://www.typescriptlang.org/) for static typing.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [React Router](https://reactrouter.com/) for routes.
- [@tanstack/react-query](https://tanstack.com/query/latest) for async state management.
- [React Hot Toast](https://react-hot-toast.com/) for notifications.

## 📂 Project Structure
```
src/
├── auth/            # Wallet auth rules
├── components/      # Reusable UI pieces
├── games/           # Game implementations
├── hooks/           # Custom hooks
├── pages/           # App pages
└── utils/           # Helpers (audio, transactions, etc.)
```

## 🚀 Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Visit [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Additional Scripts
- `npm run build` – build for production.
- `npm run lint` – check code style with ESLint.
- `npm run preview` – preview the production build locally.

## 🤝 Contributing
Pull requests are welcome. Please run the linter before submitting:
```bash
npm run lint
```

---
This project does not yet include an explicit license.