/* eslint-env node */
/* eslint-disable no-console*/
'use strict';

var fs = require('fs');
var esprima = require('esprima');
// var estraverse = require('estraverse');

var filename = process.argv[2];
if (!filename) {
  console.error('you must specifcy a source file');
  process.exit(1);
}
console.log('Processing', filename);
var content = fs.readFileSync(filename, 'utf8');
var ast = esprima.parse(content);

console.log(JSON.stringify(ast, null, 2));


const scope = {};

const processNode = (node) => {
  if (Array.isArray(node)) {
    node.forEach(child => processNode(child));
    return null;
  }

  switch (node.type) {

    case 'Identifier':
      return scope[node.name];

    case 'VariableDeclaration':
      return processNode(node.declarations);

    case 'VariableDeclarator':
      scope[node.id.name] = processNode(node.init);
      return null;

    case 'BinaryExpression':
      switch (node.operator) {
        case '+':

          return processNode(node.left) + processNode(node.right);
      }
      return null;

    case 'ExpressionStatement':
      return processNode(node.expression);

    case 'AssignmentExpression':
      switch (node.operator) {
        // todo: handle more than identifier on left
        case '=':
          return scope[node.left.name] = processNode(node.right);
      }
      return null;

    case 'Literal':
      return node.value;

    case 'FunctionDeclaration':
      scope[node.id.name] = node.body;
      break;

    case 'BlockStatement':
      processNode(node.body);
      break;

    case 'CallExpression':
      processNode(processNode(node.callee));
      break;
  }
  return null;
};

processNode(ast.body);

// console.log('ast: \n' + JSON.stringify(ast, null, 2));
console.log(scope);





/*
 *

Processing src.js
ast:
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "a"
          },
          "init": {
            "type": "Literal",
            "value": 1,
            "raw": "1"
          }
        }
      ],
      "kind": "var"
    },
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "b"
          },
          "init": {
            "type": "BinaryExpression",
            "operator": "+",
            "left": {
              "type": "Identifier",
              "name": "a"
            },
            "right": {
              "type": "Literal",
              "value": 1,
              "raw": "1"
            }
          }
        }
      ],
      "kind": "var"
    }
  ],
  "sourceType": "script"
}

*/
