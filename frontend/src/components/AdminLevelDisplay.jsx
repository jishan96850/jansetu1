import React from 'react';

const AdminLevelDisplay = ({ assignedLevel, escalationHistory = [] }) => {
  const getLevelInfo = (level) => {
    switch(level?.toLowerCase()) {
      case 'village':
      case 'villageadmin':
        return { name: 'Village Level', icon: '🏘️', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'block':
      case 'blockadmin':
        return { name: 'Block Level', icon: '🏛️', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'district':
      case 'districtadmin':
        return { name: 'District Level', icon: '🏢', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'state':
      case 'stateadmin':
        return { name: 'State Level', icon: '🏛️', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { name: 'Village Level', icon: '🏘️', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  const currentLevel = getLevelInfo(assignedLevel);

  return (
    <div className="space-y-2">
      {/* Current Level */}
      <div className={`flex items-center px-3 py-2 rounded-lg border ${currentLevel.color}`}>
        <span className="mr-2 text-lg">{currentLevel.icon}</span>
        <div>
          <div className="font-medium text-sm">{currentLevel.name}</div>
          <div className="text-xs opacity-75">Currently handling your report</div>
        </div>
      </div>

      {/* Escalation Progress */}
      {escalationHistory && escalationHistory.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Escalation History:</div>
          <div className="space-y-1">
            {escalationHistory.map((history, index) => {
              const levelInfo = getLevelInfo(history.from);
              return (
                <div key={index} className="flex items-center text-xs text-gray-600">
                  <span className="mr-1">{levelInfo.icon}</span>
                  <span>{levelInfo.name}</span>
                  <span className="mx-1">→</span>
                  <span className="text-gray-400">
                    {new Date(history.escalatedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLevelDisplay;