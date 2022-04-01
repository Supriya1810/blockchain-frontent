import {
  Navbar,
  Loader,
  Services,
  Transaction,
  Welcome,
  Footer,
} from "../src/components/index";
function App() {
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transaction />
      <Footer />
    </div>
  );
}

export default App;
