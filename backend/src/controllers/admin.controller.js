const { validationResult } = require("express-validator");
const adminService = require("../services/admin.service");
const apiResponse = require("../utils/apiResponse");
const { sendError } = require("../utils/errorResponse");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, req, "VALIDATION_FAILED", {
      details: errors.array(),
    });
  }
  return null;
}

exports.getItems = async (req, res, next) => {
  try {
    const items = await adminService.getItems();
    return apiResponse.success(res, items);
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const item = await adminService.createItem(req.body);
    return apiResponse.success(res, item, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { id } = req.params;
    const updated = await adminService.updateItem(id, req.body);

    if (!updated) {
      return sendError(res, req, "ITEM_NOT_FOUND", {
        details: { id },
      });
    }

    return apiResponse.success(res, updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    const { id } = req.params;
    const deleted = await adminService.deleteItem(id);

    if (!deleted) {
      return sendError(res, req, "ITEM_NOT_FOUND", {
        details: { id },
      });
    }

    return apiResponse.success(res, deleted);
  } catch (err) {
    next(err);
  }
};
