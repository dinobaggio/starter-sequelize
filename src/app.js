import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import { ALLOW_ORIGINS } from './libs/constant';
import passport from './modules/passport';
import indexRouter from './routes';
import profileRouter from './routes/profile';
import userRouter from './routes/user';
import roleRouter from './routes/role';

const app = express();

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (ALLOW_ORIGINS.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(cors(corsOptionsDelegate));

// view engine setup
app.set('views', path.join(`${__dirname}/../`, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(`${__dirname}/../`, 'public')));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize({}));
// app.use(passport.session({}));

app.use('/v1/', indexRouter);
app.use('/v1/me/', profileRouter);
app.use('/v1/user/', userRouter);
app.use('/v1/role/', roleRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  return res.status(404).json({ message: 'Not found!' });
});

export default app;

