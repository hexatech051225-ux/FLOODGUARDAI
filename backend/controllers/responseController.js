export const createResponseController = (dataStore) => ({
  getAllLogs: (req, res) => {
    try {
      const logs = dataStore.getResponseLogs();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  createLog: (req, res) => {
    try {
      const { stationId, stationName, actionType, actionTitle, details, team, operator, alertId } = req.body;
      if (!stationId || !actionTitle || !operator) {
        return res.status(400).json({ success: false, message: 'Missing required response log fields' });
      }

      const log = dataStore.addResponseLog({
        stationId,
        stationName: stationName || `Station ${stationId}`,
        actionType,
        actionTitle,
        details: details || '',
        team,
        operator,
        alertId
      });

      res.status(201).json({ success: true, message: 'Response action logged successfully', data: log });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});
