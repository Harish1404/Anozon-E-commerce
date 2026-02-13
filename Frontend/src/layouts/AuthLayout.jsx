import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="bg-gray-200 dark:bg-gray-900 transition-colors ease-in-out duration-500 relative min-h-screen">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
