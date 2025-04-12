// Local type definitions (for documentation purposes in JSX)
// These mirror the backend types but are defined locally in the frontend

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} Restaurant
 * @property {string} _id
 * @property {string} name
 * @property {string} ownerId
 * @property {string} address
 * @property {string} phone
 * @property {string} email
 * @property {string} description
 * @property {string[]} cuisine
 * @property {Array<{day: string, open: string, close: string}>} openingHours
 * @property {boolean} isAvailable
 * @property {boolean} isVerified
 * @property {number} rating
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} _id
 * @property {string} restaurantId
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} category
 * @property {string} [image]
 * @property {boolean} isAvailable
 * @property {number} preparationTime
 * @property {string[]} ingredients
 * @property {{calories: number, protein: number, carbs: number, fat: number}} [nutritionalInfo]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Order
 * @property {string} _id
 * @property {string} restaurantId
 * @property {string} userId
 * @property {Array<{menuItemId: string, name: string, price: number, quantity: number}>} items
 * @property {number} totalAmount
 * @property {'pending'|'accepted'|'preparing'|'ready'|'out_for_delivery'|'delivered'|'cancelled'} status
 * @property {string} deliveryAddress
 * @property {string} [deliveryPerson]
 * @property {'pending'|'completed'|'failed'} paymentStatus
 * @property {'card'|'cash'|'wallet'} paymentMethod
 * @property {string} [specialInstructions]
 * @property {Date} [estimatedDeliveryTime]
 * @property {Date} [actualDeliveryTime]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// Export empty object since we're just using JSDoc for documentation
export default {}

