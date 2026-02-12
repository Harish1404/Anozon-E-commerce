import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const withAdmin = (Component) => {
  return (props) => {
    const { isAuth, isAdmin, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuth) {
          navigate("/login", { replace: true });
        } else if (!isAdmin()) {
          navigate("/", { replace: true });
        }
      }
    }, [isAuth, isLoading, navigate]);

    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuth || !isAdmin()) {
      return null;
    }

    return <Component {...props} />;
  };
};

export default withAdmin;
