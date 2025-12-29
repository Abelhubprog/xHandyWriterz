import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Bridge kept for backward compatibility. Content now renders directly from Strapi-powered services.
const LearningHub: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/services', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center text-gray-600">Redirecting to Services…</div>
    </div>
  );
};

export default LearningHub;