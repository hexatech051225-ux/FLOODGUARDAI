import express from 'express';
import { createResponseController } from '../controllers/responseController.js';

export const createLogRoutes = (dataStore) => {
  const router = express.Router();
  const controller = createResponseController(dataStore);

  router.get('/', controller.getAllLogs);
  router.post('/', controller.createLog);

  return router;
};
