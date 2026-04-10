import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react'
import Button from '../components/Button'

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Custom icon for driver car
const carIcon = L.icon({
  iconUrl: '/driver_car.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

// Custom icon for office
const officeIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full text-xs font-bold border-2 border-white shadow-md">
      🏢
    </div>
  `,
  iconSize: [40, 40],
  className: 'custom-div-icon'
})

// Custom icons for stops
const createStopIcon = (index, isActive) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 ${isActive ? 'bg-primary' : 'bg-gray-400'} text-white rounded-full text-xs font-bold border-2 border-white shadow-md transition-all">
        ${index}
      </div>
    `,
    iconSize: isActive ? [32, 32] : [28, 28],
    className: 'custom-div-icon'
  })
}

// Map content component to handle fitBounds
const MapContent = ({ driverPos, customerPos, batchData, routePath, currentRideIndex }) => {
  const map = useMap()

  useEffect(() => {
    if (routePath && routePath.length > 0) {
      const bounds = L.latLngBounds(routePath)
      if (driverPos) bounds.extend(driverPos)
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (customerPos) {
      map.setView(customerPos, 15)
    }
  }, [routePath, driverPos, customerPos, map])

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Route Path */}
      {routePath && routePath.length > 0 && (
        <Polyline pathOptions={{ color: '#f29400', weight: 5, opacity: 0.8 }} positions={routePath} />
      )}

      {/* Driver Marker */}
      {driverPos && (
        <Marker position={driverPos} icon={carIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Stop Markers */}
      {batchData ? (
        batchData.rides.map((ride, idx) => (
          <Marker 
            key={`ride-${idx}`}
            position={[ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]]}
            icon={createStopIcon(ride.pickupOrder || idx + 1, ride.rideId === batchData.rides[currentRideIndex]?.rideId)}
          >
            <Popup>{ride.employeeName}</Popup>
          </Marker>
        ))
      ) : (
        customerPos && <Marker position={customerPos} title="Customer Location" />
      )}

      {/* Office Marker */}
      {batchData?.officeLocation && (
        <Marker position={batchData.officeLocation} icon={officeIcon}>
          <Popup>Office Destination</Popup>
        </Marker>
      )}
    </>
  )
}

// Helper function to extract employee name - ALWAYS returns a string
const getEmployeeName = (employee) => {
  try {
    if (!employee) return 'Employee'
    if (typeof employee === 'string') return 'Employee'
    if (typeof employee === 'object') {
      if (employee.name && typeof employee.name === 'string') {
        return employee.name.trim() || 'Employee'
      }
      const firstName = employee.first_name ? String(employee.first_name).trim() : ''
      const lastName = employee.last_name ? String(employee.last_name).trim() : ''
      const fullName = `${firstName} ${lastName}`.trim()
      if (fullName) return fullName
    }
  } catch (err) {
    console.error('Error in getEmployeeName:', err, employee)
  }
  return 'Employee'
}

// Calculate distance between two coordinates using Haversine formula (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate time based on distance and average speed (40 km/h)
const calculateTimeInMinutes = (distanceKm) => {
  const AVERAGE_SPEED_KMH = 40
  const timeInHours = distanceKm / AVERAGE_SPEED_KMH
  const timeInMinutes = Math.round(timeInHours * 60)
  return Math.max(1, timeInMinutes) // Minimum 1 minute
}

const CustomerLocationPage = () => {
  const navigate = useNavigate()
  const [rideData, setRideData] = useState(null)
  const [batchData, setBatchData] = useState(null)
  const [currentRideIndex, setCurrentRideIndex] = useState(0)
  const [routePath, setRoutePath] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(null)

  useEffect(() => {
    // Get accepted ride or batch data from localStorage
    const acceptedRide = localStorage.getItem('acceptedRide')
    const acceptedBatch = localStorage.getItem('acceptedBatch')
    
    if (acceptedBatch) {
      const batch = JSON.parse(acceptedBatch)
      setBatchData(batch)
      const savedIndex = sessionStorage.getItem('currentRideIndex')
      setCurrentRideIndex(savedIndex ? parseInt(savedIndex) : 0)
    } else if (acceptedRide) {
      setRideData(JSON.parse(acceptedRide))
    }
  }, [])

  // Get actual driver position from localStorage
  const storedLocation = localStorage.getItem('driverLocation')
  const driverLatLng = storedLocation ? JSON.parse(storedLocation) : null
  const driverPos = driverLatLng ? [driverLatLng.latitude, driverLatLng.longitude] : [28.6280, 77.3649]

  // Determine current ride (from batch or single ride)
  const currentRide = batchData?.rides?.[currentRideIndex] || rideData

  const customerPos = currentRide?.pickupLocation?.coordinates
    ? [currentRide.pickupLocation.coordinates[1], currentRide.pickupLocation.coordinates[0]]
    : [28.6350, 77.3700]

  // Display route logic
  useEffect(() => {
    // If we have a Batch with a predefined route, use it
    if (batchData?.routePolyline?.coordinates || batchData?.pickupPolyline?.coordinates) {
      const poly = batchData.routePolyline || batchData.pickupPolyline;
      console.log('🗺️ Using full batch route from backend polyline');
      const coordinates = poly.coordinates.map(coord => [coord[1], coord[0]]);
      setRoutePath(coordinates);
      
      if (driverPos && customerPos) {
        const dist = calculateDistance(driverPos[0], driverPos[1], customerPos[0], customerPos[1]);
        setEstimatedTime(calculateTimeInMinutes(dist));
      }
      return;
    }

    // Fallback or Single Ride: Fetch route from driver to customer
    if (!currentRide?.pickupLocation) return;
    const driverCoords = storedLocation ? JSON.parse(storedLocation) : null;
    if (!driverCoords) return;

    const dLat = driverCoords.latitude;
    const dLng = driverCoords.longitude;
    const cLng = currentRide.pickupLocation.coordinates[0];
    const cLat = currentRide.pickupLocation.coordinates[1];

    const fetchRoute = async () => {
      // Prevent redundant fetches if we already have a route
      if (routePath && routePath.length > 0) return;
      
      setLoadingRoute(true);
      
      // Determine all points for the route
      let points = [];
      const dCoords = driverPos || (storedLocation ? [storedLocation.latitude, storedLocation.longitude] : null);
      if (dCoords) points.push(dCoords);
      
      if (batchData) {
        // Add all pickups in order
        const batchPoints = [...batchData.rides]
          .sort((a, b) => (a.pickupOrder || 0) - (b.pickupOrder || 0))
          .map(r => [r.pickupLocation.coordinates[1], r.pickupLocation.coordinates[0]]);
        points.push(...batchPoints);
        
        // Add office destination
        if (batchData.officeLocation) {
          points.push(batchData.officeLocation);
        }
      } else if (customerPos) {
        points.push(customerPos);
      }

      if (points.length < 2) {
        setLoadingRoute(false);
        return;
      }

      try {
        console.log('📍 Fetching multi-point route...');
        const waypoints = points.map(p => `${p[1]},${p[0]}`).join(';');
        
        const primaryUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        const secondaryUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        let response;
        try {
          console.log('📡 Trying primary mirror (OSM Germany)...');
          response = await fetch(primaryUrl, { signal: controller.signal });
        } catch (e) {
          console.warn('⚠️ Primary mirror failed, trying secondary (Project OSRM)...');
          response = await fetch(secondaryUrl, { signal: controller.signal });
        }
        
        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePath(coordinates);
          setEstimatedTime(Math.round(data.routes[0].duration / 60));
        } else {
          throw new Error('No route found in response');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('⏱️ Route fetch timed out');
        } else {
          console.error('❌ Multi-point route fetch failed:', error);
        }
        // Fallback: Connect all points with straight lines
        setRoutePath(points);
        
        let totalDist = 0;
        for (let i = 0; i < points.length - 1; i++) {
          totalDist += calculateDistance(points[i][0], points[i][1], points[i+1][0], points[i+1][1]);
        }
        setEstimatedTime(calculateTimeInMinutes(totalDist));
      } finally {
        setLoadingRoute(false);
      }
    };

    if (driverPos || storedLocation) {
      fetchRoute();
    }
  }, [currentRide?.rideId, batchData?.batchId, !!driverPos, !!storedLocation])

  const handleNext = () => {
    navigate('/arrived')
  }

  if (!currentRide) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">No ride data available</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen flex flex-col bg-[#f0f0f5] animate-fade-in overflow-hidden">
      <div className="absolute inset-0 z-[1] w-full h-full">
        <MapContainer className="w-full h-full" center={customerPos} zoom={15} scrollWheelZoom={true} zoomControl={false}>
          <MapContent 
            driverPos={driverPos}
            customerPos={customerPos}
            batchData={batchData}
            routePath={routePath}
            currentRideIndex={currentRideIndex}
          />
        </MapContainer>
      </div>

      <div className="relative z-[10] flex flex-col h-full pointer-events-none">
        <div className="flex items-center px-6 pt-10 pointer-events-auto">
          <button className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg" onClick={() => navigate(batchData ? '/batch-request' : '/ride-request')}>
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-extrabold text-gray-800">Customer Location</h1>
          </div>
        </div>

        <div className="mt-auto bg-white rounded-t-[40px] p-8 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pointer-events-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-800">Customer Location</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
              {estimatedTime ? `${estimatedTime} mins Away` : '⏳ Calculating...'}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden ring-4 ring-orange-50">
              {/* Placeholder avatar */}
              <div className="w-full h-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
                {String(currentRide?.employeeName || getEmployeeName(currentRide?.employee_id))?.[0] || 'U'}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-800 flex items-center">
                {String(currentRide?.employeeName || getEmployeeName(currentRide?.employee_id))}
                {batchData && (
                  <span className="ml-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Stop {currentRideIndex + 1}
                  </span>
                )}
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {batchData ? `Pickup ${currentRideIndex + 1} of ${batchData.rides.length}` : (currentRide?.paymentMethod || 'Cash Payment')}
              </p>
            </div>
            <div className="flex-1"></div>
            <div className="flex gap-2">
                <button className="w-12 h-12 bg-orange-50 rounded-full flex justify-center items-center text-primary">
                    <MessageSquare size={20} fill="currentColor" className="opacity-20" />
                    <MessageSquare size={20} className="absolute" />
                </button>
                <button className="w-12 h-12 bg-orange-50 rounded-full flex justify-center items-center text-primary">
                    <Phone size={20} fill="currentColor" className="opacity-20" />
                    <Phone size={20} className="absolute" />
                </button>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pickup</p>
              <p className="text-sm font-bold text-gray-700">{currentRide?.pickupAddress}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dropoff</p>
              <p className="text-sm font-bold text-gray-700">{currentRide?.dropAddress}</p>
            </div>
          </div>

          <Button className="text-lg shadow-[0_10px_20px_rgba(242,148,0,0.3)]" onClick={handleNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CustomerLocationPage
