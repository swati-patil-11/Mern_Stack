import Turf from "../models/Turf.js";


// ==========================================
// GET ALL TURFS
// ==========================================

export const getAllTurfs = async (req, res) => {
  try {
    const {
      search,
      sport,
      location,
      minPrice,
      maxPrice
    } = req.query;

    const filter = {
      isApproved: true
    };

    // Search by turf name or location
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i"
          }
        },
        {
          location: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    // Filter by sport
    if (sport) {
      filter.sports = {
        $regex: sport,
        $options: "i"
      };
    }

    // Filter by location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i"
      };
    }

    // Minimum price
    if (minPrice) {
      filter.pricePerHour = {
        ...filter.pricePerHour,
        $gte: Number(minPrice)
      };
    }

    // Maximum price
    if (maxPrice) {
      filter.pricePerHour = {
        ...filter.pricePerHour,
        $lte: Number(maxPrice)
      };
    }

    const turfs = await Turf.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: turfs.length,
      turfs
    });

  } catch (error) {

    console.error("Get turfs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch turfs"
    });
  }
};


// ==========================================
// GET SINGLE TURF
// ==========================================

export const getTurfById = async (req, res) => {
  try {

    const turf = await Turf.findById(req.params.id)
      .populate("owner", "name email phone");

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found"
      });
    }

    res.status(200).json({
      success: true,
      turf
    });

  } catch (error) {

    console.error("Get turf error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch turf"
    });
  }
};


// ==========================================
// CREATE TURF
// ==========================================

export const createTurf = async (req, res) => {
  try {

    const {
      name,
      description,
      location,
      sports,
      pricePerHour,
      image,
      facilities,
      openingTime,
      closingTime
    } = req.body;

    // Required fields
    if (
      !name ||
      !location ||
      !sports ||
      pricePerHour === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, location, sports and price are required"
      });
    }

    const turf = await Turf.create({
      name,
      description: description || "",
      location,
      sports,
      pricePerHour,
      image: image || "",
      facilities: facilities || [],
      openingTime: openingTime || "06:00",
      closingTime: closingTime || "23:00",

      // Owner comes from logged-in user
      owner: req.user._id
    });

    const populatedTurf =
      await turf.populate(
        "owner",
        "name email"
      );

    res.status(201).json({
      success: true,
      message: "Turf created successfully",
      turf: populatedTurf
    });

  } catch (error) {

    console.error("Create turf error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create turf"
    });
  }
};


// ==========================================
// UPDATE TURF
// ==========================================

export const updateTurf = async (req, res) => {
  try {

    const turf =
      await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found"
      });
    }

    // Owner can update only their own turf
    if (
      req.user.role !== "admin" &&
      turf.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this turf"
      });
    }

    const {
      name,
      description,
      location,
      sports,
      pricePerHour,
      image,
      facilities,
      openingTime,
      closingTime
    } = req.body;

    // Update only provided fields
    if (name !== undefined)
      turf.name = name;

    if (description !== undefined)
      turf.description = description;

    if (location !== undefined)
      turf.location = location;

    if (sports !== undefined)
      turf.sports = sports;

    if (pricePerHour !== undefined)
      turf.pricePerHour = pricePerHour;

    if (image !== undefined)
      turf.image = image;

    if (facilities !== undefined)
      turf.facilities = facilities;

    if (openingTime !== undefined)
      turf.openingTime = openingTime;

    if (closingTime !== undefined)
      turf.closingTime = closingTime;

    await turf.save();

    res.status(200).json({
      success: true,
      message: "Turf updated successfully",
      turf
    });

  } catch (error) {

    console.error("Update turf error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update turf"
    });
  }
};


// ==========================================
// DELETE TURF
// ==========================================

export const deleteTurf = async (req, res) => {
  try {

    const turf =
      await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found"
      });
    }

    // Owner can delete their own turf
    // Admin can delete any turf
    if (
      req.user.role !== "admin" &&
      turf.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this turf"
      });
    }

    await turf.deleteOne();

    res.status(200).json({
      success: true,
      message: "Turf deleted successfully"
    });

  } catch (error) {

    console.error("Delete turf error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete turf"
    });
  }
};