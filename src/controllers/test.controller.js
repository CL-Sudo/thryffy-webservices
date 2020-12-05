export const test = async (req, res, next) => {
  try {
    return res.status(404).json({
      message: 'not found',
      payload: {}
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
