import { Outlet, Route, Routes } from "react-router";
import Navbar from "./features/Navigation/Navbar";
import PresentionScreen from "./features/Presentation/PresentionScreen";
import GameComponent from "./features/game/GameComponent";
import TimeLine from "./features/TimeLine/TimePage";
import ImageGallery from "./features/ImageGallery/ImageGallery";

function Layout() {
  return (
    <>
      <Navbar />

      <Outlet />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PresentionScreen />} />
          <Route path="game" element={<GameComponent />} />
          <Route path="timeline" element={<TimeLine />} />
          <Route path="gallery" element={<ImageGallery />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
