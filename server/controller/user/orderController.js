const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const user = require('../../modals/user');
const category = require('../../modals/categories');
const product = require('../../modals/product')
const passport = require('passport');
const nodemailer = require("nodemailer");
const crypto = require('crypto')
