const express = require("express");
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

const router = express.Router();


router.post("/", auth, async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      createdBy: req.user.id, 
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, source, search } = req.query;

    const query = { createdBy: req.user.id };
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) query.name = { $regex: search, $options: "i" };

    const leads = await Lead.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({ message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
