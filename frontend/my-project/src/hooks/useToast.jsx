import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = ({ title, description, duration = 3000 }) => {
    setToast({ title, description, duration });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="animate-fade-in bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 rounded-lg shadow-lg text-white backdrop-blur-lg">
            <h4 className="font-bold text-lg">{toast.title}</h4>
            <p className="text-sm mt-1">{toast.description}</p>
            <div className="h-1 bg-white mt-3 relative overflow-hidden rounded-lg">
              <div
                className="absolute top-0 left-0 h-full bg-black bg-opacity-30 animate-toast-progress"
                style={{ animationDuration: `${toast.duration}ms` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
