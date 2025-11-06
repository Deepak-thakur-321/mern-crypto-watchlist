const errorHandler = (err, req, res, next) => {
   console.error(`Error: ${err.message}`);

   let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

   if (err.name === 'ValidationError') {
      statusCode = 400;
   } else if (err.name === 'CastError') {
      statusCode = 404;
   }

   res.status(statusCode).json({
      success: false,
      message: err.message || 'Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
   });
};

module.exports = errorHandler;
