export const test = async (req, res, next) => {
  try {
    // const { q } = req.query;
    // const result = await uploadFiles(req.files, ['deliverySlip', 'selfie']);

    return res.status(404).json({
      message: 'Not Found'
    });
  } catch (e) {
    return next(e);
  }
};
