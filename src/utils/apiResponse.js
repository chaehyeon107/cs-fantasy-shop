module.exports = {
  success(res, data = null, status = 200) {
    return res.status(status).json({
      success: true,
      data,
    });
  },

  error(res, message = "Server Error", status = 500) {
    return res.status(status).json({
      success: false,
      message,
    });
  },
};
