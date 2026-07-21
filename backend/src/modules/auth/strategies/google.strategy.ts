import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: `${configService.get<string>('BACKEND_URL')}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
      passReqToCallback: false,
      // scope: what we are asking Google for permission to read.
      // 'email' gives us the user's email address.
      // 'profile' gives us their name and avatar URL.
      // We do NOT request 'openid' — we don't need an ID token, just the profile.
    });
  }

  async validate(
    accessToken: string,        // Google's access token — we don't store or use this
    refreshToken: string,       // Google's refresh token — we don't store or use this
    profile: Profile,           // The user's Google profile data
    done: VerifyCallback,       // Passport's callback: done(error, user)
  ): Promise<void> {
    // Extract the fields we care about from the Google profile object.
    // profile.emails[0].value is the primary Google email.
    // profile.photos[0].value is the profile picture URL.
    // These arrays CAN be undefined if Google doesn't return them — handle that safely.

    const googleUser = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };

    // Pass the extracted data to Passport.
    // done(null, data) means success — Passport attaches this to request.user
    // done(error, false) means failure — Passport will throw an error
    done(null, googleUser);
    // NOTE: We do NOT do the database upsert here.
    // validate() is intentionally minimal — it just extracts and normalizes
    // the Google profile data. The actual DB logic lives in AuthService.
    // This keeps the strategy pure (data extraction only) and the service
    // testable (no Passport dependency in the test).
  }
}
