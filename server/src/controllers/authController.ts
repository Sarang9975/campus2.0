import { Request, Response } from 'express';
import { User, IUser } from '../models/User.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, branch, year, roles, interests, campusZone } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      branch: branch || 'Computer Science & Engineering',
      year: year || '2nd Year',
      roles: roles || ['UI Designer'],
      interests: interests || ['Hackathons', 'Sports'],
      campusZone: campusZone || 'Main Block',
      verified: true,
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '02:00 PM'] },
        { day: 'Sunday', times: ['11:00 AM', '05:00 PM'] },
      ],
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken(user._id.toString(), user.email);
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        roles: user.roles,
        interests: user.interests,
        campusZone: user.campusZone,
        verified: user.verified,
        avatar: user.avatar,
        participationHistory: user.participationHistory,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ error: 'Invalid email or credentials' });
      return;
    }

    if (password && user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ error: 'Invalid email or credentials' });
        return;
      }
    }

    const token = generateToken(user._id.toString(), user.email);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        roles: user.roles,
        interests: user.interests,
        campusZone: user.campusZone,
        verified: user.verified,
        avatar: user.avatar,
        participationHistory: user.participationHistory,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching user' });
  }
}

export async function switchUser(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'Persona user not found' });
      return;
    }
    const token = generateToken(user._id.toString(), user.email);
    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
