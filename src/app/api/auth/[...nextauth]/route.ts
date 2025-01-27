import NextAuth, { Session } from "next-auth"
import GithubProvider from "next-auth/providers/github"

interface CustomSession extends Session {
  accessToken?: string
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email repo gist'
        }
      }
    }),
  ],
  callbacks: {
    async jwt({token, account}) {
      if (account) {
        token.accessToken = account.access_token
      }

      return token
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        accessToken: token.accessToken as string
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
})

export { handler as GET, handler as POST }
