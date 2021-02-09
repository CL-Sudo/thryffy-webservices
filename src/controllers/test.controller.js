export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
