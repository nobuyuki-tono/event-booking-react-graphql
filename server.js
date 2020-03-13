const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/Event");
const User = require("./models/User");

const app = express();

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

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String
      password: String!
    }

    type RootQuery {
       events: [Event!]!
    }

    type RootMutation {
       createEvent(eventInput: EventInput) : Event
       createUser(userInput: UserInput): User
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
          date: new Date(args.eventInput.date),
          creator: "5e6c0c49d2a1fc0cdb76086e"
        });
        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = result;
            return User.findById("5e6c0c49d2a1fc0cdb76086e");
            console.log(result);
            return result;
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found");
            }

            console.log("@@@@", user);

            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },

      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error("User exists already.");
            }

            return bcrypt.hash(args.userInput.password, 12);
          })

          .then(hasshedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hasshedPassword
            });
            return user.save();
          })
          .then(result => {
            return result;
          })
          .catch(err => {
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
