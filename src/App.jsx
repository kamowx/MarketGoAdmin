import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Adminsignup from "./screens/adminsignup";
import Adminsignin from "./screens/adminsignin";
import Admin from "./screens/admin";
import AdminHome from "./screens/adminhome";
import Adminsellerrequests from "./screens/adminsellerrequests";
import Admincourierrequests from "./screens/admincourierrequests";
import Adminsellers from "./screens/adminsellers";
import Admincouriers from "./screens/admincouriers";
import Adminusers from "./screens/adminusers";
import Adminstores from "./screens/adminstores";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/adminsignup" element={<Adminsignup />} />
        <Route path="/" element={<Adminsignin />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/adminsellerrequests" element={<Adminsellerrequests />} />
        <Route path="/adminsellers" element={<Adminsellers />} />
        <Route path="/admincouriers" element={<Admincouriers />} />
        <Route path="/adminusers" element={<Adminusers />} />
        <Route path="/adminstores" element={<Adminstores />} />

        <Route
          path="/admincourierrequests"
          element={<Admincourierrequests />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
