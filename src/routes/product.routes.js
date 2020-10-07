import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Products } from '@models';

const controller = crud(Products);

const router = new Router();

router.get('/', controller.read);

export default router;
