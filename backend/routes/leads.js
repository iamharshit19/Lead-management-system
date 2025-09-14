const express = require("express");
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

const router = express.Router();

// POST / (Create Lead) - Unchanged
router.post("/", auth, async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      createdBy: req.user.id,
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET / (Get All Leads with Pagination and Filtering) - UPDATED
router.get("/", auth, async (req, res) => {
  try {
    // --- 1. PAGINATION SETUP ---
    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    if (limit > 100) limit = 100; // Enforce max limit

    const skip = (page - 1) * limit;

    // --- 2. FILTERING LOGIC ---
    const filterQuery = { createdBy: req.user.id }; // Base query
    
    // Whitelist of fields that can be filtered
    const filterableFields = {
      // String fields
      name: 'string', email: 'string', company: 'string', city: 'string',
      // Enum fields
      status: 'enum', source: 'enum',
      // Number fields
      score: 'number', lead_value: 'number',
      // Date fields
      createdAt: 'date', last_activity_at: 'date',
      // Boolean field
      is_qualified: 'boolean'
    };

    for (const field in req.query) {
      if (filterableFields[field]) {
        const queryPart = req.query[field]; // e.g., { "gt": "50" } or "new"
        
        // Handle simple 'equals' for strings, enums
        if (typeof queryPart === 'string') {
          filterQuery[field] = queryPart;
          continue;
        }

        const [operator, value] = Object.entries(queryPart)[0];
        const fieldType = filterableFields[field];

        switch (operator) {
          // String operators
          case 'contains':
            if (fieldType === 'string') {
              filterQuery[field] = { $regex: value, $options: "i" };
            }
            break;
          // Enum operators
          case 'in':
            if (fieldType === 'enum') {
              filterQuery[field] = { $in: value.split(',') };
            }
            break;
          // Number operators
          case 'gt':
          case 'lt':
            if (fieldType === 'number') {
              filterQuery[field] = { [`$${operator}`]: Number(value) };
            }
            break;
          case 'between':
            if (fieldType === 'number' || fieldType === 'date') {
              const [start, end] = value.split(',');
              filterQuery[field] = {
                $gte: fieldType === 'number' ? Number(start) : new Date(start),
                $lte: fieldType === 'number' ? Number(end) : new Date(end)
              };
            }
            break;
          // Date operators
          case 'on':
             if (fieldType === 'date') {
                const dayStart = new Date(value);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(value);
                dayEnd.setHours(23, 59, 59, 999);
                filterQuery[field] = { $gte: dayStart, $lte: dayEnd };
            }
            break;
          case 'before':
            if (fieldType === 'date') filterQuery[field] = { $lt: new Date(value) };
            break;
          case 'after':
            if (fieldType === 'date') filterQuery[field] = { $gt: new Date(value) };
            break;
          // Boolean operators (only 'equals' is relevant)
          case 'equals':
             if (fieldType === 'boolean') {
                filterQuery[field] = value === 'true';
             } else if (fieldType === 'number') {
                filterQuery[field] = Number(value);
             } else {
                filterQuery[field] = value;
             }
             break;
        }
      }
    }

    // --- 3. DATABASE QUERY ---
    const total = await Lead.countDocuments(filterQuery);
    const leads = await Lead.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // --- 4. RESPONSE ---
    res.json({
      data: leads,
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit) || 1, // Ensure totalPages is at least 1
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /:id (Get Lead by ID) - Unchanged
router.get("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /:id (Update Lead) - Unchanged
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

// DELETE /:id (Delete Lead) - Unchanged
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