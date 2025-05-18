/**
 * Database Schema for AI-powered Service Business Automation Platform
 *
 * This module defines the database schema for the automation platform using Prisma.
 * It includes models for agents, tasks, workflows, customers, and business data.
 */

import { z } from 'zod'

// Agent Schema
export const agentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'customer_service',
    'scheduling',
    'billing',
    'document',
    'workflow',
  ]),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  capabilities: z.array(z.string()),
  config: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Task Schema
export const taskSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid().nullable(),
  workflowId: z.string().uuid().nullable(),
  type: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  priority: z.number().int().min(1).max(5),
  data: z.record(z.any()),
  result: z.record(z.any()).nullable(),
  error: z.string().nullable(),
  createdAt: z.date(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  deadline: z.date().nullable(),
})

// Workflow Schema
export const workflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  status: z.enum(['active', 'paused', 'completed', 'failed']),
  steps: z.array(
    z.object({
      id: z.string(),
      agentType: z.enum([
        'customer_service',
        'scheduling',
        'billing',
        'document',
        'workflow',
      ]),
      action: z.string(),
      config: z.record(z.any()),
      dependsOn: z.array(z.string()).optional(),
    })
  ),
  data: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
})

// Customer Schema
export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Service Schema
export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  price: z.number().positive(),
  duration: z.number().int().positive(), // in minutes
  category: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Appointment Schema
export const appointmentSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Invoice Schema
export const invoiceSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  dueDate: z.date(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      amount: z.number().positive(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
  paidAt: z.date().nullable(),
})

// Document Schema
export const documentSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  name: z.string().min(1).max(100),
  type: z.string(),
  content: z.string(),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Types derived from schemas
export type Agent = z.infer<typeof agentSchema>
export type Task = z.infer<typeof taskSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type Customer = z.infer<typeof customerSchema>
export type Service = z.infer<typeof serviceSchema>
export type Appointment = z.infer<typeof appointmentSchema>
export type Invoice = z.infer<typeof invoiceSchema>
export type Document = z.infer<typeof documentSchema>
