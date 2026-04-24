const withLoading = (Component) => {
  return ({ isLoading, ...props }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-amber-400 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-indigo-500 dark:border-t-amber-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 animate-pulse">
              Loading...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Please wait while we prepare everything
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default withLoading;
