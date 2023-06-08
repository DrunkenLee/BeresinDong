const { Service, User, Order, UserDetail } = require("../models");

class OrderController {
  static filterGetOrder(options, req, res) {
    Order.findAll({
      where: {
        options,
      },
      include: {
        model: User,
        as: "Customer",
        include: { model: UserDetail },
      },
    });
  }

  static getAllOrders(req, res) {
    let { SessionRole, SessionUserId } = req.session;
    let { search, sort } = req.query;
    if (SessionRole == "vendor") {
      let error = "";
      Order.findAll({
        where: {
          VendorId: SessionUserId,
        },
        include: {
          model: User,
          as: "Customer",
          include: { model: UserDetail },
        },
      })
        .then((result) => {
          console.log(result);
          let error = "";
          res.render("vendor-orders", { result, error });
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    } else {
      Order.findAll({
        where: {
          CustomerId: SessionUserId,
        },
        include: {
          model: User,
          as: "Customer",
          include: { model: UserDetail },
        },
      })
        .then((result) => {
          let error = "";
          res.render("orders", { result, error });
        })
        .catch((err) => {
          console.log(err, SessionUserId);
          res.send(err);
        });
    }
  }

  static getAddOrders(req, res) {
    let error = "";
    Service.findAll()
      .then((data) => {
        let custId = req.session.SessionUserId;
        res.render("form-add-orders", { data, error, custId });
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static postAddOrders(req, res) {
    const CustomerId = req.session.SessionUserId;
    const { description } = req.body;
    let totalPrice = 0;

    if (!Array.isArray(req.body.services)) {
      let output = req.body.services.split("|")[1];
      totalPrice = output * 1;
    } else {
      const output = req.body.services.map((service) => service.split("|")[1]);
      for (let i in output) {
        totalPrice += output[i] * 1;
      }
    }

    let data;
    Service.findAll()
      .then((services) => {
        data = services;
        let custId = req.session.SessionUserId;
        return Order.create({
          CustomerId,
          description,
          totalPrice,
        });
      })
      .then((result) => {
        res.render("form-add-orders", { result, data });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }
}

module.exports = OrderController;
