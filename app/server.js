const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// SQL Server configuration
const config = {
  server: '10.100.102.94',
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'YourStrongPassword123!'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// GET - Retrieve all records
app.get('/api/query', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .query('SELECT TOP 100 * FROM amitai ORDER BY ID DESC');
    
    await pool.close();
    
    res.json({
      success: true,
      data: result.recordset,
      message: `Retrieved ${result.recordset.length} records`
    });
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Add new record
app.post('/api/add', async (req, res) => {
  try {
    const { columns } = req.body;
    
    if (!columns || Object.keys(columns).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No data provided'
      });
    }

    let pool = await sql.connect(config);
    let request = pool.request();
    
    // Only insert Name - ID and EntryDate are auto-generated
    const name = columns.Name ? String(columns.Name) : '';
    request.input('Name', sql.NVarChar, name);
    
    const query = `INSERT INTO amitai (Name) VALUES (@Name)`;
    console.log('Insert Query:', query, 'Name:', name);
    await request.query(query);
    
    await pool.close();
    
    res.json({
      success: true,
      message: 'Record added successfully'
    });
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Update record
app.put('/api/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { columns } = req.body;
    
    if (!columns || Object.keys(columns).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No data provided'
      });
    }

    let pool = await sql.connect(config);
    let request = pool.request();
    
    // Only allow updating Name field
    const name = columns.Name ? String(columns.Name) : '';
    const recordId = parseInt(id, 10);
    
    if (isNaN(recordId)) {
      await pool.close();
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }
    
    request.input('Name', sql.NVarChar, name);
    request.input('ID', sql.Int, recordId);
    
    const query = `UPDATE amitai SET Name = @Name WHERE ID = @ID`;
    console.log('Update Query:', query, 'Name:', name, 'ID:', recordId);
    const result = await request.query(query);
    
    await pool.close();
    
    res.json({
      success: true,
      message: 'Record updated successfully',
      rowsAffected: result.rowsAffected[0]
    });
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE - Remove record
app.delete('/api/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recordId = parseInt(id, 10);
    
    if (isNaN(recordId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }
    
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('ID', sql.Int, recordId)
      .query('DELETE FROM amitai WHERE ID = @ID');
    
    await pool.close();
    
    res.json({
      success: true,
      message: 'Record deleted successfully',
      rowsAffected: result.rowsAffected[0]
    });
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test connection endpoint
app.get('/api/test', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    
    // Get table info
    const result = await pool.request()
      .query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'amitai' ORDER BY ORDINAL_POSITION`);
    
    // Try a simple query
    const data = await pool.request()
      .query('SELECT TOP 1 * FROM amitai');
    
    await pool.close();
    
    res.json({
      success: true,
      message: 'Connected to database successfully',
      tableColumns: result.recordset,
      sampleData: data.recordset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
