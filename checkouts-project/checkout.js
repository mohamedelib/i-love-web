import express from "express";
import { Liquid } from "liquidjs";

const app = express();
const engine = new Liquid({ views: "./views", extname: ".liquid" });

app.engine("liquid", engine.express());
app.set("view engine", "liquid");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const BIN_ID = "69d60fc136566621a88d8adf";
const API_KEY = "$2a$10$5WomvhjGdR5ltkoUmQEtsOS5uEuiGqKMJctv8Y0QHD4ZeeccKPpXK";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.get("/checkouts", async (req, res) => {
  const data = await fetch(BIN_URL, {
    headers: { "X-Master-Key": API_KEY },
  }).then((r) => r.json());

  const checkouts = data.record.checkouts
    .map((checkout, index) => ({
      ...checkout,
      index,
    }))
    .reverse();

  res.render("checkouts", { checkouts });
});

app.get("/checkouts/nieuw", (req, res) => {
  res.render("checkout-form");
});

app.post("/checkouts", async (req, res) => {
  const { datum, reflectie } = req.body;

  const current = await fetch(BIN_URL, {
    headers: { "X-Master-Key": API_KEY },
  }).then((r) => r.json());

  const checkouts = current.record.checkouts;
  checkouts.push({ datum, reflectie });

  await fetch(BIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify({ checkouts }),
  });

  res.redirect("/checkouts");
});

app.post("/checkouts/delete", async (req, res) => {
  const { index } = req.body;

  const current = await fetch(BIN_URL, {
    headers: { "X-Master-Key": API_KEY },
  }).then((r) => r.json());

  const checkouts = current.record.checkouts;
  checkouts.splice(index, 1);

  await fetch(BIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify({ checkouts }),
  });

  res.redirect("/checkouts");
});

app.listen(3000, () => console.log("http://localhost:3000/checkouts"));
