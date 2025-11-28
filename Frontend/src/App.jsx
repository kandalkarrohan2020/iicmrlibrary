import React from "react";
import "./App.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth.jsx";
import Layout from "./layout/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Items from "./pages/Items.jsx";
import ManageItems from "./pages/ManageItems.jsx";
import Readers from "./pages/Readers.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Role from "./pages/Role.jsx";
import Vendor from "./pages/Vendor.jsx";
import Staff from "./pages/Staff.jsx";
import KYC from "./pages/KYC.jsx";

const App = () => {
  const { URI, setLoading, user } = useAuth();
  const [menus, setMenus] = useState([
    {
      name: "Items",
      menu: <Route path="/items" element={<Items />} />,
    },
    {
      name: "Manage Items",
      menu: <Route path="/manage-items" element={<ManageItems />} />,
    },
    {
      name: "Readers",
      menu: <Route path="/readers" element={<Readers />} />,
    },
    {
      name: "Vendor",
      menu: <Route path="/vendor" element={<Vendor />} />,
    },
    {
      name: "Staff",
      menu: <Route path="/staff" element={<Staff />} />,
    },
    {
      name: "Record",
      menu: <Route path="/record" element={<Readers />} />,
    },
    {
      name: "Vendors",
      menu: <Route path="/vendors" element={<Vendor />} />,
    },
    {
      name: "Staff",
      menu: <Route path="/staff" element={<Staff />} />,
    },
    { name: "Roles", menu: <Route path="/roles" element={<Role />} /> },
  ]);

  const dynamicRoutes = menus.filter((menu) =>
    user?.assignMenus?.includes(menu.name)
  );
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/kyc/:userid" element={<KYC />} />
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Menu Wise Dynamic Routes */}
          {dynamicRoutes.map((menu, index) => (
            <React.Fragment key={index}>{menu.menu}</React.Fragment>
          ))}
        </Route>
        <Route path="*" element={<ErrorPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
