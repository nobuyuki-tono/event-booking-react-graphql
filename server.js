const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/Event");

const app = express();

const events = [];

app.use(express.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
       events: [Event!]!
    }

    type RootMutation {
       createEvent(eventInput: EventInput) : Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(result => {
            return result;
          })
          .catch(err => {
            console.log(err);
          });
      },
      createEvent: args => {
        // const event = {
        //   _id: Math.random().toString(),
        //   title: args.eventInput.title,
        //   description: args.eventInput.description,
        //   price: +args.eventInput.price,
        //   date: args.eventInput.date
        // };
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        return event
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@contactkeeper-ty6y0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is running on port 5000 and Connected DB");
    });
  })
  .catch(err => {
    console.log(err);
  });
