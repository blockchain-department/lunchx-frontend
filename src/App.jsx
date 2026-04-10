import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { AppKitProvider } from './utilities/providers/AppKitProvider.jsx';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { Toaster } from "react-hot-toast";

const App = () => {

  gsap.registerPlugin(useGSAP);
  gsap.registerPlugin(ScrollTrigger); 
  
  return (
    <AppKitProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toasterId="default"
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          },

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
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
