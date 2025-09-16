const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static files (index.html, script.js, style.css)
app.use(express.static(__dirname));

// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/trainReservation")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Passenger Schema
const passengerSchema = new mongoose.Schema({
  name: String,
  seatNumber: Number,
  coach: String,
  fromStation: String,
  toStation: String,
  status: String // RAC or Confirmed
});
const Passenger = mongoose.model("Passenger", passengerSchema);

// ✅ Get all passengers
app.get("/api/passengers", async (req, res) => {
  try {
    const passengers = await Passenger.find();
    res.json(passengers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch passengers" });
  }
});

// ✅ Add passenger
app.post("/api/passengers", async (req, res) => {
  try {
    const passenger = new Passenger(req.body);
    await passenger.save();
    res.json({ success: true, passenger });
  } catch (err) {
    res.status(500).json({ error: "Failed to save passenger" });
  }
});

// ✅ Update train progress (when train reaches a station)
app.post("/api/stationReached", async (req, res) => {
  try {
    const { station } = req.body;

    // Free seats for passengers whose destination is this station
    const leavingPassengers = await Passenger.find({ toStation: station, status: "Confirmed" });

    for (let lp of leavingPassengers) {
      // Free their seat
      await Passenger.findByIdAndDelete(lp._id);

      // Give seat to first RAC passenger (if exists)
      const racPassenger = await Passenger.findOne({ status: "RAC" }).sort({ _id: 1 });
      if (racPassenger) {
        racPassenger.status = "Confirmed";
        racPassenger.seatNumber = lp.seatNumber;
        racPassenger.coach = lp.coach;
        await racPassenger.save();
      }
    }

    res.json({ success: true, message: `Station ${station} processed` });
  } catch (err) {
    res.status(500).json({ error: "Error updating station" });
  }
});

// ✅ Delete passenger manually
app.delete("/api/passengers/:id", async (req, res) => {
  try {
    await Passenger.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete passenger" });
  }
});

// ✅ Default route → load index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
