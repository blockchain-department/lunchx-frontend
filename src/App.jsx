import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { AppKitProvider } from './utilities/providers/AppKitProvider.jsx';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

const App = () => {

  gsap.registerPlugin(useGSAP);
  gsap.registerPlugin(ScrollTrigger); 
  
  return (
    <AppKitProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppKitProvider>
  );
};

export default App;
