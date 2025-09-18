const createLocationQuery = (admin) => {
  let locationQuery = {};
  
  console.log('Creating location query for admin:', {
    role: admin.role,
    location: admin.location
  });
  
  // Temporary: Show all reports for testing
  if (admin.role === 'StateAdmin') {
    console.log('StateAdmin - showing all reports (temporary debug mode)');
    return {}; // Return empty query to show all reports
  }
  
  switch(admin.role) {
    case 'StateAdmin':
      // Show all reports from the admin's state
      locationQuery['administrativeLocation.state'] = { 
        $regex: new RegExp(`^${admin.location.state}$`, 'i') 
      };
      console.log('StateAdmin query - showing all reports from state:', admin.location.state);
      break;
    case 'DistrictAdmin':
      locationQuery['administrativeLocation.state'] = { 
        $regex: new RegExp(`^${admin.location.state}$`, 'i') 
      };
      locationQuery['administrativeLocation.district'] = { 
        $regex: new RegExp(`^${admin.location.district}$`, 'i') 
      };
      console.log('District query for DistrictAdmin:', locationQuery);
      break;
    case 'BlockAdmin':
      locationQuery['administrativeLocation.state'] = { 
        $regex: new RegExp(`^${admin.location.state}$`, 'i') 
      };
      locationQuery['administrativeLocation.district'] = { 
        $regex: new RegExp(`^${admin.location.district}$`, 'i') 
      };
      // Use regex to match block names that might have "Tehsil" suffix
      const blockName = admin.location.block;
      const cleanBlockName = blockName.replace(/\s+(tehsil|Tehsil|TEHSIL)$/i, '').trim();
      locationQuery['administrativeLocation.block'] = { 
        $regex: new RegExp(`^${cleanBlockName}(\\s+(tehsil|Tehsil|TEHSIL))?$`, 'i') 
      };
      console.log('Block query for BlockAdmin:', locationQuery);
      break;
    case 'VillageAdmin':
      locationQuery['administrativeLocation.state'] = { 
        $regex: new RegExp(`^${admin.location.state}$`, 'i') 
      };
      locationQuery['administrativeLocation.district'] = { 
        $regex: new RegExp(`^${admin.location.district}$`, 'i') 
      };
      // Use regex for block matching in village admin too
      const villageBlockName = admin.location.block;
      const cleanVillageBlockName = villageBlockName.replace(/\s+(tehsil|Tehsil|TEHSIL)$/i, '').trim();
      locationQuery['administrativeLocation.block'] = { 
        $regex: new RegExp(`^${cleanVillageBlockName}(\\s+(tehsil|Tehsil|TEHSIL))?$`, 'i') 
      };
      locationQuery['administrativeLocation.village'] = { 
        $regex: new RegExp(`^${admin.location.village}$`, 'i') 
      };
      console.log('Village query for VillageAdmin:', locationQuery);
      break;
  }
  
  console.log('Final location query:', locationQuery);
  return locationQuery;
};

// Create query for escalation-based complaint management
const createEscalationQuery = (admin) => {
  let query = {};
  
  // Temporary: Show all reports for StateAdmin for testing
  if (admin.role === 'StateAdmin') {
    console.log('StateAdmin - showing all reports (temporary debug mode)');
    return {}; // Return empty query to show all reports
  }
  
  // First add location-based filtering
  const locationQuery = createLocationQuery(admin);
  query = { ...locationQuery };
  
  // Map admin roles to escalation levels
  const roleToLevel = {
    'VillageAdmin': 'village',
    'BlockAdmin': 'block', 
    'DistrictAdmin': 'district',
    'StateAdmin': 'state'
  };
  
  const adminLevel = roleToLevel[admin.role];
  
  if (adminLevel) {
    // For village level, include both explicit assignedLevel and null/undefined (default cases)
    if (adminLevel === 'village') {
      query.$or = [
        { assignedLevel: 'village' },
        { assignedLevel: { $exists: false } },
        { assignedLevel: null }
      ];
    } else {
      // Only show complaints explicitly assigned to this level
      query.assignedLevel = adminLevel;
    }
    
    console.log('🎯 Escalation Query for', admin.role, ':', {
      adminLevel,
      query: JSON.stringify(query, null, 2)
    });
  }
  
  return query;
};

// Check if admin can update status of a complaint
const canUpdateComplaintStatus = (admin, complaint) => {
  const roleToLevel = {
    'VillageAdmin': 'village',
    'BlockAdmin': 'block',
    'DistrictAdmin': 'district', 
    'StateAdmin': 'state'
  };
  
  const adminLevel = roleToLevel[admin.role];
  
  // Can only update if complaint is assigned to same level
  return complaint.assignedLevel === adminLevel;
};

module.exports = {
  createLocationQuery,
  createEscalationQuery,
  canUpdateComplaintStatus
};
