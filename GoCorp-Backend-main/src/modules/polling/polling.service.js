import { RideRequest } from "../ride/ride.model.js";
import { Clustering } from "./clustering.model.js";
import { Batched } from "./batched.model.js";
import { getDistance } from "../../utils/geo.js";
import ApiError from "../../utils/ApiError.js";
import { getEmployeesInRideGroup } from "../ride/ride.service.js";
import * as turf from "@turf/turf";
import { getRoute } from "../../utils/osrm.js";
import mongoose from "mongoose";

const ROUTE_BUFFER_METERS = 500;
const TIME_WINDOW_MINUTES = 10;
const MAX_CLUSTER_SIZE = 4;
const BASE_FARE = 40; // Base fare in ₹
const PER_KM_RATE = 12; // Rate per km in ₹

/**
 * Calculate total distance from a LineString polyline (in km)
 */
const calculatePolylineDistance = (polyline) => {
  try {
    if (!polyline || !polyline.coordinates || polyline.coordinates.length < 2) {
      return 0;
    }

    const lineString = turf.lineString(polyline.coordinates);
    const distanceInKm = turf.length(lineString, { units: "kilometers" });
    return distanceInKm;
  } catch (error) {
    console.error("Error calculating polyline distance:", error);
    return 0;
  }
};

/**
 * Calculate estimated fare based on distance
 * Formula: fare = baseFare + (distance * perKmRate)
 * Returns fare as integer
 */
const calculateEstimatedFare = (distanceInKm) => {
  return Math.round(BASE_FARE + (distanceInKm * PER_KM_RATE));
};

/**
 * Calculate the shortest distance from a point to a polyline route (in meters)
 */
const getDistanceToRoute = (pointCoords, polyline) => {
  try {
    if (!polyline || !polyline.coordinates || polyline.coordinates.length < 2) return Infinity;
    const line = turf.lineString(polyline.coordinates);
    const pt = turf.point(pointCoords);
    const nearest = turf.nearestPointOnLine(line, pt);
    return nearest.properties.dist * 1000; // km to meters
  } catch (error) {
    console.error("Error in getDistanceToRoute:", error);
    return Infinity;
  }
};

/**
 * STEP 2 (REFINED): Find the 1st point where new ride's route joins/diverges from the cluster's route
 */
export const findFirstContactPoint = (newRoutePolyline, clusterPolyline, thresholdMeters = 200, fromEnd = false) => {
  try {
    if (!newRoutePolyline || !newRoutePolyline.coordinates || newRoutePolyline.coordinates.length < 2) return null;
    if (!clusterPolyline || !clusterPolyline.coordinates || clusterPolyline.coordinates.length < 2) return null;

    const clusterLine = turf.lineString(clusterPolyline.coordinates);
    const coordinates = fromEnd ? [...newRoutePolyline.coordinates].reverse() : newRoutePolyline.coordinates;

    // Iterate through points of the new route to find the first one near the cluster line
    for (const coords of coordinates) {
      const point = turf.point(coords);
      const nearestPoint = turf.nearestPointOnLine(clusterLine, point);
      const distance = nearestPoint.properties.dist * 1000; // km to meters

      if (distance <= thresholdMeters) {
        return coords; // This is our join/divergence point
      }
    }

    return null;
  } catch (error) {
    console.error("Error in findFirstContactPoint:", error);
    return null;
  }
};

/**
 * Check if two timestamps are within time window
 */
export const isWithinTimeWindow = (time1, time2, windowMinutes = TIME_WINDOW_MINUTES) => {
  const diff = Math.abs(new Date(time1).getTime() - new Date(time2).getTime());
  return diff <= windowMinutes * 60 * 1000;
};

/**
 * Check if two drop locations are similar (within 100 meters)
 */
export const isSimilarDropLocation = (drop1, drop2, threshold = 200) => {
  const distance = getDistance(drop1, drop2);
  return distance <= threshold;
};

/**
 * Check if two pickup locations are similar (within 100 meters)
 */
export const isSimilarPickupLocation = (pickup1, pickup2, threshold = 200) => {
  const distance = getDistance(pickup1, pickup2);
  return distance <= threshold;
};

/**
 * MAIN CLUSTERING LOGIC: can_cluster function
 * Symmetric logic for To Office and From Office rides
 */
export const can_cluster = async (newRide, existingCluster) => {
  try {
    const newPickup = newRide.pickup_location.coordinates;
    const newDrop = newRide.drop_location.coordinates;
    const newTime = newRide.scheduled_at;

    // Get the first ride of the cluster to check direction and similarity
    const firstRideId = existingCluster.ride_ids[0];
    const firstRide = await RideRequest.findById(firstRideId);
    if (!firstRide) return false;

    const existingPickup = firstRide.pickup_location.coordinates;
    const existingDrop = firstRide.drop_location.coordinates;
    const existingTime = existingCluster.scheduled_at;
    
    // Determine direction
    const isToOffice = firstRide.destination_type === "OFFICE";

    // Check time window first (required for both directions)
    if (!isWithinTimeWindow(newTime, existingTime)) {
      return false;
    }

    if (isToOffice) {
      // TO OFFICE: Primary check is the shared destination (Office)
      // Logic: Relaxed drop check for office rides (trust office_id from query)
      const distToDrop = getDistance(newDrop, existingDrop);
      if (distToDrop > 1000) { // Only reject if they are in different offices entirely (>1km)
        return false;
      }

      // CONDITION 1: Similar pickup location
      if (isSimilarPickupLocation(newPickup, existingPickup)) {
        console.log(`[Clustering] Match found (TO OFFICE): Ride ${newRide._id} has similar pickup as cluster ${existingCluster._id}`);
        return true;
      }

      // CONDITION 2: Route Intersection
      if (newRide.route_polyline && existingCluster.pickup_polyline) {
        const contactPoint = findFirstContactPoint(newRide.route_polyline, existingCluster.pickup_polyline, 200, false);
        if (contactPoint) {
          const distToNewPickup = getDistance(newPickup, contactPoint);
          if (distToNewPickup <= ROUTE_BUFFER_METERS) {
            console.log(`[Clustering] Match found (TO OFFICE): Route intersection found within ${ROUTE_BUFFER_METERS}m of pickup`);
            return true;
          }
        }
      }

      // CONDITION 3: Proximity Capture (Symmetric - Is New Pickup near Existing Route?)
      if (existingCluster.pickup_polyline) {
        const distToRoute = getDistanceToRoute(newPickup, existingCluster.pickup_polyline);
        if (distToRoute <= ROUTE_BUFFER_METERS) {
          console.log(`[Clustering] Match found (TO OFFICE): New pickup is near cluster route (dist: ${distToRoute.toFixed(0)}m)`);
          return true;
        }
      }

      // CONDITION 4: Proximity Capture (Symmetric - Is Existing Pickup near New Route?)
      if (newRide.route_polyline) {
        const distToNewRoute = getDistanceToRoute(existingPickup, newRide.route_polyline);
        if (distToNewRoute <= ROUTE_BUFFER_METERS) {
          console.log(`[Clustering] Match found (TO OFFICE): Existing cluster starts near new ride's route (dist: ${distToNewRoute.toFixed(0)}m)`);
          return true;
        }
      }
    } else {
      // FROM OFFICE (Office to Home): Primary check is the shared origin (Office)
      if (!isSimilarPickupLocation(newPickup, existingPickup)) {
        return false;
      }

      // CONDITION 1: Similar drop location (Home)
      if (isSimilarDropLocation(newDrop, existingDrop)) {
        console.log(`[Clustering] Match found (FROM OFFICE): Ride ${newRide._id} has similar drop as cluster ${existingCluster._id}`);
        return true;
      }

      // CONDITION 2: Route Divergence
      if (newRide.route_polyline && existingCluster.pickup_polyline) {
        const contactPoint = findFirstContactPoint(newRide.route_polyline, existingCluster.pickup_polyline, 200, true);
        if (contactPoint) {
          const distToNewDrop = getDistance(newDrop, contactPoint);
          if (distToNewDrop <= ROUTE_BUFFER_METERS) {
            console.log(`[Clustering] Match found (FROM OFFICE): Route divergence found within ${ROUTE_BUFFER_METERS}m of drop`);
            return true;
          }
        }
      }

      // CONDITION 3: Proximity Capture (Symmetric - Is New Drop near Existing Route?)
      if (existingCluster.pickup_polyline) {
        const distToRoute = getDistanceToRoute(newDrop, existingCluster.pickup_polyline);
        if (distToRoute <= ROUTE_BUFFER_METERS) {
          console.log(`[Clustering] Match found (FROM OFFICE): New drop is near cluster route (dist: ${distToRoute.toFixed(0)}m)`);
          return true;
        }
      }

      // CONDITION 4: Proximity Capture (Symmetric - Is Existing Drop near New Route?)
      if (newRide.route_polyline) {
        const distToNewRoute = getDistanceToRoute(existingDrop, newRide.route_polyline);
        if (distToNewRoute <= ROUTE_BUFFER_METERS) {
          console.log(`[Clustering] Match found (FROM OFFICE): Existing drop is near new ride's route (dist: ${distToNewRoute.toFixed(0)}m)`);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error in can_cluster:", error);
    return false;
  }
};

/**
 * Shared Helper: Update a group's logical order and polyline route
 * Used by merge operations to ensure the carpool is always optimized
 */
const updateGroupRouteAndOrder = async (rideIds, groupDoc, type = 'cluster') => {
  const allRides = await RideRequest.find({ _id: { $in: rideIds } });
  if (allRides.length === 0) return groupDoc;

  const firstRide = allRides[0];
  const isToOffice = firstRide.destination_type === "OFFICE";
  
  // We use firstRide's drop/pickup as the office reference depending on direction
  const officeCoords = isToOffice ? firstRide.drop_location.coordinates : firstRide.pickup_location.coordinates;
  
  let orderedRideIds, waypoints;

  if (isToOffice) {
    // TO OFFICE: Sort by pickup distance from office (Furthest first)
    const sortedRides = allRides.map(r => ({
      ride: r,
      distance: getDistance(r.pickup_location.coordinates, officeCoords)
    })).sort((a, b) => b.distance - a.distance);

    orderedRideIds = sortedRides.map(sr => sr.ride._id);
    waypoints = sortedRides.map(sr => sr.ride.pickup_location.coordinates);
    waypoints.push(officeCoords); // End at office
  } else {
    // FROM OFFICE: Sort by drop distance from office (Closest first)
    const sortedRides = allRides.map(r => ({
      ride: r,
      distance: getDistance(r.drop_location.coordinates, officeCoords)
    })).sort((a, b) => a.distance - b.distance);

    orderedRideIds = sortedRides.map(sr => sr.ride._id);
    waypoints = [officeCoords]; // Start at office
    waypoints.push(...sortedRides.map(sr => sr.ride.drop_location.coordinates));
  }

  const newPolyline = await getRoute(waypoints);
  const polylineObj = { type: "LineString", coordinates: newPolyline };
  const distanceInKm = calculatePolylineDistance(polylineObj);
  const estimatedFare = calculateEstimatedFare(distanceInKm);

  const Model = type === 'cluster' ? Clustering : Batched;
  const updateData = {
    ride_ids: orderedRideIds,
    pickup_polyline: polylineObj,
    current_size: allRides.length,
    batch_size: allRides.length,
    estimated_distance: distanceInKm,
    estimated_fare: estimatedFare
  };

  return await Model.findByIdAndUpdate(groupDoc._id, { $set: updateData }, { new: true });
};

/**
 * SECONDARY MERGE: Attempt to swallow other eligible clusters into this one
 * This prevents carpool fragmentation by consolidating groups in real-time
 */
export const attemptSecondaryMerge = async (primaryGroup, primaryType = 'cluster') => {
  try {
    const currentSize = primaryType === 'cluster' ? primaryGroup.current_size : (primaryGroup.batch_size || primaryGroup.ride_ids.length);
    if (currentSize >= MAX_CLUSTER_SIZE) return primaryGroup;

    // Find candidates in the same time window
    const scheduledTime = primaryGroup.scheduled_at;
    const startTime = new Date(scheduledTime.getTime() - TIME_WINDOW_MINUTES * 60 * 1000);
    const endTime = new Date(scheduledTime.getTime() + TIME_WINDOW_MINUTES * 60 * 1000);

    const [clusters, batches] = await Promise.all([
      Clustering.find({
        _id: { $ne: primaryGroup._id },
        office_id: primaryGroup.office_id,
        scheduled_at: { $gte: startTime, $lte: endTime },
        status: { $in: ["IN_CLUSTERING", "READY_FOR_BATCH"] },
      }),
      Batched.find({
        _id: { $ne: primaryGroup._id },
        office_id: primaryGroup.office_id,
        scheduled_at: { $gte: startTime, $lte: endTime },
        status: { $in: ["CREATED", "READY_FOR_ASSIGNMENT"] },
        batch_size: { $lt: MAX_CLUSTER_SIZE }
      })
    ]);

    const candidates = [
      ...clusters.map(c => ({ original: c, type: 'cluster', size: c.current_size })),
      ...batches.map(b => ({ original: b, type: 'batch', size: b.batch_size }))
    ];

    for (const candidate of candidates) {
      if (currentSize + candidate.size <= MAX_CLUSTER_SIZE) {
        // Treat candidate as a "Virtual Ride" for compatibility check
        const virtualRide = {
          _id: candidate.original._id,
          pickup_location: candidate.original.pickup_centroid || candidate.original.pickup_location,
          drop_location: candidate.original.drop_location,
          scheduled_at: candidate.original.scheduled_at,
          route_polyline: candidate.original.pickup_polyline,
          // Extract destination type from any ride in the candidate group
          destination_type: (await RideRequest.findById(candidate.original.ride_ids[0]))?.destination_type
        };

        if (await can_cluster(virtualRide, primaryGroup)) {
          console.log(`[Secondary Merge] Group ${candidate.original._id} swallowed by ${primaryGroup._id}`);
          
          const combinedRideIds = [...primaryGroup.ride_ids, ...candidate.original.ride_ids];
          
          // 1. Update swallowed rides' status and links
          const newStatus = primaryType === 'cluster' ? "IN_CLUSTERING" : "CLUSTERED";
          const linkUpdate = primaryType === 'cluster' 
            ? { cluster_id: primaryGroup._id, batch_id: null } 
            : { batch_id: primaryGroup._id, cluster_id: null };

          await RideRequest.updateMany(
            { _id: { $in: candidate.original.ride_ids } },
            { status: newStatus, ...linkUpdate }
          );

          // 2. Delete or mark swallowed group
          if (candidate.type === 'cluster') {
            await Clustering.findByIdAndDelete(candidate.original._id);
          } else {
            await Batched.findByIdAndDelete(candidate.original._id);
          }

          // 3. Update primary group with combined members and optimized route
          return await updateGroupRouteAndOrder(combinedRideIds, primaryGroup, primaryType);
        }
      }
    }

    return primaryGroup;
  } catch (error) {
    console.error("Error in attemptSecondaryMerge:", error);
    return primaryGroup;
  }
};

/**
 * Find best matching cluster for a new ride
 * Optimization: For size-2 rides, check size-2 clusters first, then size-1
 */
export const findBestCluster = async (newRide, officeId, scheduledAt) => {
  try {
    // Calculate time window: ±10 minutes
    const scheduledTime = new Date(scheduledAt);
    const timeWindowMinutes = 10;
    const startTime = new Date(scheduledTime.getTime() - timeWindowMinutes * 60 * 1000);
    const endTime = new Date(scheduledTime.getTime() + timeWindowMinutes * 60 * 1000);

    // Find existing clusters and batches for this office within time window
    const [clusters, batches] = await Promise.all([
      Clustering.find({
        office_id: officeId,
        scheduled_at: { $gte: startTime, $lte: endTime },
        status: { $in: ["IN_CLUSTERING", "READY_FOR_BATCH"] },
      }),
      Batched.find({
        office_id: officeId,
        scheduled_at: { $gte: startTime, $lte: endTime },
        status: { $in: ["CREATED", "READY_FOR_ASSIGNMENT"] },
        batch_size: { $lt: MAX_CLUSTER_SIZE } // Only if there is space
      })
    ]);

    // Normalize both into a compatible "group" format for sorting
    const availableGroups = [
      ...clusters.map(c => ({ original: c, type: 'cluster', size: c.current_size })),
      ...batches.map(b => ({ original: b, type: 'batch', size: b.batch_size }))
    ];

    if (availableGroups.length === 0) {
      return null;
    }

    const newRideSize = newRide.invited_employee_ids.length + 1;

    // Sort groups: prioritize by size compatibility
    let sortedGroups = [];
    if (newRideSize === 1) {
      sortedGroups = [
        ...availableGroups.filter((g) => g.size === 3),
        ...availableGroups.filter((g) => g.size === 2),
        ...availableGroups.filter((g) => g.size === 1),
      ];
    } else if (newRideSize === 2) {
      sortedGroups = [
        ...availableGroups.filter((g) => g.size === 2),
        ...availableGroups.filter((g) => g.size === 1),
      ];
    } else if (newRideSize === 3) {
      sortedGroups = availableGroups.filter((g) => g.size === 1);
    } else {
      return null;
    }

    // Check each group for compatibility
    for (const group of sortedGroups) {
      // Use can_cluster on the original document (works for both Batch and Cluster models)
      const canCluster = await can_cluster(newRide, group.original);
      if (canCluster) {
        return group; // Return the normalized group object
      }
    }

    return null;
  } catch (error) {
    console.error("Error in findBestCluster:", error);
    return null;
  }
};

/**
 * CASE 1: Single person, solo_preference = true
 * Skip clustering, send directly to Batched
 */
export const handleCase1_SoloPreference = async (ride) => {
  try {
    // Create route polyline
    const polyline = {
      type: "LineString",
      coordinates: await getRoute([ride.pickup_location.coordinates, ride.drop_location.coordinates]),
    };

    // Calculate distance and fare
    const distanceInKm = calculatePolylineDistance(polyline);
    const estimatedFare = calculateEstimatedFare(distanceInKm);

    // Create a batched record directly
    const batched = await Batched.create({
      office_id: ride.office_id,
      scheduled_at: ride.scheduled_at,
      ride_ids: [ride._id],
      batch_size: 1,
      pickup_centroid: ride.pickup_location,
      drop_location: ride.drop_location,
      pickup_polyline: polyline,
      estimated_distance: distanceInKm,
      estimated_fare: estimatedFare,
      status: "CREATED",
      metadata: {
        force_batched: false,
        reason: "Solo preference",
      },
    });

    // Update ride status
    await RideRequest.findByIdAndUpdate(ride._id, {
      status: "BOOKED_SOLO",
      batch_id: batched._id,
    });

    return { case: 1, batched_id: batched._id, cluster_id: null };
  } catch (error) {
    console.error("Error in handleCase1:", error);
    throw error;
  }
};

/**
 * Create a new cluster for a single booking (size 1-3)
 */
export const handleNewCluster = async (ride, officeId, scheduledAt) => {
  try {
    const employees = await getEmployeesInRideGroup(ride._id);

    // Create a new cluster
    const clustering = await Clustering.create({
      office_id: officeId,
      scheduled_at: scheduledAt,
      ride_ids: [ride._id],
      current_size: employees.length,
      pickup_centroid: ride.pickup_location,
      drop_location: ride.drop_location,
      pickup_polyline: {
        type: "LineString",
        coordinates: await getRoute([ride.pickup_location.coordinates, ride.drop_location.coordinates]),
      },
      status: "IN_CLUSTERING",
    });

    // Update ride status with Hard Link
    await RideRequest.findByIdAndUpdate(ride._id, {
      status: "IN_CLUSTERING",
      cluster_id: clustering._id
    });

    return { case: 2, cluster_id: clustering._id, batched_id: null, action: "new_cluster" };
  } catch (error) {
    console.error("Error in handleNewCluster:", error);
    throw error;
  }
};

/**
 * CASE 3: Unified Discovery and Merging for all non-solo-pref rides
 */
export const handleUnifiedGrouping = async (ride, officeId, scheduledAt) => {
  try {
    const rideSize = ride.invited_employee_ids.length + 1;
    const bestGroup = await findBestCluster(ride, officeId, scheduledAt);

    if (bestGroup) {
      if (bestGroup.type === 'cluster') {
        let mergedCluster = await mergeClusters(ride, bestGroup.original);

        // TRIGGER SECONDARY MERGE: Can this new cluster swallow others?
        mergedCluster = await attemptSecondaryMerge(mergedCluster, 'cluster');

        // If reached size 4, promote to batch
        if (mergedCluster.current_size === MAX_CLUSTER_SIZE) {
          const batched = await moveToBatched(mergedCluster, false, "Merged to max size");
          return { case: 3, cluster_id: null, batched_id: batched._id, action: "merged_and_batched" };
        }

        return { case: 3, cluster_id: mergedCluster._id, batched_id: null, action: "merged" };
      } else {
        // Merge directly into existing batch (Unified Pool)
        let updatedBatch = await mergeIntoBatch(ride, bestGroup.original);
        
        // TRIGGER SECONDARY MERGE: Can this batch swallow clusters?
        updatedBatch = await attemptSecondaryMerge(updatedBatch, 'batch');

        return { case: 3, cluster_id: null, batched_id: updatedBatch._id, action: "joined_batch" };
      }
    } else {
      // No group found? Create new cluster
      return await handleNewCluster(ride, officeId, scheduledAt);
    }
  } catch (error) {
    console.error("Error in handleUnifiedGrouping:", error);
    throw error;
  }
};


/**
 * CASE 6: Person with 3 invited (group size = 4)
 * Skip clustering, send directly to Batched
 */
export const handleCase6_GroupSize4 = async (ride) => {
  try {
    const employees = await getEmployeesInRideGroup(ride._id);

    // Create route polyline
    const polyline = {
      type: "LineString",
      coordinates: await getRoute([ride.pickup_location.coordinates, ride.drop_location.coordinates]),
    };

    // Calculate distance and fare
    const distanceInKm = calculatePolylineDistance(polyline);
    const estimatedFare = calculateEstimatedFare(distanceInKm);

    const batched = await Batched.create({
      office_id: ride.office_id,
      scheduled_at: ride.scheduled_at,
      ride_ids: [ride._id],
      batch_size: employees.length,
      pickup_centroid: ride.pickup_location,
      drop_location: ride.drop_location,
      pickup_polyline: polyline,
      estimated_distance: distanceInKm,
      estimated_fare: estimatedFare,
      status: "CREATED",
      metadata: {
        force_batched: false,
        reason: "Group size 4",
      },
    });

    await RideRequest.findByIdAndUpdate(ride._id, {
      status: "CLUSTERED", // Group is treated as a full carpool batch
      batch_id: batched._id,
    });

    return { case: 6, batched_id: batched._id, cluster_id: null };
  } catch (error) {
    console.error("Error in handleCase6:", error);
    throw error;
  }
};

/**
 * Merge a new ride into an existing cluster
 */
export const mergeClusters = async (newRide, existingCluster) => {
  try {
    // SOURCE-OF-TRUTH REFRESH: Fetch the absolute latest members from the DB
    const refreshedCluster = await Clustering.findById(existingCluster._id);
    if (!refreshedCluster) throw new ApiError(404, "Cluster lost during merge");

    const newEmployees = await getEmployeesInRideGroup(newRide._id);
    const newTotalSize = refreshedCluster.current_size + newEmployees.length;

    if (newTotalSize > MAX_CLUSTER_SIZE) {
      throw new ApiError(400, "Cannot merge: would exceed max cluster size");
    }

    // GHOST CLEANUP: If the new ride was accidentally in another cluster, remove it
    // This prevents "Split Groups" where different users see different clusters
    await Clustering.deleteMany({
      _id: { $ne: existingCluster._id },
      ride_ids: newRide._id
    });

    // Atomic Sync: Update members with the refreshed list
    const allRideIds = [...refreshedCluster.ride_ids, newRide._id].map(id => new mongoose.Types.ObjectId(id));

    console.log(`[Merge-Audit] Refreshing Cluster ${existingCluster._id}. Current members: ${refreshedCluster.ride_ids.length}. Adding User 2/3.`);

    await Promise.all([
      RideRequest.updateMany(
        { _id: { $in: allRideIds } },
        { status: "IN_CLUSTERING", cluster_id: existingCluster._id }
      ),
      // Individual hard-update for the joiner to ensure zero-lag sync
      RideRequest.findByIdAndUpdate(newRide._id, {
        status: "IN_CLUSTERING",
        cluster_id: existingCluster._id
      })
    ]);

    console.log(`[Clustering] Atomic sync completed for ${allRideIds.length} rides in cluster ${existingCluster._id}`);

    // Update group route and order using shared helper
    return await updateGroupRouteAndOrder(allRideIds, refreshedCluster, 'cluster');
  } catch (error) {
    console.error("Error in mergeClusters:", error);
    throw error;
  }
};

export const mergeIntoBatch = async (newRide, existingBatch) => {
  try {
    // SOURCE-OF-TRUTH REFRESH: Fetch the absolute latest batch state
    const refreshedBatch = await Batched.findById(existingBatch._id);
    if (!refreshedBatch) throw new ApiError(404, "Batch lost during merge");

    const newEmployees = await getEmployeesInRideGroup(newRide._id);
    const newTotalSize = refreshedBatch.batch_size + newEmployees.length;

    if (newTotalSize > MAX_CLUSTER_SIZE) {
      throw new ApiError(400, "Cannot merge: batch would exceed max size");
    }

    // Atomic Sync: Hard-link the joiner directly to the Batch
    const allRideIds = [...refreshedBatch.ride_ids, newRide._id].map(id => new mongoose.Types.ObjectId(id));

    console.log(`[Merge-Audit] Refreshing Batch ${existingBatch._id}. Current members: ${refreshedBatch.ride_ids.length}. Adding Joiner.`);

    await Promise.all([
      RideRequest.updateMany(
        { _id: { $in: allRideIds } },
        {
          status: "CLUSTERED",
          batch_id: existingBatch._id,
          cluster_id: null // Clear cluster link as we are now batched
        }
      ),
      RideRequest.findByIdAndUpdate(newRide._id, {
        status: "CLUSTERED",
        batch_id: existingBatch._id,
        cluster_id: null
      })
    ]);

    // Update group route and order using shared helper
    return await updateGroupRouteAndOrder(allRideIds, refreshedBatch, 'batch');
  } catch (error) {
    console.error("Error in mergeIntoBatch:", error);
    throw error;
  }
};

/**
 * Move a cluster to Batched
 */
export const moveToBatched = async (cluster, forceBatched = false, reason = null) => {
  try {
    // Ensure all ride_ids are unique ObjectIds to avoid duplication or type issues
    const uniqueRideIds = [...new Set(cluster.ride_ids.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

    // Calculate distance and fare from polyline
    const distanceInKm = calculatePolylineDistance(cluster.pickup_polyline);
    const estimatedFare = calculateEstimatedFare(distanceInKm);

    const batched = await Batched.create({
      office_id: cluster.office_id,
      scheduled_at: cluster.scheduled_at,
      ride_ids: uniqueRideIds,
      batch_size: uniqueRideIds.length,
      pickup_polyline: cluster.pickup_polyline,
      pickup_centroid: cluster.pickup_centroid,
      drop_location: cluster.drop_location,
      estimated_distance: distanceInKm,
      estimated_fare: estimatedFare,
      status: "CREATED",
      metadata: {
        force_batched: forceBatched,
        force_batch_reason: reason,
        clustering_id: cluster._id,
      },
    });

    // Update cluster status to indicate it has been promoted to a batch
    await Clustering.findByIdAndUpdate(cluster._id, {
      status: "BATCHED",
      batch_id: batched._id,
    });

    console.log(`[Batching] Promoting cluster ${cluster._id} to batch ${batched._id}`);
    console.log(`[Batching] Rides in batch: ${uniqueRideIds.join(", ")}`);
    console.log(`[Batching] Distance: ${distanceInKm.toFixed(2)} km | Fare: ₹${estimatedFare.toFixed(2)}`);

    // Update all rides in the batch to common 'CLUSTERED' status and sync IDs
    const updateResult = await RideRequest.updateMany(
      { _id: { $in: uniqueRideIds } },
      {
        status: "CLUSTERED",
        batch_id: batched._id,
        cluster_id: null
      }
    );

    console.log(`[Batching] Successfully updated ${updateResult.modifiedCount} rides to CLUSTERED for batch ${batched._id}.`);

    return batched;
  } catch (error) {
    console.error("Error in moveToBatched:", error);
    throw error;
  }
};


/**
 * Route a new ride request through the polling system
 */
export const routeRideRequest = async (ride) => {
  try {
    const rideSize = ride.invited_employee_ids.length + 1;
    const officeId = ride.office_id;
    const scheduledAt = ride.scheduled_at;

    // Instantly create its real road route polyline to office if it doesn't exist
    if (!ride.route_polyline || !ride.route_polyline.coordinates || ride.route_polyline.coordinates.length === 0) {
      console.log(`[Clustering] Generating initial road route for Ride ${ride._id}`);
      const coords = await getRoute([ride.pickup_location.coordinates, ride.drop_location.coordinates]);
      ride.route_polyline = {
        type: "LineString",
        coordinates: coords
      };
      await RideRequest.findByIdAndUpdate(ride._id, { route_polyline: ride.route_polyline });
    }

    // Case 1: Solo preference + size 1 → Direct to Batched
    if (rideSize === 1 && ride.solo_preference) {
      return await handleCase1_SoloPreference(ride);
    }

    // Unified Discovery path for all group sizes (1-3)
    if (rideSize < 4) {
      return await handleUnifiedGrouping(ride, officeId, scheduledAt);
    }

    // Case 6: Group size 4
    if (rideSize === 4) {
      return await handleCase6_GroupSize4(ride);
    }

    throw new ApiError(400, `Invalid ride size: ${rideSize}`);
  } catch (error) {
    console.error("Error in routeRideRequest:", error);
    throw error;
  }
};
