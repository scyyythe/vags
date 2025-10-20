import { useEffect, useState } from 'react';

const useUserActivity = () => {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateActivity = () => {
      setIsActive(true);
      setLastActivity(Date.now());
      
      // Set inactive after 30 seconds of no activity
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsActive(false);
      }, 30000);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Initial activity
    updateActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearTimeout(timeoutId);
    };
  }, []);

  return { isActive, lastActivity };
};

export default useUserActivity;
