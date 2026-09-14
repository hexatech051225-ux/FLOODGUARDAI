import express from 'express';
import { createAlertController } from '../controllers/alertController.js';

export const createAlertRoutes = (dataStore) => {
  const router = express.Router();
  const controller = createAlertController(dataStore);

  router.get('/', controller.getAllAlerts);
  router.patch('/:id/acknowledge', controller.acknowledgeAlert);
  router.patch('/:id/resolve', controller.resolveAlert);

  return router;
};
