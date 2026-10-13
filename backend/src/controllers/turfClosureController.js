import TurfClosure from "../models/TurfClosure.js";
import Turf from "../models/Turf.js";

// Add a closure/holiday
export const createClosure = async (req, res) => {
  try {
    const {
      turfId,
      date,
      reason
    } = req.body;

    // Validate required fields
    if (!turfId || !date) {
      return res.status(400).json({
        success: false,
        message: "Turf and date are required."
      });
    }

    // Check turf exists
    const turf = await Turf.findById(turfId);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found."
      });
    }

    // Check owner permission
    if (
      req.user.role !== "admin" &&
      turf.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own turf."
      });
    }

    // Check if closure already exists
    const existingClosure =
      await TurfClosure.findOne({
        turf: turfId,
        date
      });

    if (existingClosure) {
      return res.status(400).json({
        success: false,
        message: "This turf is already closed on this date."
      });
    }

    // Create closure
    const closure = await TurfClosure.create({
      turf: turfId,
      date,
      reason:
        reason?.trim() ||
        "Turf unavailable"
    });

    return res.status(201).json({
      success: true,
      message: "Turf closure added successfully.",
      closure
    });

  } catch (error) {
    console.error(
      "Create closure error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add turf closure."
    });
  }
};


// Get closures for a particular turf
export const getTurfClosures = async (
  req,
  res
) => {
  try {
    const { turfId } = req.params;

    const closures =
      await TurfClosure.find({
        turf: turfId
      }).sort({
        date: 1
      });

    return res.json({
      success: true,
      closures
    });

  } catch (error) {
    console.error(
      "Get closures error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load turf closures."
    });
  }
};


// Delete a closure
export const deleteClosure = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const closure =
      await TurfClosure.findById(id);

    if (!closure) {
      return res.status(404).json({
        success: false,
        message: "Closure not found."
      });
    }

    // Find the turf
    const turf =
      await Turf.findById(closure.turf);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found."
      });
    }

    // Check owner permission
    if (
      req.user.role !== "admin" &&
      turf.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own turf."
      });
    }

    await TurfClosure.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Turf closure removed successfully."
    });

  } catch (error) {
    console.error(
      "Delete closure error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove turf closure."
    });
  }
};