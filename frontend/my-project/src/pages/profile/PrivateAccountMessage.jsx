import React from "react";
import { Lock } from "lucide-react";

const PrivateAccountMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg shadow-sm">
      <Lock className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        This Account is Private
      </h2>
      <p className="text-gray-600 mb-6">
        Follow this account to see their photos and videos
      </p>
    </div>
  );
};

export default PrivateAccountMessage;
