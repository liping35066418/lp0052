import type { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
const { compareSync, hashSync } = bcryptjs;
import { users } from '../data/store.js';
import type { User } from '../types/index.js';
import { generateId, toPublicUser } from '../utils/index.js';
import { signToken, getCurrentUser } from '../middleware/auth.js';

export function register(req: Request, res: Response) {
  const { username, email, password } = req.body as {
    username: string;
    email: string;
    password: string;
  };

  if (!username || !email || !password) {
    res.status(400).json({ error: '请填写完整信息' });
    return;
  }

  if (users.find((u) => u.username === username)) {
    res.status(400).json({ error: '用户名已存在' });
    return;
  }
  if (users.find((u) => u.email === email)) {
    res.status(400).json({ error: '邮箱已被注册' });
    return;
  }

  const newUser: User = {
    id: generateId('user'),
    username,
    email,
    passwordHash: hashSync(password, 10),
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const token = signToken({ userId: newUser.id, role: newUser.role, username: newUser.username });
  res.status(201).json({ token, user: toPublicUser(newUser) });
}

export function login(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    res.status(400).json({ error: '请输入用户名和密码' });
    return;
  }

  const user = users.find((u) => u.username === username);
  if (!user || !compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role, username: user.username });
  res.json({ token, user: toPublicUser(user) });
}

export function getMe(req: Request, res: Response) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const user = users.find((u) => u.id === currentUser.userId);
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  res.json({ user: toPublicUser(user) });
}
