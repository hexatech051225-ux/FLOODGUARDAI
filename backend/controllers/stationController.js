export const createStationController = (dataStore) => ({
  getAllStations: (req, res) => {
    try {
      const stations = dataStore.getStations();
      res.json({ success: true, count: stations.length, data: stations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getStationById: (req, res) => {
    try {
      const station = dataStore.getStationById(req.params.id);
      if (!station) {
        return res.status(404).json({ success: false, message: 'Station not found' });
      }
      res.json({ success: true, data: station });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getStationHistory: (req, res) => {
    try {
      const history = dataStore.getStationHistory(req.params.id);
      res.json({ success: true, count: history.length, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});
