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
const MapContent = ({ driverPos, customerPos, batchData, routePath, driverRoutePath, currentRideIndex }) => {
  const map = useMap()

  useEffect(() => {
    // Build a combined bounds from all available paths + driver position
    const allPoints = [
      ...(routePath?.length ? routePath : []),
      ...(driverRoutePath?.length ? driverRoutePath : []),
    ]
    if (driverPos) allPoints.push(driverPos)
    if (customerPos) allPoints.push(customerPos)

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [routePath, driverRoutePath, driverPos, customerPos, map])

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Full batch route — orange solid line (Stop1 → Stop2 → … → Office) */}
      {routePath && routePath.length > 0 && (
        <Polyline pathOptions={{ color: '#f29400', weight: 5, opacity: 0.75 }} positions={routePath} />
      )}

      {/* Driver → first customer — blue dashed line (Stop 1 only) */}
      {driverRoutePath && driverRoutePath.length > 0 && (
        <Polyline
          pathOptions={{
            color: '#3b82f6',
            weight: 5,
            opacity: 0.9,
            dashArray: '10, 8',
          }}
          positions={driverRoutePath}
        />
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
            <Popup>
              <div style={{ minWidth: '130px', padding: '4px 2px' }}>
                <p style={{ fontWeight: 800, fontSize: '13px', color: '#1f2937', marginBottom: '2px' }}>
                  {resolveRideName(ride)}
                </p>
                <p style={{ fontSize: '11px', color: '#f29400', fontWeight: 700 }}>
                  Stop {ride.pickupOrder || idx + 1}
                </p>
              </div>
            </Popup>
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

// Helper function to extract employee name from any shape the backend may send
const getEmployeeName = (employee) => {
  try {
    if (!employee) return null
    if (typeof employee === 'string') return null // bare ID string — no name
    if (typeof employee === 'object') {
      // The User schema stores name as a nested object: { first_name, last_name }
      // Try that first, then fall back to other common shapes
      const nestedName = employee.name && typeof employee.name === 'object'
        ? `${employee.name.first_name || ''} ${employee.name.last_name || ''}`.trim()
        : (typeof employee.name === 'string' ? employee.name.trim() : null)

      const candidates = [
        nestedName,                                       // { name: { first_name, last_name } }
        employee.fullName,                                // fullName
        employee.full_name,                               // full_name
        employee.displayName,                             // displayName
        employee.display_name,                            // display_name
        employee.first_name && employee.last_name         // top-level first+last
          ? `${employee.first_name} ${employee.last_name}`.trim()
          : null,
        employee.first_name,
        employee.last_name,
        // email intentionally excluded — not a display name
      ]
      for (const c of candidates) {
        if (c && typeof c === 'string' && c.trim()) return c.trim()
      }
    }
  } catch (err) {
    console.error('Error in getEmployeeName:', err, employee)
  }
  return null
}

// Smart resolver: uses every available field, only falls back to 'Passenger' as last resort.
// Crucially bypasses the stored 'Employee' placeholder string.
const resolveRideName = (ride) => {
  if (!ride) return 'Passenger'
  // 1. Use stored employeeName only if it's a real name (not the generic placeholder)
  if (ride.employeeName && ride.employeeName !== 'Employee' && ride.employeeName !== 'Passenger') {
    return ride.employeeName
  }
  // 2. Try to extract from the stored employee_id object (populated by backend)
  const fromObj = getEmployeeName(ride.employee_id)
  if (fromObj) return fromObj
  // 3. Final fallback
  return 'Passenger'
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
  const [routePath, setRoutePath] = useState(null)         // orange: full batch route
  const [driverRoutePath, setDriverRoutePath] = useState(null) // blue dashed: driver → stop 1
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

  // Reset both routes whenever the current stop changes
  useEffect(() => {
    setRoutePath(null);
    setDriverRoutePath(null);
    setEstimatedTime(null);
  }, [currentRideIndex, currentRide?.rideId]);

  useEffect(() => {
    if (!currentRide?.pickupLocation) return;

    const driverCoords = storedLocation ? JSON.parse(storedLocation) : null;

    // ─── STOP 1: fetch driver→customer (blue) AND full batch route (orange) ─
    if (currentRideIndex === 0 && batchData) {
      if (!driverCoords) return;

      const dLat = driverCoords.latitude;
      const dLng = driverCoords.longitude;
      const cLat = currentRide.pickupLocation.coordinates[1];
      const cLng = currentRide.pickupLocation.coordinates[0];

      // ── 1a. Full batch route (orange): Stop1 → Stop2 → … → Office ──────────
      const buildFullBatchRoute = async () => {
        // Use backend polyline if available
        if (batchData?.routePolyline?.coordinates || batchData?.pickupPolyline?.coordinates) {
          const poly = batchData.routePolyline || batchData.pickupPolyline;
          const coords = poly.coordinates.map(c => [c[1], c[0]]);
          setRoutePath(coords);
          return;
        }
        // Otherwise fetch from OSRM: all pickups in order + office
        const batchPoints = [...batchData.rides]
          .sort((a, b) => (a.pickupOrder || 0) - (b.pickupOrder || 0))
          .map(r => [r.pickupLocation.coordinates[1], r.pickupLocation.coordinates[0]]);
        if (batchData.officeLocation) batchPoints.push(batchData.officeLocation);
        if (batchPoints.length < 2) return;

        const wpFull = batchPoints.map(p => `${p[1]},${p[0]}`).join(';');
        try {
          const res = await fetch(
            `https://routing.openstreetmap.de/routed-car/route/v1/driving/${wpFull}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes?.length > 0) {
            setRoutePath(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          } else {
            setRoutePath(batchPoints);
          }
        } catch {
          setRoutePath(batchPoints);
        }
      };

      // ── 1b. Driver → Stop 1 (blue dashed) ──────────────────────────────────
      const fetchDriverToStop1 = async () => {
        setLoadingRoute(true);
        const waypoints    = `${dLng},${dLat};${cLng},${cLat}`;
        const primaryUrl   = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        const secondaryUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        const controller   = new AbortController();
        const timeoutId    = setTimeout(() => controller.abort(), 7000);

        try {
          console.log('🔵 [Stop 1] Fetching driver → customer route...');
          let response;
          try {
            response = await fetch(primaryUrl, { signal: controller.signal });
          } catch {
            response = await fetch(secondaryUrl, { signal: controller.signal });
          }
          clearTimeout(timeoutId);
          const data = await response.json();
          if (data.routes?.length > 0) {
            setDriverRoutePath(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
            setEstimatedTime(Math.round(data.routes[0].duration / 60));
          } else {
            throw new Error('No route returned');
          }
        } catch (err) {
          clearTimeout(timeoutId);
          if (err.name !== 'AbortError') console.error('❌ Stop-1 driver route failed:', err);
          setDriverRoutePath([[dLat, dLng], [cLat, cLng]]);
          setEstimatedTime(calculateTimeInMinutes(calculateDistance(dLat, dLng, cLat, cLng)));
        } finally {
          setLoadingRoute(false);
        }
      };

      buildFullBatchRoute();
      fetchDriverToStop1();
      return;
    }

    // ─── SUBSEQUENT STOPS or SINGLE RIDE: existing multi-point logic ───────
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

    if (!driverCoords) return;

    const fetchRoute = async () => {
      setLoadingRoute(true);

      let points = [];
      if (driverPos) points.push(driverPos);

      if (batchData) {
        const batchPoints = [...batchData.rides]
          .sort((a, b) => (a.pickupOrder || 0) - (b.pickupOrder || 0))
          .map(r => [r.pickupLocation.coordinates[1], r.pickupLocation.coordinates[0]]);
        points.push(...batchPoints);
        if (batchData.officeLocation) points.push(batchData.officeLocation);
      } else if (customerPos) {
        points.push(customerPos);
      }

      if (points.length < 2) { setLoadingRoute(false); return; }

      try {
        console.log('📍 Fetching multi-point route...');
        const waypoints = points.map(p => `${p[1]},${p[0]}`).join(';');
        const primaryUrl   = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        const secondaryUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;

        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 6000);

        let response;
        try {
          response = await fetch(primaryUrl, { signal: controller.signal });
        } catch {
          response = await fetch(secondaryUrl, { signal: controller.signal });
        }
        clearTimeout(timeoutId);

        const data = await response.json();
        if (data.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoutePath(coords);
          setEstimatedTime(Math.round(data.routes[0].duration / 60));
        } else {
          throw new Error('No route found');
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error('❌ Multi-point route fetch failed:', error);
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

    fetchRoute();
  }, [currentRideIndex, currentRide?.rideId, batchData?.batchId, !!driverPos, !!storedLocation])

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
            driverRoutePath={driverRoutePath}
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
                {resolveRideName(currentRide)[0].toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-800 flex items-center">
                {resolveRideName(currentRide)}
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
