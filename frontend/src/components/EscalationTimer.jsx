import React, { useState, useEffect } from 'react';

const EscalationTimer = ({ createdAt, assignedLevel, status }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    // If report is resolved, no timer needed
    if (status === 'Resolved') {
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const reportDate = new Date(createdAt);
      const escalationTime = new Date(reportDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
      
      const timeDiff = escalationTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        });
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false
      });
    };

    // Update immediately
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [createdAt, status]);

  // Don't show timer for resolved reports
  if (status === 'Resolved') {
    return (
      <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <span className="text-green-600 text-sm font-medium">✅ Resolved</span>
      </div>
    );
  }

  // Get color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining.expired) return 'text-red-600 bg-red-50 border-red-200';
    if (timeRemaining.days <= 0 && timeRemaining.hours <= 12) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (timeRemaining.days <= 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getTimerIcon = () => {
    if (timeRemaining.expired) return '🚨';
    if (timeRemaining.days <= 0 && timeRemaining.hours <= 12) return '⚠️';
    if (timeRemaining.days <= 1) return '⏰';
    return '⏱️';
  };

  return (
    <div className={`flex items-center px-3 py-2 rounded-lg border ${getTimerColor()}`}>
      <span className="mr-2">{getTimerIcon()}</span>
      <div className="text-sm">
        <div className="font-medium">
          {timeRemaining.expired ? (
            'Escalation Due!'
          ) : (
            `${timeRemaining.days}d.${timeRemaining.hours.toString().padStart(2, '0')}h.${timeRemaining.minutes.toString().padStart(2, '0')}m.${timeRemaining.seconds.toString().padStart(2, '0')}s`
          )}
        </div>
        <div className="text-xs opacity-75">
          {timeRemaining.expired ? 'Should escalate to next level' : 'Time until escalation'}
        </div>
      </div>
    </div>
  );
};

export default EscalationTimer;