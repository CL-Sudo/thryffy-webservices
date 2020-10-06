export const test = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
