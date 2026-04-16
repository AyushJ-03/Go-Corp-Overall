import axios from "axios";

export const getRoute = async (points) => {
  try {
    if (!points || points.length < 2) return [];

    const coords = points
      .map((p) => `${p[0]},${p[1]}`)
      .join(";");

    const primaryUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const fallbackUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
   
    const headers = {
      'User-Agent': 'GoCorp-Ride-App/1.0 (contact@ayush.example.com)',
      'Accept': 'application/json'
    };

    try {
      const res = await axios.get(primaryUrl, {
        timeout: 10000, // 10s for community instance
        headers
      });
      if (res.data.routes && res.data.routes.length > 0) {
        return res.data.routes[0].geometry.coordinates;
      }
    } catch (primaryErr) {
      console.warn("Primary OSRM failed, trying fallback:", primaryErr.message);
      const res = await axios.get(fallbackUrl, {
        timeout: 8000,
        headers
      });
      if (res.data.routes && res.data.routes.length > 0) {
        return res.data.routes[0].geometry.coordinates;
      }
    }

    return null;
  } catch (err) {
    console.error("OSRM error:", err.message);
    return null;
  }
};