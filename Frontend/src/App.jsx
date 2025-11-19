import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Items from "./pages/Items.jsx";
import Readers from "./pages/Readers.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Role from "./pages/Role.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/items" element={<Items />} />
          <Route path="/readers" element={<Readers />} />
          <Route path="/roles" element={<Role />} />
        </Route>
        <Route path="*" element={<ErrorPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
