const isAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(401).json({
        Message: "You are not Authorized to perform this operation",
      });
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = isAdmin
