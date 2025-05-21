import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(coord1, coord2) {
  if (
    !coord1 ||
    !coord2 ||
    !coord1.lat ||
    !coord1.lng ||
    !coord2.lat ||
    !coord2.lng
  ) {
    console.warn("Invalid coordinates provided for distance calculation", {
      coord1,
      coord2,
    });
    return 0;
  }

  // Convert coordinates from degrees to radians
  const lat1 = (Number(coord1.lat) * Math.PI) / 180;
  const lon1 = (Number(coord1.lng) * Math.PI) / 180;
  const lat2 = (Number(coord2.lat) * Math.PI) / 180;
  const lon2 = (Number(coord2.lng) * Math.PI) / 180;

  // Haversine formula
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers
  const r = 6371;

  // Calculate distance
  return c * r;
}

/**
 * Calculate delivery fee based on distance and order total
 * @param {number} distance - Distance in kilometers
 * @param {number} orderTotal - Order subtotal
 * @returns {Object} Delivery fee details
 */
export function calculateDeliveryFee(distance, orderTotal) {
  // Default values if calculation fails
  if (
    typeof distance !== "number" ||
    isNaN(distance) ||
    typeof orderTotal !== "number" ||
    isNaN(orderTotal)
  ) {
    console.warn("Invalid inputs for delivery fee calculation", {
      distance,
      orderTotal,
    });
    return {
      fee: 2.99,
      baseFee: 1.99,
      distanceFee: 1.0,
      discount: 0,
      formula: "Default fee (calculation failed)",
    };
  }

  // Base fee
  const baseFee = 1.99;

  // Distance-based fee: $0.50 per km, starting after the first km
  const distanceThreshold = 1; // km
  const distanceRate = 0.5; // $ per km
  const distanceFee = Math.max(
    0,
    (distance - distanceThreshold) * distanceRate
  );

  // Round to 2 decimal places
  const roundedDistanceFee = Math.round(distanceFee * 100) / 100;

  // Calculate total fee
  let totalFee = baseFee + roundedDistanceFee;

  // Apply discount for large orders
  let discount = 0;
  if (orderTotal >= 50) {
    discount = totalFee * 0.2; // 20% discount for orders over $50
  } else if (orderTotal >= 30) {
    discount = totalFee * 0.1; // 10% discount for orders over $30
  }

  // Round discount to 2 decimal places
  const roundedDiscount = Math.round(discount * 100) / 100;

  // Apply discount
  totalFee -= roundedDiscount;

  // Minimum fee
  const minFee = 1.99;
  totalFee = Math.max(minFee, totalFee);

  // Maximum fee
  const maxFee = 7.99;
  totalFee = Math.min(maxFee, totalFee);

  // Round to 2 decimal places
  totalFee = Math.round(totalFee * 100) / 100;

  return {
    fee: totalFee,
    baseFee: baseFee,
    distanceFee: roundedDistanceFee,
    discount: roundedDiscount,
    formula: `Base fee ($${baseFee}) + Distance fee ($${roundedDistanceFee}) - Discount ($${roundedDiscount})`,
  };
}
