const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const user = req.user || null;
  res.render('home', { 
    title: 'Welcome to Our E-Shop',
    user 
  });
});

router.get('/home', (req, res) => {
  const user = req.user || null;
  res.render('home', { 
    title: 'Welcome to Our E-Shop',
    user 
  });
});

module.exports = router;