import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const withAuth = (Component) => {
  return (props) => {
    const { isAuth, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuth) {
        navigate("/login", { replace: true });
      }
    }, [isAuth, isLoading, navigate]);

    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuth) {
      return null;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
