"use strict";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

function saveNameToTable(name) {
  const item = {};
  item.name = name;

  const params = {
    TableName: "GreetNames",
    Item: item
  };

  return dynamo.put(params).promise();
}

function getNameFromTable(name) {
  const params = {
    Key: {
      name: name
    },
    TableName: "GreetNames"
  };

  return dynamo
    .get(params)
    .promise()
    .then(response => {
      return response.Item;
    });
}

function sendResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
  return response;
}

module.exports.hello = async (event, context) => {
  var message = "Hello World";

  const name = event.queryStringParameters && event.queryStringParameters.name;

  if (name !== null) {
    message = "Hello " + name;

    saveNameToTable(name)
      .then(() => {
        sendResponse(200, message);
      })
      .catch(error => {
        console.log(error);
        sendResponse(500, error);
      });
  }
  sendResponse(200, message);
};

module.exports.wasGreeted = async (event, context) => {
  const name = event.queryStringParameters && event.queryStringParameters.name;

  if (name !== null) {
    getNameFromTable(name)
      .then(returnedName => {
        if (returnedName !== undefined) {
          sendResponse(200, "YES");
        } else {
          sendResponse(200, "NO");
        }
      })
      .catch(error => {
        sendResponse(500, error);
      });
  } else {
    sendResponse(400, "Define a name to query");
  }
};
