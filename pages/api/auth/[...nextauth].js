import bcryptjs from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../models/user';
import db from '../../../utils/db';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?._id) token._id = user._id;
      if (user?.isAdmin) token.isAdmin = user.isAdmin;
      if (user?.firstName) token.firstName = user.firstName;
      if (user?.lastName) token.lastName = user.lastName;
      if (user?.registeredUser) token.registeredUser = user.registeredUser;
      if (user?.phoneNum) token.phoneNum = user.phoneNum;
      return token;
    },
    async session({ session, token }) {
      if (token?._id) session.user._id = token._id;
      if (token?.isAdmin) session.user.isAdmin = token.isAdmin;
      if (token?.firstName) session.user.firstName = token.firstName;
      if (token?.lastName) session.user.lastName = token.lastName;
      if (token?.registeredUser)
        session.user.registeredUser = token.registeredUser;
      if (token?.phoneNum) session.user.phoneNum = token.phoneNum;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect();
        const user = await User.findOne({
          email: credentials.email,
        });
        await db.disconnect();
        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            registeredUser: user.registeredUser,
            phoneNum: user.phoneNum,
          };
        }
        throw new Error('Invalid email or password');
      },
    }),
  ],
});
