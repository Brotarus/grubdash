const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function validateOrderRequest(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    if (!deliverTo || deliverTo === "") {
        return next({
            status: 400,
            message: "Order must include a deliverTo field",
        });
    }

    if (!mobileNumber || mobileNumber === "") {
        return next({
            status: 400,
            message: "Order must include a mobileNumber field",
        });
    }

    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({
            status: 400,
            message: "Order must include at least one dish",
        });
    }

    for (let i = 0; i < dishes.length; i++) {
        const dish = dishes[i];
        const { name, description, price, quantity } = dish;
        if (quantity && (typeof quantity !== 'number') || quantity < 1 || !Number.isInteger(quantity)) {
            return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`,
            });
        } else if (!name || !description || !price || !quantity) {
            return next({
                status: 400,
                message: "Dish must include name, description, price, and quantity",
            });
        }
    }

    next(); // Proceed to the next middleware if validation passes
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (!foundOrder) {
        return next({
            status: 404,
            message: `Order not found: ${orderId}`,
        });
    }
    res.locals.order = foundOrder;
    next();
}

function create(req, res, next) {
    const { deliverTo, mobileNumber, status, dishes } = req.body.data;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function list(req, res, next) {
    res.json({ data: orders });
}

function read(req, res, next) {
    res.json({ data: res.locals.order });
}

function update(req, res, next) {
    const { id, deliverTo, mobileNumber, status, dishes } = req.body.data;
    const orderToUpdate = res.locals.order;
    if (id && id !== req.params.orderId) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`,
        });
    }
    // Check if status is missing or empty
    if (!status || status == "") {
        return next({ status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered' });
    }
    
    // If the status is anything other than pending, preparing, or out-for-delivery send an error message
    if (status !== 'pending' && status !== 'preparing' && status !== 'out-for-delivery') {
        return next({ status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered' });
    }

    // If the status is delivered throw an error message that it cannot be changed
    if (status === 'delivered') {
        return next({ status: 400, message: 'A delivered order cannot be changed' });
    }
    orderToUpdate.deliverTo = deliverTo;
    orderToUpdate.mobileNumber = mobileNumber;
    orderToUpdate.status = status;
    orderToUpdate.dishes = dishes;
    res.json({ data: orderToUpdate });
}

function destroy(req, res, next) {
    const index = orders.findIndex((order) => order.id === req.params.orderId);
    if (orders[index].status !== "pending") {
        return next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`,
        });
    }
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    create: [validateOrderRequest, create],
    list,
    read: [orderExists, read],
    update: [orderExists, validateOrderRequest, update],
    delete: [orderExists, destroy],
};
