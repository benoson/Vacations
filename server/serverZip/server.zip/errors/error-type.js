// Defining an ENUM, for specific errors definitions, and the data about the error

let ErrorType = {

  GENERAL_ERROR: {
    id: 1,
    httpCode: 600,
    message: "A General Error Has Occurred",
    isShowStackTrace: true,
  },

  USER_NAME_ALREADY_EXIST: {
    id: 2,
    httpCode: 601,
    message: "The Username Chosen Already Exists",
    isShowStackTrace: true,
  },

  UNAUTHORIZED: {
    id: 3,
    httpCode: 401,
    message: "Login Failed, Invalid Username or Password",
    isShowStackTrace: true,
  },

  THERE_ARE_NO_VACATIONS: {
      id: 4,
      httpCode: 204,
      message: "There Are No Vacations",
      isShowStackTrace: true,
  },

  USER_IS_NO_LONGER_LOGGED_IN: {
    id: 5,
    httpCode: 500,
    message: "You are no longer logged in, try relogging",
    isShowStackTrace: true,
  },

  USER_IS_NOT_AUTHORIZED: {
    id: 6,
    httpCode: 404,
    message: "You are not authorized to do that",
    isShowStackTrace: true,
  },

  INVALID_TOKEN: {
    id: 9,
    httpCode: 401,
    message: "Token Is Not Valid",
    isShowStackTrace: true,
  },

  USER_IS_ALREADY_LOGGED_IN: {
    id: 10,
    httpCode: 401,
    message: "You are already logged in. Try logging out first",
    isShowStackTrace: true,
  },

  BAD_IMAGE: {
    id: 11,
    httpCode: 406,
    message: "The New Image Is Not Acceptable. Please Try Another One",
    isShowStackTrace: true,
  },

  ACTION_NOT_ALLOWED: {
    id: 12,
    httpCode: 403,
    message: "You are not allowed to do that action",
    isShowStackTrace: true,
  },

};

module.exports = ErrorType;