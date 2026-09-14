export const createAlertController = (dataStore) => ({
  getAllAlerts: (req, res) => {
    try {
      const { status } = req.query;
      const alerts = dataStore.getAlerts(status);
      res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  acknowledgeAlert: (req, res) => {
    try {
      const { id } = req.params;
      const { operator } = req.body;
      const alert = dataStore.acknowledgeAlert(id, operator);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.json({ success: true, message: 'Alert acknowledged', data: alert });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  resolveAlert: (req, res) => {
    try {
      const { id } = req.params;
      const { operator } = req.body;
      const alert = dataStore.resolveAlert(id, operator);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.json({ success: true, message: 'Alert resolved', data: alert });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});
