const errorHandler = (err, req, res, next) => {

   let statusCode =
      res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
   let message = err.message || "Server Error";

  
   let error = { ...err };
   error.message = err.message;

   // Validation Error 
   if (err.name === "ValidationError") {
      statusCode = 400;
      const errors = Object.values(err.errors).map((val) => val.message);
      message = errors.join(", ");
   }

   //  Invalid ObjectId or malformed ID 
   if (err.name === "CastError") {
      statusCode = 404;
      message = "Resource not found or invalid ID format.";
   }

   //  Duplicate Key Error (MongoDB Code: 11000) 
   if (err.code && err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue || {}).join(", ");
      message = `Duplicate value entered for ${field}.`;
   }

   //  JWT Errors (Optional but essential for auth routes) 
   if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid or expired token. Please log in again.";
   }

   if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Session expired. Please log in again.";
   }

   //  Final Safe Logging 
   if (process.env.NODE_ENV !== "production") {
      console.error(`\n[${statusCode}] ${message}`);
      console.error(err.stack);
   } else {
      console.error(`[${statusCode}] ${message}`);
   }

   //  Response (Clean for Client) 
   res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
   });
};

module.exports = errorHandler;
