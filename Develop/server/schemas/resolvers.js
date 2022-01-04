const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
        try {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id}).select('-__v -password');
                return userData;
            }
    
            throw new AuthenticationError('Please make sure you are logged in!')
        } catch (error) {
            console.error
        }
        
    },
  },


  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { authors, description, bookId, image, link, title }) => {
      const thought = await Book.create({ authors, description, bookId, image, link, title});

      await User.findOneAndUpdate(
        { username: authors },
        { $addToSet: { savedBooks: book._id } }
      );

      return thought;
    },
    removeBook: async (parent, { bookId }, context) => {
      return Book.findOneAndDelete({ _id: bookId });
    },
  },
};

module.exports = resolvers;
