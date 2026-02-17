import { AppRouter } from "./router";
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <>
      <Toaster position="top-right" />
      {/* routes */}
      <AppRouter />
    </>
    
  );
}

export default App;


