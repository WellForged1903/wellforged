import type { Request, Response } from 'express';
import pool from '../config/db.js';
import MailerService from '../services/mailer.service.js';
import { uploadImageToSupabase } from '../services/supabase.service.js';
import { deepNormalizePaths } from '../utils/assetUtils.js';

export const createGrievance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer_name, email, phone, order_number, category, description, attachment_url } = req.body;

    if (!customer_name || !email || !phone || !order_number || !category || !description) {
      res.status(400).json({ message: 'All fields (Name, Email, Phone, Order Number, Category, and Description) are required.' });
      return;
    }

    // Generate unique Ticket ID in a loop to guarantee uniqueness
    let ticket_id = '';
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      ticket_id = `WF-TKT-${randomDigits}`;
      const check = await pool.query('SELECT 1 FROM grievance_tickets WHERE ticket_id = $1', [ticket_id]);
      if (check.rows.length === 0) {
        isUnique = true;
      }
    }

    const query = `
      INSERT INTO grievance_tickets (ticket_id, customer_name, email, phone, order_number, category, description, attachment_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *;
    `;
    const result = await pool.query(query, [
      ticket_id,
      customer_name,
      email.trim(),
      phone.trim(),
      order_number ? order_number.trim() : null,
      category,
      description.trim(),
      attachment_url || null
    ]);

    const ticket = result.rows[0];

    // Trigger automated email alert in background
    try {
      await MailerService.sendGrievanceReceived(
        ticket.email,
        ticket.customer_name,
        ticket.ticket_id,
        ticket.category
      );
    } catch (emailErr) {
      console.warn('Failed to send grievance receipt email:', emailErr);
    }

    res.status(201).json({
      message: 'Grievance ticket created successfully',
      ticket: deepNormalizePaths(ticket)
    });
  } catch (error: any) {
    console.error('Error creating grievance:', error);
    res.status(500).json({ message: 'Failed to lodge grievance' });
  }
};

export const trackGrievance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticket_id, email, phone } = req.query;

    if (!ticket_id || (!email && !phone)) {
      res.status(400).json({ message: 'Ticket ID and either Email or Phone are required for tracking.' });
      return;
    }

    let query = 'SELECT * FROM grievance_tickets WHERE LOWER(ticket_id) = LOWER($1)';
    const params = [String(ticket_id).trim()];

    if (email) {
      query += ' AND LOWER(email) = LOWER($2)';
      params.push(String(email).trim());
    } else {
      query += ' AND (phone = $2 OR REPLACE(phone, \' \', \'\') = REPLACE($2, \' \', \'\'))';
      params.push(String(phone).trim());
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No matching grievance ticket found with the provided credentials.' });
      return;
    }

    res.json(deepNormalizePaths(result.rows[0]));
  } catch (error: any) {
    console.error('Error tracking grievance:', error);
    res.status(500).json({ message: 'Failed to retrieve ticket status' });
  }
};

export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'No file provided' });
    return;
  }

  try {
    const fileName = `grievance-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const publicUrl = await uploadImageToSupabase(file.buffer, fileName, file.mimetype);
    res.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Error uploading grievance attachment:', error);
    res.status(500).json({ message: error.message || 'Failed to upload attachment' });
  }
};
