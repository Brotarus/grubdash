const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function validateDish(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    if (!name || name === "") {
        return next({
            status: 400,
            message: "Dish must include a name.",
        });
    }
    if (!description || description === "") {
        return next({
            status: 400,
            message: "Dish must include a description.",
        });
    }
    if (!image_url || image_url === "") {
        return next({
            status: 400,
            message: "Dish must include an image_url.",
        });
    }
    if (typeof price !== "number" || price <= 0) {
        return next({
            status: 400,
            message: "Dish must have a price that is a positive number.",
        });
    }
    next();
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (!foundDish) {
        return next({
            status: 404,
            message: `Dish not found: ${dishId}`,
        });
    }
    res.locals.dish = foundDish;
    next();
}

function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function list(req, res, next) {
    res.json({ data: dishes });
}

function read(req, res, next) {
    res.json({ data: res.locals.dish });
}

function update(req, res, next) {
    const { id, name, description, price, image_url } = req.body.data;
    const dishToUpdate = res.locals.dish;
    if (id && id !== req.params.dishId) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
        });
    }
    dishToUpdate.name = name;
    dishToUpdate.description = description;
    dishToUpdate.price = price;
    dishToUpdate.image_url = image_url;
    res.json({ data: dishToUpdate });
}

module.exports = {
    create: [validateDish, create],
    list,
    read: [dishExists, read],
    update: [dishExists, validateDish, update],
};
