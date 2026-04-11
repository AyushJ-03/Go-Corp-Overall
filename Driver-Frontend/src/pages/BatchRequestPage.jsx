import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import CircularTimer from '../components/Dashboard/CircularTimer'
import Button from '../components/Button'
import { useRide } from '../context/RideContext'
import { blockAmount } from '../services/walletAPI'

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
const createStopIcon = (index) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-xs font-bold border-2 border-white shadow-md">
        ${index}
      </div>
    `,
    iconSize: [32, 32],
    className: 'custom-div-icon'
  })
}

// Map content component to handle fitBounds
const MapContent = ({ rides, officeLocation, routePoints }) => {
  const map = useMap()

  useEffect(() => {
    if (rides?.length > 0 && officeLocation) {
      const allCoordinates = [
        ...rides.map(r => [r.pickup_location.coordinates[1], r.pickup_location.coordinates[0]]),
        officeLocation
      ]
      const bounds = L.latLngBounds(allCoordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [rides, officeLocation, map])

  return (
    <>
      {rides?.map((ride, idx) => (
        <Marker 
          key={`ride-${idx}`} 
          position={[ride.pickup_location.coordinates[1], ride.pickup_location.coordinates[0]]}
          icon={createStopIcon(ride.pickup_order || idx + 1)}
        >
          <Popup>{getEmployeeName(ride.employee_id)}</Popup>
        </Marker>
      ))}
      {officeLocation && (
        <Marker position={officeLocation} icon={officeIcon}>
          <Popup>Office Destination</Popup>
        </Marker>
      )}
      {routePoints && routePoints.length > 0 && (
        <Polyline
          positions={routePoints}
          color="#f29400"
          weight={4}
          opacity={0.7}
        />
      )}
    </>
  )
}

// Helper function to extract employee name - ALWAYS returns a string
const getEmployeeName = (employee) => {
  try {
    if (!employee) return 'Employee'
    
    // If employee_id is a string (just the ID), return placeholder
    if (typeof employee === 'string') return 'Employee'
    
    // If it's an object, extract the name
    if (typeof employee === 'object') {
      if (employee.name && typeof employee.name === 'string') {
        return employee.name.trim() || 'Employee'
      }
      
      // Try first_name and last_name
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

const BatchRequestPage = () => {
  const navigate = useNavigate()
  const { activeBatch, clearActiveBatch, declineBatch } = useRide()

  // Default position if no batch data - use first ride's pickup location
  const position = activeBatch?.rides?.[0]?.pickup_location?.coordinates
    ? [activeBatch.rides[0].pickup_location.coordinates[1], activeBatch.rides[0].pickup_location.coordinates[0]]
    : [40.7128, -74.0060]

  const handleDecline = () => {
    if (activeBatch) {
      declineBatch(activeBatch._id)
    }
    navigate('/dashboard')
  }

  const handleAccept = async () => {
    // Create a structured batch object to pass to next page
    if (activeBatch) {
      try {
        console.log('=== BATCH ACCEPTANCE DEBUG ===');
        console.log('activeBatch object:', activeBatch);
        console.log('activeBatch.estimated_fare:', activeBatch.estimated_fare);
        console.log('activeBatch.estimated_distance:', activeBatch.estimated_distance);
        
        // Call backend to accept the batch
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/polling/batch/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('driverToken')}`
          },
          body: JSON.stringify({
            batch_id: activeBatch._id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to accept batch')
        }

        const data = await response.json()
        console.log('Batch accepted successfully:', data)

        // Block funds in wallet
        try {
          const officeId = activeBatch.office_id?._id || activeBatch.office_id;
          const estimatedFare = data.data?.estimated_fare || activeBatch.estimated_fare;
          
          if (officeId && estimatedFare) {
             console.log(`💰 Blocking wallet amount for office ${officeId}: ₹${estimatedFare}`);
             await blockAmount(officeId, estimatedFare, activeBatch._id);
          }
        } catch (walletError) {
          console.error('Wallet block failed:', walletError);
          // We could potentially stop here if wallet block is mandatory
          // but usually it's better to log it and continue if the ride itself is accepted
          // Unless the requirements explicitly say to fail the acceptance.
        }

        // Store batch data in localStorage
        const estimatedFareFromApi = data.data?.estimated_fare;
        const estimatedFareFromBatch = activeBatch?.estimated_fare;
        const estimatedFareValue = estimatedFareFromApi !== undefined ? estimatedFareFromApi : estimatedFareFromBatch;
        
        const estimatedDistanceFromApi = data.data?.estimated_distance;
        const estimatedDistanceFromBatch = activeBatch?.estimated_distance;
        const estimatedDistanceValue = estimatedDistanceFromApi !== undefined ? estimatedDistanceFromApi : estimatedDistanceFromBatch;
        
        const officeId = activeBatch.office_id?._id || activeBatch.office_id;

        localStorage.setItem('acceptedBatch', JSON.stringify({
          batchId: activeBatch._id,
          officeId: officeId, // Added missing officeId
          direction: activeBatch.direction,
          routePolyline: activeBatch.route_polyline || activeBatch.routePolyline,
          pickupPolyline: activeBatch.pickup_polyline || activeBatch.pickupPolyline,
          estimatedFare: estimatedFareValue,
          estimatedDistance: estimatedDistanceValue,
          officeLocation: activeBatch.office_id?.office_location?.coordinates
            ? [activeBatch.office_id.office_location.coordinates[1], activeBatch.office_id.office_location.coordinates[0]]
            : null,
          rides: activeBatch.rides.map(ride => ({
            rideId: ride._id,
            employeeName: getEmployeeName(ride.employee_id),
            pickupAddress: ride.pickup_address,
            pickupLocation: ride.pickup_location,
            dropAddress: ride.drop_address,
            dropLocation: ride.drop_location,
            pickupOrder: ride.pickup_order,
            otp: ride.otp,
            employee_id: ride.employee_id,
            officeId: officeId // Also store in individual rides for safety
          }))
        }))
        sessionStorage.setItem('currentRideIndex', '0')
        navigate('/customer-location')
      } catch (error) {
        console.error('Error accepting batch:', error)
        alert('Failed to accept batch. Please try again.')
      }
    }
  }

  const handleTimerComplete = () => {
    // Timer expired, decline the batch and go back to dashboard
    if (activeBatch) {
      declineBatch(activeBatch._id)
    }
    navigate('/dashboard')
  }

  // If no active batch, redirect to dashboard
  useEffect(() => {
    if (!activeBatch) {
      navigate('/dashboard')
    }
  }, [activeBatch, navigate])

  // Helper to calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Extract route points
  const routePoints = React.useMemo(() => {
    // Check both potential polyline field names
    const polyline = activeBatch?.route_polyline || activeBatch?.routePolyline || activeBatch?.pickup_polyline || activeBatch?.pickupPolyline
    
    if (!polyline?.coordinates) return null
    return polyline.coordinates.map(([lng, lat]) => [lat, lng])
  }, [activeBatch])

  // Calculate total trip distance and fare
  const fareData = React.useMemo(() => {
    if (!routePoints || routePoints.length < 2) return { distance: 0, fare: 0 }
    
    let totalDist = 0
    for (let i = 0; i < routePoints.length - 1; i++) {
      totalDist += calculateDistance(
        routePoints[i][0], routePoints[i][1],
        routePoints[i+1][0], routePoints[i+1][1]
      )
    }

    const baseFare = 40
    const perKmRate = 12
    const fare = baseFare + (totalDist * perKmRate)

    return {
      distance: totalDist.toFixed(1),
      fare: Math.round(fare)
    }
  }, [routePoints])

  // Get office location
  const officeLocation = React.useMemo(() => {
    if (!activeBatch?.office_id?.office_location?.coordinates) return null
    const [lng, lat] = activeBatch.office_id.office_location.coordinates
    return [lat, lng]
  }, [activeBatch])

  if (!activeBatch) {
    return null
  }

  return (
    <div className="relative h-screen flex flex-col bg-[#f0f0f5] animate-fade-in overflow-hidden">
      <div className="absolute inset-0 z-[1] w-full h-full grayscale-[0.8] contrast-[0.9] brightness-[1.1]">
        <MapContainer className="w-full h-full" center={position} zoom={15} scrollWheelZoom={true} zoomControl={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapContent 
            rides={activeBatch.rides}
            officeLocation={officeLocation}
            routePoints={routePoints}
          />
        </MapContainer>
      </div>

      <div className="relative z-[10] flex flex-col h-full bg-black/5">
        <div className="flex justify-center mt-32 gap-6 items-center">
          <CircularTimer initialTime={20} onComplete={handleTimerComplete} />
        </div>

        <div className="mt-auto bg-white rounded-t-[40px] p-8 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[20] max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-800">
              Batch Request
              <span className="ml-3 text-sm font-bold text-white bg-primary px-3 py-1 rounded-full inline-block">
                {activeBatch.rides?.length || 0} Passengers
              </span>
            </h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
              {activeBatch.scheduled_at ? new Date(activeBatch.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}
            </span>
          </div>

          {/* Fare and Distance Summary Card */}
          <div className="bg-orange-50 rounded-3xl p-6 mb-8 border border-orange-100 shadow-[0_10px_30px_rgba(242,148,0,0.08)] flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-1">Estimated Fare</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">₹</span>
                <h3 className="text-4xl font-black text-gray-900 tracking-tight">{fareData.fare}</h3>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Trip</p>
              <h4 className="text-xl font-black text-gray-800 tracking-tight">
                {fareData.distance} <span className="text-xs font-bold text-gray-400">KM</span>
              </h4>
            </div>
          </div>

          {/* Passengers List */}
          <div className="space-y-4 mb-8">
            {activeBatch.rides?.map((ride, index) => (
              <div key={ride._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {ride.pickup_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-extrabold text-gray-800 truncate">
                        {String(getEmployeeName(ride.employee_id))}
                      </h4>
                      <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-1 rounded whitespace-nowrap">
                        Stop {ride.pickup_order}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      📍 {ride.pickup_address || 'Pickup'}
                    </p>
                    <p className="text-xs text-gray-400">
                      📍 {ride.drop_address || 'Drop off'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Route Summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <p className="text-sm font-bold text-blue-900">
              Total Distance & Time
            </p>
            <p className="text-xs text-blue-700 mt-1">
              This batch covers all pickups and drop-offs efficiently
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="text-primary border-none shadow-none text-lg bg-gray-50" onClick={handleDecline}>
              Decline
            </Button>
            <Button className="text-lg shadow-[0_10px_20px_rgba(242,148,0,0.3)]" onClick={handleAccept}>
              Accept Batch
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BatchRequestPage
