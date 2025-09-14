const express = require("express");
const Lead = require("../models/Lead");
const router = express.Router();

// GET /api/leads
router.get("/", async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      email,
      company,
      city,
      status,
      source,
      score_eq,
      score_gt,
      score_lt,
      score_between,
      lead_value_eq,
      lead_value_gt,
      lead_value_lt,
      lead_value_between,
      created_on,
      created_before,
      created_after,
      created_between,
      last_on,
      last_before,
      last_after,
      last_between,
      is_qualified
    } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 100); // cap at 100

    const filter = {};

    // === STRING FIELDS ===
    if (email) filter.email = { $regex: email, $options: "i" };
    if (company) filter.company = { $regex: company, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" };

    // === ENUMS ===
    if (status) filter.status = status;
    if (source) {
      // Allow multiple comma-separated
      filter.source = { $in: source.split(",") };
    }

    // === NUMBERS ===
    if (score_eq) filter.score = Number(score_eq);
    if (score_gt) filter.score = { ...(filter.score || {}), $gt: Number(score_gt) };
    if (score_lt) filter.score = { ...(filter.score || {}), $lt: Number(score_lt) };
    if (score_between) {
      const [min, max] = score_between.split(",").map(Number);
      filter.score = { $gte: min, $lte: max };
    }

    if (lead_value_eq) filter.lead_value = Number(lead_value_eq);
    if (lead_value_gt) filter.lead_value = { ...(filter.lead_value || {}), $gt: Number(lead_value_gt) };
    if (lead_value_lt) filter.lead_value = { ...(filter.lead_value || {}), $lt: Number(lead_value_lt) };
    if (lead_value_between) {
      const [min, max] = lead_value_between.split(",").map(Number);
      filter.lead_value = { $gte: min, $lte: max };
    }

    // === DATES ===
    if (created_on) filter.created_at = new Date(created_on);
    if (created_before) filter.created_at = { ...(filter.created_at || {}), $lt: new Date(created_before) };
    if (created_after) filter.created_at = { ...(filter.created_at || {}), $gt: new Date(created_after) };
    if (created_between) {
      const [start, end] = created_between.split(",").map(d => new Date(d));
      filter.created_at = { $gte: start, $lte: end };
    }

    if (last_on) filter.last_activity_at = new Date(last_on);
    if (last_before) filter.last_activity_at = { ...(filter.last_activity_at || {}), $lt: new Date(last_before) };
    if (last_after) filter.last_activity_at = { ...(filter.last_activity_at || {}), $gt: new Date(last_after) };
    if (last_between) {
      const [start, end] = last_between.split(",").map(d => new Date(d));
      filter.last_activity_at = { $gte: start, $lte: end };
    }

    // === BOOLEAN ===
    if (is_qualified !== undefined) {
      filter.is_qualified = is_qualified === "true";
    }

    // === QUERY DB ===
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    res.json({
      data: leads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
