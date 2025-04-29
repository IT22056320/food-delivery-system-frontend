export async function registerUser(data) {
  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Registration failed")
  return res.json()
}

export async function loginUser(data) {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Login failed")
  return res.json()
}

export async function logoutUser() {
  const res = await fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Logout failed")
  return res.json()
}

export async function getUserOrders() {
  try {
    const res = await fetch("http://localhost:5002/api/orders", {
      credentials: "include",
    })

    let realOrders = []
    if (res.ok) {
      realOrders = await res.json()
      console.log("Real orders fetched:", realOrders)
    } else {
      console.warn("Failed to fetch real orders, using only sample orders")
    }

    // Get sample orders
    const sampleOrders = getSampleOrders()

    // Combine real and sample orders
    const combinedOrders = [...realOrders, ...sampleOrders]

    // Sort by creation date (newest first)
    combinedOrders.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))

    return combinedOrders
  } catch (error) {
    console.error("Error fetching user orders:", error)
    // Return only sample orders if there's an error
    return getSampleOrders()
  }
}

function getSampleOrders() {
  // Generate a random ID
  const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  // Current time
  const now = new Date()

  // Create timestamps for different times
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  return [
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "Upali's by Nawaloka",
        address: "65 Dr C.W.W Kannangara Mawatha, Colombo 00700",
        coordinates: {
          lat: 6.9271,
          lng: 79.8612,
        },
      },
      items: [
        { name: "Chicken Kottu", price: 850, quantity: 2 },
        { name: "Egg Hoppers", price: 200, quantity: 4 },
        { name: "Mango Juice", price: 350, quantity: 2 },
      ],
      total_price: 2650,
      status: "OUT_FOR_DELIVERY",
      delivery_address: "42 Galle Face Terrace, Colombo 00300",
      delivery_coordinates: {
        lat: 6.9344,
        lng: 79.8428,
      },
      created_at: oneHourAgo.toISOString(),
      estimated_delivery_time: new Date(now.getTime() + 20 * 60 * 1000).toISOString(),
      is_demo: true,
    },
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "Ministry of Crab",
        address: "Old Dutch Hospital, 04 Hospital St, Colombo 00100",
        coordinates: {
          lat: 6.9356,
          lng: 79.8419,
        },
      },
      items: [
        { name: "Garlic Chilli Crab", price: 6500, quantity: 1 },
        { name: "Prawn Rice", price: 1200, quantity: 2 },
        { name: "Coconut Crème Brûlée", price: 850, quantity: 2 },
      ],
      total_price: 10600,
      status: "PREPARING",
      delivery_address: "36 Alfred House Gardens, Colombo 00300",
      delivery_coordinates: {
        lat: 6.9123,
        lng: 79.8546,
      },
      created_at: twoHoursAgo.toISOString(),
      estimated_delivery_time: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
      is_demo: true,
    },
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "Kaema Sutra",
        address: "Shangri-La Hotel, 1 Galle Face, Colombo 00200",
        coordinates: {
          lat: 6.9277,
          lng: 79.8449,
        },
      },
      items: [
        { name: "Crab Curry", price: 2800, quantity: 1 },
        { name: "Pol Roti", price: 150, quantity: 4 },
        { name: "Watalappan", price: 650, quantity: 2 },
      ],
      total_price: 4850,
      status: "CONFIRMED",
      delivery_address: "25 Bagatalle Road, Colombo 00300",
      delivery_coordinates: {
        lat: 6.9003,
        lng: 79.8624,
      },
      created_at: fourHoursAgo.toISOString(),
      estimated_delivery_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      is_demo: true,
    },
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "Isso",
        address: "2 Sulaiman Terrace, Colombo 00500",
        coordinates: {
          lat: 6.9097,
          lng: 79.8645,
        },
      },
      items: [
        { name: "Prawn Curry Rice", price: 1500, quantity: 2 },
        { name: "Devilled Prawns", price: 1800, quantity: 1 },
        { name: "Lime Juice", price: 300, quantity: 2 },
      ],
      total_price: 5400,
      status: "DELIVERED",
      delivery_address: "42 Ward Place, Colombo 00700",
      delivery_coordinates: {
        lat: 6.9112,
        lng: 79.8679,
      },
      created_at: oneDayAgo.toISOString(),
      estimated_delivery_time: new Date(oneDayAgo.getTime() + 50 * 60 * 1000).toISOString(),
      delivered_at: new Date(oneDayAgo.getTime() + 45 * 60 * 1000).toISOString(),
      is_demo: true,
    },
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "Nihonbashi",
        address: "11 Galle Face Terrace, Colombo 00300",
        coordinates: {
          lat: 6.9317,
          lng: 79.8464,
        },
      },
      items: [
        { name: "Sushi Platter", price: 4500, quantity: 1 },
        { name: "Miso Soup", price: 600, quantity: 2 },
        { name: "Green Tea Ice Cream", price: 750, quantity: 1 },
      ],
      total_price: 6450,
      status: "DELIVERED",
      delivery_address: "15 Dudley Senanayake Mawatha, Colombo 00800",
      delivery_coordinates: {
        lat: 6.9187,
        lng: 79.8736,
      },
      created_at: twoDaysAgo.toISOString(),
      estimated_delivery_time: new Date(twoDaysAgo.getTime() + 55 * 60 * 1000).toISOString(),
      delivered_at: new Date(twoDaysAgo.getTime() + 50 * 60 * 1000).toISOString(),
      is_demo: true,
    },
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "Burger's King",
        address: "35 Vajira Road, Colombo 00400",
        coordinates: {
          lat: 6.9154,
          lng: 79.8574,
        },
      },
      items: [
        { name: "Double Cheese Burger", price: 1200, quantity: 2 },
        { name: "French Fries", price: 450, quantity: 2 },
        { name: "Chocolate Milkshake", price: 550, quantity: 2 },
      ],
      total_price: 4400,
      status: "CANCELLED",
      delivery_address: "78 Horton Place, Colombo 00700",
      delivery_coordinates: {
        lat: 6.9067,
        lng: 79.8643,
      },
      created_at: twoDaysAgo.toISOString(),
      cancelled_at: new Date(twoDaysAgo.getTime() + 15 * 60 * 1000).toISOString(),
      cancellation_reason: "Restaurant was too busy to accept the order",
      is_demo: true,
    },
    {
      _id: "demo_" + generateId(),
      restaurant: {
        name: "The Lagoon",
        address: "Cinnamon Grand Hotel, 77 Galle Road, Colombo 00300",
        coordinates: {
          lat: 6.9172,
          lng: 79.8487,
        },
      },
      items: [
        { name: "Seafood Platter", price: 7500, quantity: 1 },
        { name: "Garlic Bread", price: 450, quantity: 2 },
        { name: "Fresh Fruit Juice", price: 650, quantity: 2 },
      ],
      total_price: 9700,
      status: "PENDING",
      delivery_address: "25 Barnes Place, Colombo 00700",
      delivery_coordinates: {
        lat: 6.9103,
        lng: 79.8662,
      },
      created_at: now.toISOString(),
      estimated_delivery_time: new Date(now.getTime() + 75 * 60 * 1000).toISOString(),
      is_demo: true,
    },
  ]
}
