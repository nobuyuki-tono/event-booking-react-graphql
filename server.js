const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(express.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
    type RootQuery {
       events: [String!]!
    }

    type RootMutation {
       createEvent(name: String) : String
    }

    schema {
      query: RootQuery
      mutation: RootMutaion
    }
  `),
    rootValue: {}
  })
);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
