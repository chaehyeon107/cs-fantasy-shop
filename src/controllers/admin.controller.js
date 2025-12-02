const adminService = require("../services/admin.service");
const apiResponse = require("../utils/apiResponse");

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
    const item = await adminService.createItem(req.body);
    return apiResponse.success(res, item, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await adminService.updateItem(id, req.body);

    if (!updated)
      return apiResponse.error(res, "Item not found", 404);

    return apiResponse.success(res, updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteItem(id);

    if (!deleted)
      return apiResponse.error(res, "Item not found", 404);

    return apiResponse.success(res, deleted);
  } catch (err) {
    next(err);
  }
};
