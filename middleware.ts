/**
 * Middlewareを使用する利点
 * * 認証が通るまでは、保護されたルートのレンダリングが開始されないこと
 * * それにより「セキュリティ」「パフォーマンス」が向上する
 */
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
