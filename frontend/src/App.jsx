import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";       // ✅ Must match `export default function Home()`
import History from "./pages/historyy";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/historyy" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
