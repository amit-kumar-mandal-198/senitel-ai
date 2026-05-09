import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { FirestoreService } from '../services/firebase.service';

/**
 * Profile Routes for Guests and Managers
 * 
 * Middleware used:
 * - authenticate: Verifies JWT token and attaches user to request
 * - checkRole: Verifies if the user has the required role (guest/manager)
 */
export default async function profileRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  
  // Auth Guard Placeholder
  const authenticate = async (request: any, reply: any) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.status(401).send({ message: 'Unauthorized: No token provided' });
      return;
    }
    // In a real app, verify JWT here
    // request.user = decodedToken;
    request.user = { id: 'user_123', role: localStorage.getItem('sentinel_role') }; // Mock
  };

  const checkRole = (role: string) => async (request: any, reply: any) => {
    if (request.user.role !== role) {
      reply.status(403).send({ message: `Forbidden: ${role} access only` });
    }
  };

  // --- GUEST ROUTES ---

  // PATCH /api/guest/profile
  fastify.patch('/api/guest/profile', { preHandler: [authenticate, checkRole('guest')] }, async (request, reply) => {
    const updates = request.body as any;
    
    // Server-side validation
    if (updates.name && updates.name.trim() === '') {
      return reply.status(400).send({ message: 'Name cannot be empty' });
    }

    try {
      // In real app: await FirestoreService.updateUser(request.user.id, updates);
      return { ...updates, id: 'user_123', status: 'updated' };
    } catch (err: any) {
      reply.status(500).send({ message: err.message });
    }
  });

  // PATCH /api/guest/profile/photo
  fastify.patch('/api/guest/profile/photo', { preHandler: [authenticate, checkRole('guest')] }, async (request, reply) => {
    // In real app: use @fastify/multipart to parse file and upload to Cloud Storage/S3
    // const data = await request.file();
    // const photoUrl = await StorageService.upload(data);
    return { photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewPhoto' };
  });

  // --- MANAGER ROUTES ---

  // PATCH /api/manager/profile
  fastify.patch('/api/manager/profile', { preHandler: [authenticate, checkRole('manager')] }, async (request, reply) => {
    const updates = request.body as any;
    try {
      return { ...updates, id: 'manager_123', status: 'updated' };
    } catch (err: any) {
      reply.status(500).send({ message: err.message });
    }
  });

  // POST /api/manager/change-password
  fastify.post('/api/manager/change-password', { preHandler: [authenticate, checkRole('manager')] }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body as any;

    if (!currentPassword || !newPassword) {
      return reply.status(400).send({ message: 'Missing passwords' });
    }

    // Logic: 
    // 1. Fetch user from DB
    // 2. Compare currentPassword with hashed password in DB
    // 3. Hash newPassword
    // 4. Update user in DB
    
    return { success: true, message: 'Password changed successfully' };
  });

  // --- AUTH ROUTES ---

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async (request, reply) => {
    // In real app: blacklist the JWT or clear session cookie
    return { success: true };
  });
}
