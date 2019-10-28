const express = require('express');
const router = express.Router();
//@route    POST api/users
//@desc     Test route/ Register user
//@access   Public
router.post('/', (req, res) => {
  console.log(req.body);
  res.send('Users Route');
});

module.exports = router;
