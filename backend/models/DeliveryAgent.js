const db = require('../config/db');

const DeliveryAgent = {
  getAll: (callback) => {
    const query = 'SELECT * FROM DeliveryAgent';
    db.query(query, callback);
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM DeliveryAgent WHERE agent_id = ?';
    db.query(query, [id], callback);
  },

  getByUserId: (userId, callback) => {
    const query = 'SELECT * FROM DeliveryAgent WHERE user_id = ?';
    db.query(query, [userId], callback);
  },

  getAvailable: (callback) => {
    const query = `
      SELECT da.* 
      FROM DeliveryAgent da 
      WHERE da.agent_id NOT IN (
        SELECT delivery_agent_id 
        FROM Orders 
        WHERE status IN ('picked_up') 
        AND delivery_agent_id IS NOT NULL
      ) OR da.agent_id IS NULL
    `;
    db.query(query, callback);
  },

  updateStatus: (agentId, isAvailable, callback) => {
    const query = 'UPDATE DeliveryAgent SET is_available = ? WHERE agent_id = ?';
    db.query(query, [isAvailable, agentId], callback);
  }
};

module.exports = DeliveryAgent;