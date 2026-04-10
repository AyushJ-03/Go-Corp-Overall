import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, Check, Navigation } from 'lucide-react'
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

// Stop Icon
const createStopIcon = (index, isActive) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${isActive ? `
          <style>
            @keyframes pulse-ring {
              0% {
                box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.7);
              }
              70% {
                box-shadow: 0 0 0 15px rgba(107, 114, 128, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(107, 114, 128, 0);
              }
            }
            @keyframes pulse-glow {
              0%, 100% {
                filter: drop-shadow(0 0 5px rgba(107, 114, 128, 0.8));
              }
              50% {
                filter: drop-shadow(0 0 12px rgba(107, 114, 128, 1));
              }
            }
            .active-marker {
              animation: pulse-ring 2s infinite, pulse-glow 1.5s infinite;
            }
          </style>
          <div class="active-marker absolute w-16 h-16 border-2 border-gray-600 rounded-full opacity-40"></div>
        ` : ''}
        <div class="flex items-center justify-center w-8 h-8 ${isActive ? 'bg-gray-600' : 'bg-gray-400'} text-white rounded-full text-xs font-bold border-3 border-white shadow-lg transition-all ${isActive ? 'scale-125' : ''}" style="${isActive ? 'box-shadow: 0 0 20px rgba(107, 114, 128, 0.8);' : ''}">
          ${index}
        </div>
      </div>
    `,
    iconSize: isActive ? [48, 48] : [32, 32],
    iconAnchor: isActive ? [24, 24] : [16, 16],
    className: 'custom-div-icon'
  })
}

const MapContent = ({ position, routePath, batchData }) => {
  const map = useMap()
  
  useEffect(() => {
    if (routePath && routePath.length > 0) {
      const bounds = L.latLngBounds(routePath)
      map.fitBounds(bounds, { padding: [100, 100] })
    } else if (position) {
      map.flyTo(position, 16)
    }
  }, [position, routePath, map])

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routePath && <Polyline pathOptions={{ color: '#f29400', weight: 4, opacity: 0.6 }} positions={routePath} />}
      
      {/* Driver Marker */}
      {position && (
        <Marker position={position} icon={carIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Stop Markers */}
      {batchData && batchData.rides.map((ride, idx) => (
        <Marker 
          key={`ride-${idx}`}
          position={[ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]]}
          icon={createStopIcon(ride.pickupOrder || idx + 1, idx === batchData.currentRideIndex)}
        />
      ))}
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

const MapUpdater = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, 16)
    }
  }, [position, map])
  return null
}

const ArrivedPage = () => {
  const navigate = useNavigate()
  const [rideData, setRideData] = useState(null)
  const [batchData, setBatchData] = useState(null)
  const [currentRideIndex, setCurrentRideIndex] = useState(0)

  useEffect(() => {
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

  const currentRide = batchData?.rides?.[currentRideIndex] || rideData

  const pickupCoords = currentRide?.pickupLocation?.coordinates
    ? [currentRide.pickupLocation.coordinates[1], currentRide.pickupLocation.coordinates[0]]
    : [28.6280, 77.3649]
  const position = pickupCoords

  // Extract route path if available
  const routePath = React.useMemo(() => {
    if (!batchData?.routePolyline?.coordinates) return null
    return batchData.routePolyline.coordinates.map(([lng, lat]) => [lat, lng])
  }, [batchData])

  return (
    <div className="relative h-screen flex flex-col bg-[#f0f0f5] animate-fade-in overflow-hidden">
      <div className="absolute inset-0 z-[1] w-full h-full">
        <MapContainer className="w-full h-full" center={position} zoom={16} scrollWheelZoom={true} zoomControl={false}>
          <MapContent 
            position={position} 
            routePath={routePath}
            batchData={batchData ? { ...batchData, currentRideIndex } : null}
          />
        </MapContainer>
      </div>

      <div className="relative z-[10] flex flex-col h-full pointer-events-none">
        <div className="flex items-center px-6 pt-12 pointer-events-auto">
          <button className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg" onClick={() => navigate('/customer-location')}>
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-extrabold text-gray-800">Arrived At Customer Location</h1>
          </div>
        </div>

        <div className="mt-auto bg-white rounded-t-[40px] p-10 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col items-center pointer-events-auto">
          <div className="w-[120px] h-[120px] bg-primary rounded-full flex items-center justify-center mb-8 relative shadow-[0_15px_30px_rgba(242,148,0,0.4)]">
             {/* Droplet shape outer logic or just circle */}
             <Check size={46} className="text-white stroke-[4]" />
             {/* Custom Drop Shape Simulation */}
             <div className="absolute -bottom-2 w-10 h-10 bg-primary rotate-45 rounded-sm"></div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            {batchData ? `Arrived at Stop ${currentRideIndex + 1}` : 'Arrived At Customer Location'}
          </h2>
          <p className="text-sm font-bold text-gray-400 mb-2">
            {batchData ? `Pickup for ${currentRide?.employeeName || 'Employee'}` : (currentRide?.employeeName || getEmployeeName(currentRide?.employee_id))}
          </p>
          <p className="text-sm font-bold text-gray-400 mb-10">{currentRide?.pickupAddress || 'Loading location...'}</p>

          {batchData && (
            <p className="text-xs font-bold text-primary mb-4 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              {currentRideIndex + 1 < batchData.rides.length ? `Next Stop: ${batchData.rides[currentRideIndex + 1].employeeName}` : 'Final Leg: Heading to Office'}
            </p>
          )}

          <Button className="text-lg shadow-[0_10px_20px_rgba(242,148,0,0.3)] w-full py-5" onClick={() => navigate('/otp-verification')}>
            Ask for OTP
          </Button>

          {/* Floating map focus icon like in design */}
          <div className="absolute top-[-30px] right-6 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 pointer-events-auto">
              <Navigation size={24} className="text-primary fill-primary opacity-20" />
              <Navigation size={24} className="text-primary absolute top-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArrivedPage
