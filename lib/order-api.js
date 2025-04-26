import api from "./api";

// Create an order
export async function createOrder(orderData) {
    return await api.order.post("/orders", orderData);
}

// Create a payment intent
export async function createPaymentIntent(amount, orderId) {
    return await api.order.post("/payments/create-payment-intent", {
        amount,
        metadata: {
            orderId,
        },
    });
}

// Confirm the payment (after success)
export async function confirmPayment(orderId, paymentIntentId) {
    return await api.order.post("/payments/confirm-payment", {
        orderId,
        paymentIntentId,
    });
}
