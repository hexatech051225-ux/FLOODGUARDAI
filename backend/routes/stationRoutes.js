import express from 'express';
import { createStationController } from '../controllers/stationController.js';

export const createStationRoutes = (dataStore) => {
  const router = express.Router();
  const controller = createStationController(dataStore);

  router.get('/', controller.getAllStations);
  router.get('/:id', controller.getStationById);
  router.get('/:id/history', controller.getStationHistory);

  return router;
};
