import Multer from 'multer';

const upload = Multer({});

export const deliverySlipUploads = upload.fields([{ name: 'deliverySlip' }]);
