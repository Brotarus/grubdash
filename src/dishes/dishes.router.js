const router = require("express").Router();
const controller = require("./dishes.controller");
const notFound = require("../errors/notFound");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
    .route("/")
    .post(controller.create)
    .get(controller.list)
    .all(methodNotAllowed);

router
    .route("/:dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);

router.use(notFound);

module.exports = router;
