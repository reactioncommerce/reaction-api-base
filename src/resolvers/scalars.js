import { ObjectId } from 'mongodb';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

// parser for JSON type
function parseJSONLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parseJSONLiteral(field.value);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    default:
      return null;
  }
}

// define/export custom scalars
export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'A Date object',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      switch (ast.kind) {
        case Kind.INT:
        case Kind.FLOAT:
          return new Date(parseFloat(ast.value));
        default:
          return null;
      }
    }
  }),

  ObjID: new GraphQLScalarType({
    name: 'ObjID',
    description: 'Id String representation, based on Mongo Object Ids',
    parseValue(value) {
      return ObjectId(value);
    },
    serialize(value) {
      return value.toString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return ObjectId(ast.value);
      }
      return null;
    }
  }),

  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'A JSON object',
    parseValue(value) {
      return value;
    },
    serialize(value) {
      return value;
    },
    parseLiteral: parseJSONLiteral
  })
};
