// backend/src/controllers/content.controller.js
const db = require('../db/database');
const fs = require('fs');
const path = require('path');

// Get all content
exports.getAllContent = (req, res) => {
  db.all('SELECT * FROM content ORDER BY section, key', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Group by section
    const groupedContent = rows.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = {
        value: item.value,
        type: item.type,
        id: item.id
      };
      return acc;
    }, {});
    
    res.json(groupedContent);
  });
};

// Get content by section
exports.getContentBySection = (req, res) => {
  const { section } = req.params;
  
  db.all('SELECT * FROM content WHERE section = ?', [section], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Convert to key-value object
    const sectionContent = rows.reduce((acc, item) => {
      acc[item.key] = {
        value: item.value,
        type: item.type,
        id: item.id
      };
      return acc;
    }, {});
    
    res.json(sectionContent);
  });
};

// Update content
exports.updateContent = (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ message: 'Content value is required' });
  }
  
  db.run(
    'UPDATE content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [value, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.json({ message: 'Content updated successfully', id });
    }
  );
};

// Update content image
exports.updateContentImage = (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  
  // Get current content to check if it's an image
  db.get('SELECT * FROM content WHERE id = ?', [id], (err, content) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (content.type !== 'image') {
      return res.status(400).json({ message: 'Content is not an image type' });
    }
    
    // Delete old image if it exists and is not a placeholder
    if (content.value && !content.value.includes('placeholder') && fs.existsSync(path.join(__dirname, '../../uploads', content.value))) {
      fs.unlinkSync(path.join(__dirname, '../../uploads', content.value));
    }
    
    // Update with new image path
    const imagePath = '/uploads/content/' + req.file.filename;
    
    db.run(
      'UPDATE content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [imagePath, id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.json({ 
          message: 'Content image updated successfully', 
          id,
          imagePath 
        });
      }
    );
  });
};

// Add new content
exports.addContent = (req, res) => {
  const { section, key, value, type = 'text' } = req.body;
  
  // Validate input
  if (!section || !key || value === undefined) {
    return res.status(400).json({ message: 'Section, key, and value are required' });
  }
  
  // Check if section/key combination already exists
  db.get('SELECT id FROM content WHERE section = ? AND key = ?', [section, key], (err, existing) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (existing) {
      return res.status(400).json({ message: 'Content with this section and key already exists' });
    }
    
    // Insert new content
    db.run(
      'INSERT INTO content (section, key, value, type) VALUES (?, ?, ?, ?)',
      [section, key, value, type],
      function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.status(201).json({
          id: this.lastID,
          section,
          key,
          value,
          type
        });
      }
    );
  });
};

// Delete content
exports.deleteContent = (req, res) => {
  const { id } = req.params;
  
  // Get content to check if it's an image
  db.get('SELECT * FROM content WHERE id = ?', [id], (err, content) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Delete associated image if it exists
    if (content.type === 'image' && content.value && !content.value.includes('placeholder')) {
      const imagePath = path.join(__dirname, '../../uploads', content.value);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete content from database
    db.run('DELETE FROM content WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.json({ message: 'Content deleted successfully' });
    });
  });
};