import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home"; // Assuming you've moved this to src/pages/home.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
