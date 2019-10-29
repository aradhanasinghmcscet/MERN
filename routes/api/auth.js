const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.err(err.message);
      res.status(500).send('Server Error');
    }
  } //res.send('Auth Route')
);

//@route    POST api/post
//@desc     Authenticate user and get token
//@access   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      //See if user exists if not send back error
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      //Get users gravatar
      const avatar = gravatar.url(email, {
        s: '25',
        r: 'pg',
        d: 'mm'
      });
      //Match user's email and password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Return jsonwebtoken
      //res.send('User registered');
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //console.log(req.body);
      //res.send('Users Route');
    } catch (err) {
      //console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
