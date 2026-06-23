import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getOrCreateUser } from '../db/queries';
import { env } from '../config/env.ts';

const router = express.Router();
const JWT_SECRET = env.jwtSecret;
const GOOGLE_CLIENT_ID = env.googleClientId;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

interface GenerateTokenParams {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

const generateTokens = (user: GenerateTokenParams) => {
  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// 1. Email/Password Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const uid = crypto.randomUUID();

    const [newUser] = await db.insert(users).values({
      uid,
      email,
      displayName: name,
      passwordHash,
    }).returning();

    const tokens = generateTokens({
      uid: newUser.uid,
      email: newUser.email,
      name: newUser.displayName || undefined,
      picture: newUser.photoUrl || undefined
    });

    res.json({ status: 'success', user: newUser, ...tokens });
  } catch (error: any) {
    console.error('Error in /register:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const matchedUsers = await db.select().from(users).where(eq(users.email, email));
    const userRow = matchedUsers[0];

    if (!userRow || !userRow.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, userRow.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokens = generateTokens({
      uid: userRow.uid,
      email: userRow.email,
      name: userRow.displayName || undefined,
      picture: userRow.photoUrl || undefined
    });

    res.json({ status: 'success', user: userRow, ...tokens });
  } catch (error: any) {
    console.error('Error in /login:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. Google OAuth Login
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body; 
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token missing' });
    }

    // Fetch user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userInfoResponse.ok) {
      return res.status(401).json({ error: 'Invalid Google access token' });
    }

    const payload = await userInfoResponse.json();
    const { sub: googleId, email, name, picture } = payload;
    
    // Utilize googleId as uid, or fetch user
    const matchedUsers = await db.select().from(users).where(eq(users.email, email));
    let userRecord = matchedUsers[0];

    if (!userRecord) {
      // Create user if they don't exist
      userRecord = await getOrCreateUser(googleId, email, name || "", picture || "");
    }

    const tokens = generateTokens({
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName || undefined,
      picture: userRecord.photoUrl || undefined
    });

    res.json({ status: 'success', user: userRecord, ...tokens });
  } catch (error: any) {
    console.error('Error in /google:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 4. Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    jwt.verify(refreshToken, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return res.status(401).json({ error: 'Invalid refresh token' });
      
      const matchedUsers = await db.select().from(users).where(eq(users.uid, decoded.uid));
      const userRow = matchedUsers[0];
      if (!userRow) return res.status(401).json({ error: 'User mapping not found' });

      const newTokens = generateTokens({
        uid: userRow.uid,
        email: userRow.email,
        name: userRow.displayName || undefined,
        picture: userRow.photoUrl || undefined
      });
      res.json({ status: 'success', ...newTokens });
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
