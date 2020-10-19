export const test = async (req, res, next) => {
  try {
    return res.status(404).json({
      message: 'not found'
    });
  } catch (e) {
    return next(e);
  }
};
