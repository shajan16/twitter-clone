import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import "./App.css";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Explore from "./pages/Explore/Explore";
import Signin from "./pages/Signin/Signin";
import Navbar from "./components/Navbar/Navbar";
import MobileNav from "./components/MobileNav/MobileNav";
import Error from "./pages/Error/Error";

const Layout = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="w-full">
      {currentUser && <Navbar />}
      <Outlet />
      {currentUser && <MobileNav />}
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <Error />,
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile/:id",
        element: <Profile />,
      },
      {
        path: "/explore",
        element: <Explore />,
      },
    ],
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signout",
    element: <Signin />,
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
