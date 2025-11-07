const errorHandler = (err, req, res, next) => {
      let statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
   let message = err.message || 'Server Error';
   let error = { ...err };

   // Mongoose Validation Error
   if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors).map(val => val.message).join(', ');
   }

   // Mongoose CastError (invalid ObjectId)
   if (error.name === 'CastError') {
      statusCode = 404;
      message = 'Resource not found or invalid ID';
   }

   // Duplicate key error (Code 11000)
   if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyValue).join(', ');
      message = `Duplicate value entered for ${field}.`;
   }

   // FINAL LOGGING //
   console.error(`[${statusCode}] ${message} Stack: ${process.env.NODE_ENV === 'development' ? err.stack : 'Hidden in Production'}`);

   res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
   });
};

module.exports = errorHandler;