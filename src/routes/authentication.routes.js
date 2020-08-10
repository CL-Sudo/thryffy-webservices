import Router from 'express';
import { adminSignIn, adminRevoke } from '@controllers';

const router = new Router();

router.post('/login', adminSignIn);
router.post('/revoke', adminRevoke);
router.post('/logout', (req, res) => {
  req.logout();
  res
    .status(200)
    .clearCookie(`${process.env.GLOBAL_APP_NAME}.admin.at`, {
      path: '/'
    })
    .clearCookie(`${process.env.GLOBAL_APP_NAME}.admin.rt`, {
      path: '/'
    })
    .json({ status: 'Success' });
});

export default router;
