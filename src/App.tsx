import "@rainbow-me/rainbowkit/styles.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./pages/Homepage";
import { TokenSniperGame } from "./games/token-sniper/TokenSniperGame";
import { BlockBusterGame } from "./games/block-buster";
import { WordUpGamePage } from "./games/word-up";
import { Toaster } from "react-hot-toast";
import Reacteroids from "./games/asteroids/Reacteroids";
import SpaceInvaders from "./games/space-invaders/SpaceInvadersGame";
import Tetris from "./games/tetris/Tetris";


function App() {
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: "",
            duration: 5000,
            removeDelay: 1000,
            style: {
              background: "#000000",
              color: "#ffffff",
              border: "1px solid #ffffff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "green",
                secondary: "black",
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/asteroids" element={<Reacteroids />} />
          <Route path="/space-invaders" element={<SpaceInvaders />} />
          <Route path="/tetris" element={<Tetris />} />

          <Route>
            <Route path="/token-sniper" element={<TokenSniperGame />} />
            <Route path="/block-chain" element={<BlockBusterGame />} />
            <Route path="/word-up" element={<WordUpGamePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
