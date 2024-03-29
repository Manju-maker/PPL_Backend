var express = require("express");
var router = express.Router();
var userapi = require("../Api/userapi");
const { generateToken } = require("../Middleware/middleware.js");
const httpStatus = require("http-status");
const { sendMail } = require("../sendGrid/sendMails");

router.post("/registerUser", async function(req, res) {
    try {
        var result = await userapi.Adduser(req.body);
        if (result) {
            sendMail(result.email, result._id);
        }
        res.send([result]);
    } catch (err) {
        res.send(err);
    }
});

router.get("/verify/:email", async function(req, res) {
    try {
        var result = await userapi.verifyUser(req.params.email);
        if (result.length > 0) {
            res.status(httpStatus.OK).json({
                message: "Verified Successfully"
            });
        } else {
            res.status(httpStatus.NOT_FOUND).json({
                message: "Not verified"
            });
        }
    } catch (err) {
        res.send(err);
    }
});

router.post("/forgot", async function(req, res) {
    try {
        console.log("Forgot---", req.body);
        var result = await userapi.findData(
            { email: req.body.email },
            { email: 1 },
            { skip: 0, limit: 0, sort: {} }
        );

        res.send(result);
    } catch (err) {
        res.send(err);
    }
});

router.post("/reset", async function(req, res) {
    try {
        console.log("reset---", req.body);
        var result = await userapi.resetPassword(req.body);
        res.send(result);
    } catch (err) {
        res.send(err);
    }
});

router.post("/login", async function(req, res) {
    console.log("req.body login---", req.body);
    try {
        let token = generateToken(req.body);
        let query = {
            filter: { email: req.body.email, password: req.body.password },
            fields: { _id: 1, verify: 1, firstname: 1 },
            option: { skip: 0, limit: 0 }
        };
        let { filter, fields, option } = query;
        var result = await userapi.findData(filter, fields, option);
        console.log("result-", result);
        if (result.length > 0) {
            console.log(">>>>>Result>>>", result);
            res.send([...result, token]);
        } else {
            res.status(204).send({ data: "Invalid Username or Password" });
        }
    } catch (err) {
        res.send(err);
    }
});

module.exports = router;
