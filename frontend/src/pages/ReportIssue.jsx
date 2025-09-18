import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ReportIssue() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  
  // Manual location fields
  const [manualLocation, setManualLocation] = useState({
    state: '',
    district: '',
    block: '',
    village: '',
    landmark: '',
    pincode: '',
    fullAddress: ''
  });

  // ✅ Camera start
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Camera access denied
      }
    };
    startCamera();
  }, []);

  // ✅ Capture photo + call location
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);
      getLocation();
    }
  };

  // ✅ Fetch location + address (using proxy to avoid CORS)
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);

          // Use backend proxy for address to avoid CORS
          try {
            const res = await axios.get(`http://localhost:5000/api/geocode?lat=${coords.lat}&lon=${coords.lng}`);
            const addressData = res.data.address || "Address not found";
            setAddress(addressData);
            
            // Parse address into components for manual editing
            parseAddressComponents(addressData);
          } catch (err) {
            const fallbackAddress = `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;
            setAddress(fallbackAddress);
            setManualLocation(prev => ({ ...prev, fullAddress: fallbackAddress }));
          }
        },
        (err) => {
          // Enable manual input if location fails
          setManualLocation(prev => ({ ...prev, fullAddress: "Please enter location manually" }));
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Parse address into components
  const parseAddressComponents = (fullAddress) => {
    if (!fullAddress || fullAddress === "Address not found") return;
    
    // Basic parsing for Indian addresses - improved logic
    const parts = fullAddress.split(',').map(part => part.trim());
    
    // Enhanced state detection with more Indian states
    const stateKeywords = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
      'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli', 'Daman and Diu',
      'Lakshadweep'
    ];
    
    const extractedState = parts.find(part => 
      stateKeywords.some(state => 
        part.toLowerCase().includes(state.toLowerCase()) ||
        state.toLowerCase().includes(part.toLowerCase())
      )
    ) || '';
    
    const extractedPincode = parts.find(part => /^\d{6}$/.test(part.trim())) || '';
    
    // Enhanced district detection - look for district keywords or position-based
    const districtKeywords = ['district', 'dist', 'zila'];
    let extractedDistrict = parts.find(part => 
      districtKeywords.some(keyword => part.toLowerCase().includes(keyword))
    );
    
    // If no district keyword found, use position-based detection
    if (!extractedDistrict) {
      const stateIndex = parts.findIndex(part => extractedState.includes(part));
      extractedDistrict = stateIndex > 0 ? parts[stateIndex - 1] : '';
    }
    
    // Clean district name
    extractedDistrict = extractedDistrict.replace(/district|dist|zila/gi, '').trim();
    
    // Enhanced block/tehsil detection
    const blockKeywords = ['tehsil', 'block', 'taluka', 'subdivision', 'sub-division'];
    let extractedBlock = parts.find(part => 
      blockKeywords.some(keyword => part.toLowerCase().includes(keyword))
    );
    
    // Clean block name
    if (extractedBlock) {
      extractedBlock = extractedBlock.replace(/tehsil|block|taluka|subdivision|sub-division/gi, '').trim();
    } else {
      // Try to find block based on position (usually between village and district)
      const districtIndex = parts.findIndex(part => part.includes(extractedDistrict));
      if (districtIndex > 1) {
        extractedBlock = parts[districtIndex - 1];
      }
    }
    
    // Enhanced village/area detection
    const villageKeywords = ['village', 'gram', 'gaon', 'colony', 'nagar', 'ward'];
    let extractedVillage = parts.find(part => 
      villageKeywords.some(keyword => part.toLowerCase().includes(keyword))
    );
    
    // If no village keyword found, use first meaningful part
    if (!extractedVillage) {
      extractedVillage = parts.find(part => 
        !part.includes(extractedState) && 
        !part.includes(extractedDistrict) && 
        !part.includes(extractedBlock) &&
        !/^\d{6}$/.test(part) &&
        part.length > 2
      ) || parts[0] || '';
    }
    
    // Clean village name
    if (extractedVillage) {
      extractedVillage = extractedVillage.replace(/village|gram|gaon|colony|nagar|ward/gi, '').trim();
    }
    
    // Enhanced landmark detection
    const landmarkKeywords = ['near', 'behind', 'opposite', 'beside', 'front', 'temple', 'school', 'hospital', 'market', 'station'];
    const extractedLandmark = parts.find(part => 
      landmarkKeywords.some(keyword => part.toLowerCase().includes(keyword))
    ) || '';
    
    setManualLocation(prev => ({
      ...prev,
      fullAddress: fullAddress,
      state: extractedState,
      district: extractedDistrict,
      block: extractedBlock.replace(/tehsil|block|taluka/gi, '').trim(),
      village: extractedVillage,
      landmark: extractedLandmark,
      pincode: extractedPincode
    }));
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // ✅ Submit Report to Backend
  const handleSubmit = async () => {
    // Check if we have either GPS location or manual location
    const hasLocation = location || (manualLocation.state && manualLocation.district);
    
    if (!title || !description || !capturedImage || !hasLocation || !category) {
      alert("Please fill all required fields (title, description, location, category) and capture a photo!");
      return;
    }

    // Prepare comprehensive address
    let finalAddress = address;
    if (manualLocation.state || manualLocation.district) {
      const manualAddressParts = [
        manualLocation.landmark,
        manualLocation.village,
        manualLocation.block,
        manualLocation.district,
        manualLocation.state,
        manualLocation.pincode
      ].filter(part => part && part.trim());
      
      finalAddress = manualAddressParts.join(', ') || address;
    }

    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    form.append('category', category);
    form.append('address', finalAddress);
    
    // Include location coordinates if available
    if (location) {
      form.append('location', JSON.stringify(location));
    } else {
      // If no GPS, create a placeholder location
      form.append('location', JSON.stringify({ lat: 0, lng: 0, manual: true }));
    }
    
    // Include manual location details
    form.append('manualLocation', JSON.stringify(manualLocation));
    
    // convert canvas base64 to file
    const file = dataURLtoFile(capturedImage, 'issue.png');
    form.append('photo', file);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:5000/api/reports', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Report submitted successfully!");
      // reset state as needed
      setTitle(""); 
      setDescription(""); 
      setCategory("");
      setCapturedImage(null); 
      setLocation(null); 
      setAddress("");
      setManualLocation({
        state: '',
        district: '',
        block: '',
        village: '',
        landmark: '',
        pincode: '',
        fullAddress: ''
      });
    } catch (err) {
      let errorMessage = "Error submitting report";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            <span className="mr-2 text-lg group-hover:animate-pulse">⬅️</span>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚨 Report an Issue
          </h1>
          <div className="w-40"></div> {/* Spacer for centering */}
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl space-y-8 border border-blue-100">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-700 flex items-center">
              <span className="mr-2">📝</span> Issue Title
            </label>
            <input
              type="text"
              placeholder="Enter issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-700 flex items-center">
              <span className="mr-2">📝</span> Issue Description
            </label>
            <textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-400 h-32 resize-none"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-700 flex items-center">
              <span className="mr-2">🏷️</span> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-400"
              required
            >
              <option value="">Select Category</option>
              <option value="Road Issues">🛣️ Road Issues</option>
              <option value="Waste Management">🗑️ Waste Management</option>
              <option value="Street Lighting">💡 Street Lighting</option>
              <option value="Water Supply">💧 Water Supply</option>
              <option value="Environment">🌳 Environment</option>
              <option value="Public Safety">⚠️ Public Safety</option>
            </select>
          </div>

          {/* Camera */}
          {!capturedImage && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {!capturedImage ? (
            <button
              onClick={capturePhoto}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              📸 Capture Photo
            </button>
          ) : (
            <div>
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg border"
              />
            </div>
          )}

          {/* Location Section - Moved after photo capture */}
          {capturedImage && (
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                <span className="mr-2">📍</span> Location Details
                {location && (
                  <span className="text-sm font-normal text-green-600 ml-2">
                    📡 GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                )}
              </label>

              {/* Manual location trigger button */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={getLocation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <span className="mr-2">📍</span>
                  Detect My Location
                </button>
                
                <button
                  type="button"
                  onClick={() => setManualLocation({
                    state: '',
                    district: '',
                    block: '',
                    village: '',
                    landmark: '',
                    pincode: '',
                    fullAddress: ''
                  })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <span className="mr-2">🔄</span>
                  Clear Fields
                </button>
              </div>

              {/* Manual location fields with auto-populated data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualLocation.state}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Madhya Pradesh"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualLocation.district}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Khargone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block/Tehsil</label>
                  <input
                    type="text"
                    value={manualLocation.block}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, block: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Kasrawad"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village/Area</label>
                  <input
                    type="text"
                    value={manualLocation.village}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, village: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Village/Colony name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={manualLocation.landmark}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Near School, Market"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={manualLocation.pincode}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 451001"
                    maxLength="6"
                  />
                </div>
              </div>
              
              {/* Show combined address preview */}
              {(manualLocation.state || manualLocation.district || manualLocation.village) && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-700 font-medium mb-1">📋 Address Preview:</div>
                  <div className="text-sm text-gray-600">
                    {[
                      manualLocation.landmark,
                      manualLocation.village,
                      manualLocation.block,
                      manualLocation.district,
                      manualLocation.state,
                      manualLocation.pincode
                    ].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {location && (
            <p className="text-sm text-gray-600">
              📍 {address}
            </p>
          )}

          {/* Submit Button - Only show after photo is captured */}
          {capturedImage && (
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              🚀 Submit Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}