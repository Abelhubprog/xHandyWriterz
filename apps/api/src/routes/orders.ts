import { Router, IRouter, Request, Response } from 'express';
import { z } from 'zod';
import { verifyClerkToken } from '../lib/clerk.js';
import crypto from 'crypto';

export const ordersRouter: IRouter = Router();

// In-memory store (replace with DB in production)
const orders: Map<string, Order> = new Map();

// Types
interface Order {
  id: string;
  userId: string;
  service_type: string;
  subject_area: string;
  topic: string;
  word_count: number;
  study_level: string;
  due_date: string;
  instructions: string;
  module?: string;
  status: 'pending' | 'paid' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  price: number;
  currency: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_id?: string;
  attachments: Attachment[];
  channel_id?: string;
  created_at: string;
  updated_at: string;
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  r2_key?: string;
  mm_file_id?: string;
  uploaded_at: string;
}

// Schemas
const createOrderSchema = z.object({
  service_type: z.string().min(1),
  subject_area: z.string().min(1),
  topic: z.string().min(1),
  word_count: z.number().min(250).max(100000),
  study_level: z.string().min(1),
  due_date: z.string(),
  instructions: z.string().optional(),
  module: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('GBP'),
  attachments: z.array(z.object({
    filename: z.string(),
    size: z.number(),
    content_type: z.string(),
    r2_key: z.string().optional(),
    mm_file_id: z.string().optional(),
  })).optional(),
  channel_id: z.string().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'paid', 'in-progress', 'review', 'completed', 'cancelled']).optional(),
  payment_status: z.enum(['unpaid', 'paid', 'refunded']).optional(),
  payment_id: z.string().optional(),
  instructions: z.string().optional(),
});

// Helpers
function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function resolveUser(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
    if (user) {
      return { userId: user.userId };
    }
  }
  return null;
}

/**
 * POST /api/orders
 * Create a new order
 */
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid order data', details: parsed.error.issues });
    }

    const orderId = generateOrderId();
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      userId: user.userId,
      service_type: parsed.data.service_type,
      subject_area: parsed.data.subject_area,
      topic: parsed.data.topic,
      word_count: parsed.data.word_count,
      study_level: parsed.data.study_level,
      due_date: parsed.data.due_date,
      instructions: parsed.data.instructions || '',
      module: parsed.data.module,
      status: 'pending',
      price: parsed.data.price,
      currency: parsed.data.currency,
      payment_status: 'unpaid',
      attachments: (parsed.data.attachments || []).map((a, i) => ({
        id: `${orderId}-att-${i}`,
        filename: a.filename,
        size: a.size,
        content_type: a.content_type,
        r2_key: a.r2_key,
        mm_file_id: a.mm_file_id,
        uploaded_at: now,
      })),
      channel_id: parsed.data.channel_id,
      created_at: now,
      updated_at: now,
    };

    orders.set(orderId, order);

    console.log(`[Orders] Created order ${orderId} for user ${user.userId}`);

    res.status(201).json({
      ok: true,
      order: {
        id: order.id,
        status: order.status,
        price: order.price,
        currency: order.currency,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error('[Orders] Create error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /api/orders/user/:userId
 * Get all orders for a user
 */
ordersRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { userId } = req.params;
    
    // Users can only see their own orders unless admin
    if (user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userOrders = Array.from(orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      orders: userOrders.map(o => ({
        id: o.id,
        service_type: o.service_type,
        subject_area: o.subject_area,
        topic: o.topic,
        word_count: o.word_count,
        study_level: o.study_level,
        due_date: o.due_date,
        status: o.status,
        price: o.price,
        currency: o.currency,
        payment_status: o.payment_status,
        created_at: o.created_at,
        updated_at: o.updated_at,
      })),
      total: userOrders.length,
    });
  } catch (error) {
    console.error('[Orders] List error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:orderId
 * Get a specific order
 */
ordersRouter.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Users can only see their own orders unless admin
    if (order.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('[Orders] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PATCH /api/orders/:orderId
 * Update an order
 */
ordersRouter.patch('/:orderId', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Users can only update their own orders
    if (order.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update data', details: parsed.error.issues });
    }

    // Apply updates
    if (parsed.data.status) order.status = parsed.data.status;
    if (parsed.data.payment_status) order.payment_status = parsed.data.payment_status;
    if (parsed.data.payment_id) order.payment_id = parsed.data.payment_id;
    if (parsed.data.instructions !== undefined) order.instructions = parsed.data.instructions;
    order.updated_at = new Date().toISOString();

    orders.set(orderId, order);

    console.log(`[Orders] Updated order ${orderId}`);

    res.json({ ok: true, order });
  } catch (error) {
    console.error('[Orders] Update error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/**
 * POST /api/orders/:orderId/pay
 * Initiate payment for an order
 */
ordersRouter.post('/:orderId/pay', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const { provider } = req.body;
    if (!provider || !['stripe', 'paypal', 'stablelink', 'coinbase'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid payment provider' });
    }

    // Generate payment session ID
    const sessionId = `${provider}_${orderId}_${Date.now()}`;
    
    // Store session reference
    order.payment_id = sessionId;
    order.updated_at = new Date().toISOString();
    orders.set(orderId, order);

    // Build return URLs
    const baseUrl = process.env.WEB_URL || 'https://handywriterz.com';
    const returnUrl = `${baseUrl}/payment/success?order=${orderId}&session=${sessionId}`;
    const cancelUrl = `${baseUrl}/payment/cancel?order=${orderId}`;

    // Generate provider-specific checkout URL
    let checkoutUrl: string;
    
    switch (provider) {
      case 'stripe':
        // In production: Use Stripe Checkout Sessions API
        checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}?return_url=${encodeURIComponent(returnUrl)}`;
        break;
      case 'paypal':
        checkoutUrl = `https://www.paypal.com/checkoutnow?token=${sessionId}`;
        break;
      case 'stablelink':
        checkoutUrl = `https://pay.stablelink.io/checkout/${sessionId}`;
        break;
      case 'coinbase':
        checkoutUrl = `https://commerce.coinbase.com/checkout/${sessionId}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json({
      ok: true,
      sessionId,
      checkoutUrl,
      orderId,
      amount: order.price,
      currency: order.currency,
    });
  } catch (error) {
    console.error('[Orders] Pay error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

/**
 * POST /api/orders/:orderId/confirm-payment
 * Confirm payment for an order (called after webhook or redirect)
 */
ordersRouter.post('/:orderId/confirm-payment', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { sessionId, provider } = req.body;

    const order = orders.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify session matches
    if (order.payment_id !== sessionId) {
      return res.status(400).json({ error: 'Invalid payment session' });
    }

    // In production: Verify payment with provider API
    // For now, mark as paid
    order.payment_status = 'paid';
    order.status = 'paid';
    order.updated_at = new Date().toISOString();
    orders.set(orderId, order);

    console.log(`[Orders] Payment confirmed for ${orderId}`);

    res.json({
      ok: true,
      order: {
        id: order.id,
        status: order.status,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    console.error('[Orders] Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

/**
 * DELETE /api/orders/:orderId
 * Cancel an order
 */
ordersRouter.delete('/:orderId', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel pending/unpaid orders
    if (order.payment_status === 'paid' && order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel paid orders. Please request a refund.' });
    }

    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();
    orders.set(orderId, order);

    console.log(`[Orders] Cancelled order ${orderId}`);

    res.json({ ok: true, message: 'Order cancelled' });
  } catch (error) {
    console.error('[Orders] Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

/**
 * GET /api/orders/admin/all
 * Get all orders (admin only)
 */
ordersRouter.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Check admin role from Clerk metadata
    // For now, return all orders

    const allOrders = Array.from(orders.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const { status, page = '1', limit = '20' } = req.query;
    
    let filtered = allOrders;
    if (status && typeof status === 'string') {
      filtered = allOrders.filter(o => o.status === status);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
      orders: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(filtered.length / limitNum),
    });
  } catch (error) {
    console.error('[Orders] Admin list error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * PATCH /api/orders/admin/:orderId/status
 * Update order status (admin only)
 */
ordersRouter.patch('/admin/:orderId/status', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Check admin role

    const { orderId } = req.params;
    const { status } = req.body;

    const order = orders.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!['pending', 'paid', 'in-progress', 'review', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    order.status = status;
    order.updated_at = new Date().toISOString();
    orders.set(orderId, order);

    console.log(`[Orders] Admin updated order ${orderId} to status: ${status}`);

    res.json({ ok: true, order });
  } catch (error) {
    console.error('[Orders] Admin update error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});
